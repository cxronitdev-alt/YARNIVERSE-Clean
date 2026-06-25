import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; 
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { 
  Wallet, CreditCard, Banknote, RefreshCcw, Calendar, 
  Search, ChevronDown, ArrowUpDown, TrendingUp, MoreHorizontal
} from "lucide-react";

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState("TODAY");
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortNewest, setSortNewest] = useState(true);

  // --- REAL-TIME DATA FETCH FROM 'orders' COLLECTION ---
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("orderDate", "desc")); 
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(data);
    }, (error) => {
      console.error("Firebase Error: Data fetch nahi ho raha!", error);
    });

    return () => unsubscribe();
  }, []);

  // --- METRICS LOGIC ---
  const successfulTransactions = transactions.filter((t) => {
    const s = (t.status || "").toUpperCase();
    return s === "DELIVERED"; 
  });

  const totalRevenue = successfulTransactions.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const onlinePayments = successfulTransactions.filter(t => (t.paymentMethod || "").toUpperCase() !== "CASH ON DELIVERY").reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const codPayments = successfulTransactions.filter(t => (t.paymentMethod || "").toUpperCase() === "CASH ON DELIVERY").reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  const pendingRefunds = transactions.filter(t => (t.paymentStatus || "").toUpperCase().includes("REFUND")).length; 

  // --- DYNAMIC REVENUE CALCULATION ---
  const calculatePeriodRevenue = () => {
    const now = new Date();
    let startDate = new Date();

    if (revenuePeriod === "TODAY") {
      startDate.setHours(0, 0, 0, 0); 
    } else if (revenuePeriod === "THIS WEEK") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
    } else if (revenuePeriod === "THIS MONTH") {
      startDate.setDate(1); 
      startDate.setHours(0, 0, 0, 0);
    } else if (revenuePeriod === "THIS YEAR") {
      startDate.setMonth(0, 1); 
      startDate.setHours(0, 0, 0, 0);
    }

    const periodTransactions = successfulTransactions.filter(tx => {
      if (!tx.orderDate || !tx.orderDate.toDate) return false;
      const txDate = tx.orderDate.toDate();
      return txDate >= startDate && txDate <= now;
    });

    return periodTransactions.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  };

  const periodRevenueAmount = calculatePeriodRevenue();

  // --- FILTER LOGIC ---
  const filteredTransactions = transactions.filter(t => {
    const customerName = t.customerInfo ? `${t.customerInfo.firstName} ${t.customerInfo.lastName}` : "";
    const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const isCod = (t.paymentMethod || "").toUpperCase() === "CASH ON DELIVERY";
    const currentMethod = isCod ? "COD" : "ONLINE";
    const matchesMethod = methodFilter === "ALL" || currentMethod === methodFilter;
    const matchesStatus = statusFilter === "ALL" || (t.status || "").toUpperCase() === statusFilter;
    
    return matchesSearch && matchesMethod && matchesStatus;
  }).sort((a, b) => sortNewest ? -1 : 1);

  // Reusable Unique Card Component
  const MetricCard = ({ title, amount, icon: Icon, colorClass, isCurrency = true }) => (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
      <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ${colorClass.bg}`}></div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
            <Icon size={18} />
          </div>
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{title}</span>
        </div>
        <MoreHorizontal size={16} className="text-gray-300" />
      </div>
      <div>
        <h3 className="text-3xl font-black text-gray-800 tracking-tight truncate" title={isCurrency ? `₹${amount.toLocaleString()}` : amount}>
          {isCurrency ? "₹" : ""}{isCurrency ? amount.toLocaleString() : amount}
        </h3>
        <p className="text-[10px] font-semibold text-gray-400 mt-2 flex items-center gap-1">
          <TrendingUp size={12} className={isCurrency && amount > 0 ? "text-emerald-500" : "text-gray-400"} /> 
          <span>Updated Real-time</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-6 lg:p-8 font-sans w-full max-w-[100vw] overflow-x-hidden">
      
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payments Hub</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage your transactions and revenue.</p>
        </div>
        
        {/* Modern Dynamic Period Selector positioned at the top right instead of inside a card */}
        <div className="flex items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100 gap-3 w-full md:w-auto">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Calendar size={18} />
          </div>
          <div className="flex flex-col pr-2 flex-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Period Revenue</span>
            <div className="flex items-center justify-between gap-4">
               <span className="text-lg font-black text-gray-900">₹{periodRevenueAmount.toLocaleString()}</span>
               <div className="relative">
                  <select 
                    value={revenuePeriod}
                    onChange={(e) => setRevenuePeriod(e.target.value)}
                    className="appearance-none bg-gray-50 text-indigo-600 pl-3 pr-8 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-indigo-100 border border-gray-200"
                  >
                    <option value="TODAY">Today</option>
                    <option value="THIS WEEK">This Week</option>
                    <option value="THIS MONTH">This Month</option>
                    <option value="THIS YEAR">This Year</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEW METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard 
          title="Total Revenue" amount={totalRevenue} icon={Wallet} 
          colorClass={{ bg: 'bg-emerald-100', text: 'text-emerald-600' }} 
        />
        <MetricCard 
          title="Online Payments" amount={onlinePayments} icon={CreditCard} 
          colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }} 
        />
        <MetricCard 
          title="COD Payments" amount={codPayments} icon={Banknote} 
          colorClass={{ bg: 'bg-amber-100', text: 'text-amber-600' }} 
        />
        <MetricCard 
          title="Pending Refunds" amount={pendingRefunds} icon={RefreshCcw} isCurrency={false}
          colorClass={{ bg: 'bg-rose-100', text: 'text-rose-600' }} 
        />
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 text-sm font-medium text-gray-700 rounded-xl pl-11 pr-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 md:flex gap-3">
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="w-full md:w-auto bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-600 uppercase rounded-xl px-4 py-3 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-100">
            <option value="ALL">Method: All</option>
            <option value="ONLINE">Online</option>
            <option value="COD">COD</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-auto bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-600 uppercase rounded-xl px-4 py-3 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-100">
            <option value="ALL">Status: All</option>
            <option value="DELIVERED">Delivered</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button onClick={() => setSortNewest(!sortNewest)} className="col-span-2 w-full md:w-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-[11px] font-bold uppercase px-6 py-3 rounded-xl transition-colors">
            <ArrowUpDown size={14} /> {sortNewest ? "Newest First" : "Oldest First"}
          </button>
        </div>
      </div>

      {/* NEW DATA TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[800px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Order ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Customer Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Method</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const customerName = tx.customerInfo ? `${tx.customerInfo.firstName} ${tx.customerInfo.lastName}` : "Unknown Customer";
                  const isCod = (tx.paymentMethod || "").toUpperCase() === "CASH ON DELIVERY";
                  const displayMethod = isCod ? "COD" : "ONLINE";
                  
                  return (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">#{tx.id.slice(0,6)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{customerName}</span>
                          {tx.customerInfo?.email && <span className="text-xs text-gray-500">{tx.customerInfo.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-black text-gray-900">₹{Number(tx.totalAmount || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border ${!isCod ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}>
                          {displayMethod}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${(tx.status || "").toUpperCase() === 'DELIVERED' ? 'bg-emerald-500' : (tx.status || "").toUpperCase().includes('CANCEL') ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                           <span className="text-xs font-bold text-gray-700 uppercase">{tx.status || "PENDING"}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                        {tx.orderDate?.toDate ? new Date(tx.orderDate.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'}) : "Just Now"}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No transactions found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search term.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}