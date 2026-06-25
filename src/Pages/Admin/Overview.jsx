import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; 
import { collection, onSnapshot } from "firebase/firestore"; 
import { Download, DollarSign, ShoppingBag, Users, Clock, TrendingUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Modern Softer Colors for Category Charts & Bars
const CHART_COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#14b8a6', '#f43f5e'];

export default function Overview() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0); 

  const [selectedSource, setSelectedSource] = useState("ORDERS");
  const [selectedPeriod, setSelectedPeriod] = useState("ALL_TIME");

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setTotalCustomers(snapshot.size);
    }, () => console.log("Fallback to unique orders for customers"));

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeUsers();
    };
  }, []);

  const totalSales = orders
    .filter(o => (o.status || "").toUpperCase() === "DELIVERED")
    .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
  
  const pendingOrders = orders.filter(o => (o.status || "").toUpperCase() === "PENDING").length;
  const activeCustomersCount = totalCustomers > 0 ? totalCustomers : new Set(orders.map(o => o.customerInfo?.email).filter(Boolean)).size;

  // --- DYNAMIC CHART DATA PREPARATION ---
  const getMonthlyData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyStats = months.reduce((acc, month) => ({ ...acc, [month]: { name: month, sales: 0, orders: 0 } }), {});

    orders.forEach(o => {
      if (o.orderDate?.toDate) {
        const date = o.orderDate.toDate();
        const monthName = months[date.getMonth()];
        monthlyStats[monthName].orders += 1;
        if ((o.status || "").toUpperCase() === "DELIVERED") {
          monthlyStats[monthName].sales += (Number(o.totalAmount) || 0);
        }
      }
    });
    return Object.values(monthlyStats);
  };
  const dynamicSalesData = getMonthlyData();

  const getCategoryData = () => {
    const catCounts = {};
    products.forEach(p => {
      const cat = p.category || "Uncategorized";
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    return Object.keys(catCounts).map((key, index) => ({
      name: key,
      value: catCounts[key],
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };
  const dynamicCategoryData = getCategoryData();

  // --- PREMIUM SALES BY CATEGORY LOGIC ---
  const getCategorySalesData = () => {
    const catSales = {};
    let totalSalesAmount = 0;

    orders.forEach(o => {
      if ((o.status || "").toUpperCase() === "DELIVERED" && Array.isArray(o.items)) {
        o.items.forEach(item => {
          const cat = item.category || "Uncategorized";
          const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
          
          catSales[cat] = (catSales[cat] || 0) + itemTotal;
          totalSalesAmount += itemTotal;
        });
      }
    });

    return Object.keys(catSales).map((key, index) => ({
      name: key,
      value: catSales[key],
      percentage: totalSalesAmount > 0 ? ((catSales[key] / totalSalesAmount) * 100).toFixed(1) : 0,
      color: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.value - a.value); 
  };
  const dynamicCategorySalesData = getCategorySalesData();

  // Clean Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label, isCurrency }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
          <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
          <p className="text-sm font-black text-gray-800">
            {isCurrency ? `₹${payload[0].value.toLocaleString()}` : payload[0].value} {payload[0].name === "orders" ? "Orders" : ""}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8 max-w-[100vw] overflow-x-hidden font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
            <Download size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Analytics Dashboard</h1>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Store Overview & Reports</p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
          <select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)} className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer">
            <option value="ORDERS">ORDERS</option>
            <option value="PRODUCTS">PRODUCTS</option>
          </select>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer">
            <option value="ALL_TIME">ALL TIME</option>
            <option value="MONTHLY">MONTHLY</option>
          </select>
          <button className="bg-[#1a1c29] hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md active:scale-95">
            Download PDF
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform"><DollarSign size={20} /></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900 truncate" title={`₹${totalSales.toLocaleString()}`}>₹{totalSales.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform"><ShoppingBag size={20} /></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Orders</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900">{orders.length}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform"><Users size={20} /></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customers</p>
          </div>
          <h3 className="text-3xl font-black text-gray-900">{activeCustomersCount}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-110 transition-transform"><Clock size={20} /></div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pending</p>
          </div>
          <h3 className="text-3xl font-black text-rose-500">{pendingOrders}</h3>
        </div>
      </div>

      {/* CHARTS GRID ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sales Area Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Revenue Trend</h3>
            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Sales</span>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicSalesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 600}} tickFormatter={(val) => val >= 1000 ? `₹${val/1000}k` : `₹${val}`} />
                <RechartsTooltip content={<CustomTooltip isCurrency={true} />} cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Split Donut Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Inventory Split</h3>
            <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Products</span>
          </div>
          <div className="w-full h-[280px] flex items-center justify-center">
             {dynamicCategoryData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dynamicCategoryData} cx="50%" cy="50%" innerRadius={85} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
                    {dynamicCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip isCurrency={false} />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
             ) : (
               <p className="text-xs font-bold text-gray-400">Loading Categories...</p>
             )}
          </div>
        </div>
      </div>

      {/* CHARTS GRID ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Orders Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Orders Volume</h3>
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Monthly</span>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicSalesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 600}} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11, fontWeight: 600}} />
                <RechartsTooltip content={<CustomTooltip isCurrency={false} />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Premium Category Sales Progress Bars (Replaces 2nd Donut Chart) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Sales by Category</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Top Performing Assets</p>
            </div>
            <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">Revenue</span>
          </div>
          
          <div className="flex-1 w-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '280px' }}>
             {dynamicCategorySalesData.length > 0 ? (
               dynamicCategorySalesData.map((item, index) => (
                 <div key={index} className="flex flex-col gap-2 group">
                    <div className="flex justify-between items-end">
                       <span className="text-sm font-bold text-gray-700">{item.name}</span>
                       <span className="text-sm font-black text-gray-900">₹{item.value.toLocaleString()}</span>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                       <div 
                         className="h-full rounded-full transition-all duration-1000 ease-out relative"
                         style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                       >
                          <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                       </div>
                    </div>
                    
                    <span className="text-[9px] font-bold text-gray-400 text-right">
                      {item.percentage}% OF TOTAL REVENUE
                    </span>
                 </div>
               ))
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No Sales Data Yet</p>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}