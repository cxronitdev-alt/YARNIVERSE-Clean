// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { db } from "../../firebase/firebase";
// import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
// import { Wallet, IndianRupee, ArrowUpRight, Clock, CheckCircle, AlertCircle, Landmark, X, ShieldCheck, Building2, CreditCard, UserCircle } from "lucide-react";

// export default function VendorPayouts() {
//   const { user } = useAuth();
  
//   // Real-time Data States
//   const [orders, setOrders] = useState([]);
//   const [payouts, setPayouts] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   // UI States
//   const [toast, setToast] = useState({ show: false, message: "", type: "success" });
//   const [isModalOpen, setIsModalOpen] = useState(false);
  
//   // Form States
//   const [withdrawAmount, setWithdrawAmount] = useState("");
//   const [payoutMethod, setPayoutMethod] = useState("UPI");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Separate states for payment details
//   const [upiId, setUpiId] = useState("");
//   const [bankDetails, setBankDetails] = useState({
//     accountName: "",
//     accountNumber: "",
//     ifscCode: "",
//     bankName: ""
//   });

//   const ADMIN_COMMISSION_PERCENT = 10;
//   const MIN_WITHDRAWAL = 500; // Minimum withdrawal limit

//   // 🚀 REAL-TIME DATA FETCHING
//   useEffect(() => {
//     if (!user) return;

//     const qOrders = query(collection(db, "orders"), where("vendorId", "==", user.uid));
//     const unsubOrders = onSnapshot(qOrders, (snapshot) => {
//       const fetchedOrders = snapshot.docs.map(doc => doc.data());
//       setOrders(fetchedOrders);
//     });

//     const qPayouts = query(collection(db, "payouts"), where("vendorId", "==", user.uid));
//     const unsubPayouts = onSnapshot(qPayouts, (snapshot) => {
//       const fetchedPayouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       fetchedPayouts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
//       setPayouts(fetchedPayouts);
//       setLoading(false);
//     });

//     return () => {
//       unsubOrders();
//       unsubPayouts();
//     };
//   }, [user]);

//   // 🧮 CALCULATIONS
//   const totalSales = orders
//     .filter(order => order.status === "Delivered")
//     .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

//   const adminCommission = (totalSales * ADMIN_COMMISSION_PERCENT) / 100;
//   const netEarnings = totalSales - adminCommission;

//   const totalWithdrawn = payouts
//     .filter(p => p.status === "Completed")
//     .reduce((sum, p) => sum + Number(p.amount), 0);

//   const pendingPayouts = payouts
//     .filter(p => p.status === "Pending")
//     .reduce((sum, p) => sum + Number(p.amount), 0);

//   const availableBalance = netEarnings - totalWithdrawn - pendingPayouts;
  
//   // Status check for UI
//   const isBalanceSufficient = availableBalance >= MIN_WITHDRAWAL;

//   // TOAST HANDLER
//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
//   };

//   // SUBMIT REQUEST
//   const handleRequestPayout = async (e) => {
//     e.preventDefault();
//     const amount = Number(withdrawAmount);

//     // Custom JS Validation (Fixes the HTML min/max tooltip issue)
//     if (amount < MIN_WITHDRAWAL) return showToast(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`, "error");
//     if (amount > availableBalance) return showToast("Amount exceeds available balance!", "error");
    
//     let finalDetails = "";

//     if (payoutMethod === "UPI") {
//       if (!upiId.trim()) return showToast("Please enter a valid UPI ID", "error");
//       finalDetails = `UPI ID: ${upiId}`;
//     } else {
//       if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
//         return showToast("Please fill all bank details", "error");
//       }
//       finalDetails = `Bank: ${bankDetails.bankName} | A/C Name: ${bankDetails.accountName} | A/C No: ${bankDetails.accountNumber} | IFSC: ${bankDetails.ifscCode}`;
//     }

//     setIsSubmitting(true);
//     try {
//       await addDoc(collection(db, "payouts"), {
//         vendorId: user.uid,
//         amount: amount,
//         method: payoutMethod,
//         details: finalDetails,
//         status: "Pending",
//         createdAt: Date.now(),
//         timestamp: serverTimestamp()
//       });

//       await addDoc(collection(db, "notifications"), {
//         type: "payout_request",
//         message: `New payout request of ₹${amount} from Vendor`,
//         vendorId: "admin",
//         read: false,
//         createdAt: Date.now()
//       });

//       showToast("Payout request submitted successfully!");
//       setIsModalOpen(false);
//       setWithdrawAmount("");
//       setUpiId("");
//       setBankDetails({ accountName: "", accountNumber: "", ifscCode: "", bankName: "" });
//     } catch (error) {
//       console.error("Payout error:", error);
//       showToast("Failed to submit request", "error");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     if (status === "Pending") return "bg-amber-50 text-amber-700 border-amber-200";
//     if (status === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
//     if (status === "Rejected") return "bg-red-50 text-red-700 border-red-200";
//     return "bg-gray-50 text-gray-700 border-gray-200";
//   };

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up relative">
      
//       {/* 🟢 TOAST NOTIFICATION */}
//       {toast.show && (
//         <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-3 rounded-xl shadow-xl border ${
//           toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
//         }`}>
//           {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
//           <span className="font-bold text-sm">{toast.message}</span>
//         </div>
//       )}

//       {/* 💸 PAYOUT REQUEST MODAL (Scrollable & Responsive) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-modalSlideIn">
            
//             <div className="bg-gradient-to-r from-[#3b2416] to-[#5a3d28] p-5 sm:p-6 flex justify-between items-center text-white shrink-0">
//               <h3 className="font-serif font-bold text-lg sm:text-xl flex items-center gap-2">
//                 <Landmark size={20} className="text-[#c4a35a]" /> Request Withdrawal
//               </h3>
//               <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white transition-colors"><X size={24}/></button>
//             </div>
            
//             <div className="overflow-y-auto custom-scrollbar p-5 sm:p-6">
//               <form onSubmit={handleRequestPayout} className="space-y-5">
                
//                 {/* Balance Display */}
//                 <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex justify-between items-center">
//                   <span className="text-sm font-bold text-orange-800">Available Balance</span>
//                   <span className="text-lg sm:text-xl font-black text-[#3b2416]">₹{availableBalance.toLocaleString('en-IN')}</span>
//                 </div>

//                 {/* Insufficient Balance Warning */}
//                 {!isBalanceSufficient && (
//                   <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-2">
//                     <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
//                     <p className="text-xs text-red-700 font-medium">
//                       You need at least <b>₹{MIN_WITHDRAWAL}</b> in your available balance to request a withdrawal. Keep selling!
//                     </p>
//                   </div>
//                 )}

//                 {/* Amount Input */}
//                 <div>
//                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Withdrawal Amount (₹)</label>
//                   <input 
//                     type="number" 
//                     required 
//                     disabled={!isBalanceSufficient}
//                     value={withdrawAmount} 
//                     onChange={(e) => setWithdrawAmount(e.target.value)}
//                     placeholder={`Min ₹${MIN_WITHDRAWAL}`} 
//                     className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#c4a35a] outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                   />
//                 </div>

//                 {/* Method Toggle */}
//                 <div className={!isBalanceSufficient ? "opacity-50 pointer-events-none" : ""}>
//                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Payout Method</label>
//                   <div className="grid grid-cols-2 gap-3">
//                     <label className={`border rounded-xl p-3 text-center cursor-pointer font-bold transition-all text-sm ${payoutMethod === "UPI" ? "border-[#3b2416] bg-[#3b2416]/5 text-[#3b2416]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
//                       <input type="radio" name="method" value="UPI" checked={payoutMethod === "UPI"} onChange={() => setPayoutMethod("UPI")} className="hidden" />
//                       UPI
//                     </label>
//                     <label className={`border rounded-xl p-3 text-center cursor-pointer font-bold transition-all text-sm ${payoutMethod === "Bank" ? "border-[#3b2416] bg-[#3b2416]/5 text-[#3b2416]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
//                       <input type="radio" name="method" value="Bank" checked={payoutMethod === "Bank"} onChange={() => setPayoutMethod("Bank")} className="hidden" />
//                       Bank Transfer
//                     </label>
//                   </div>
//                 </div>

//                 {/* Conditional Inputs based on Method */}
//                 <div className={`space-y-4 ${!isBalanceSufficient ? "opacity-50 pointer-events-none" : ""}`}>
//                   {payoutMethod === "UPI" ? (
//                     <div>
//                       <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">UPI ID</label>
//                       <input 
//                         type="text" required={payoutMethod === "UPI"}
//                         value={upiId} onChange={(e) => setUpiId(e.target.value)}
//                         placeholder="e.g. yourname@okhdfc" 
//                         className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-[#c4a35a] outline-none text-sm"
//                       />
//                     </div>
//                   ) : (
//                     <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
//                       <div>
//                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1"><Building2 size={12}/> Bank Name</label>
//                         <input type="text" required={payoutMethod === "Bank"} placeholder="e.g. State Bank of India" value={bankDetails.bankName} onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c4a35a] outline-none text-sm bg-white" />
//                       </div>
//                       <div>
//                         <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1"><UserCircle size={12}/> Account Holder Name</label>
//                         <input type="text" required={payoutMethod === "Bank"} placeholder="Name as per bank record" value={bankDetails.accountName} onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c4a35a] outline-none text-sm bg-white" />
//                       </div>
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                         <div>
//                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-1"><CreditCard size={12}/> Account Number</label>
//                           <input type="text" required={payoutMethod === "Bank"} placeholder="Account No." value={bankDetails.accountNumber} onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c4a35a] outline-none text-sm bg-white" />
//                         </div>
//                         <div>
//                           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">IFSC Code</label>
//                           <input type="text" required={payoutMethod === "Bank"} placeholder="e.g. SBIN0001234" value={bankDetails.ifscCode} onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})} className="w-full border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-[#c4a35a] outline-none text-sm bg-white uppercase" />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <button 
//                   type="submit" disabled={isSubmitting || !isBalanceSufficient}
//                   className="w-full py-3.5 bg-[#3b2416] text-white rounded-xl font-bold tracking-wider uppercase text-sm hover:bg-[#2c1a10] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg mt-2"
//                 >
//                   {isSubmitting ? "Processing..." : "Confirm Request"}
//                 </button>
                
//                 <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1 pt-1">
//                   <ShieldCheck size={12} /> Secure encrypted transaction
//                 </p>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 👑 HEADER */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Wallet & Payouts</h1>
//           <p className="text-sm md:text-base text-gray-500 mt-1">Manage your earnings and withdrawals</p>
//         </div>
//         <button 
//           onClick={() => setIsModalOpen(true)}
//           className="bg-gradient-to-r from-[#c4a35a] to-[#e5c97a] hover:from-[#b59550] hover:to-[#d4b96a] text-[#3b2416] px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#c4a35a]/20"
//         >
//           <Landmark size={18} /> Request Payout
//         </button>
//       </div>

//       {/* 📊 PREMIUM WALLET STATS */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
//         {/* Available Balance */}
//         <div className="bg-gradient-to-br from-[#3b2416] to-[#5a3d28] p-6 rounded-2xl shadow-xl relative overflow-hidden group">
//           <div className="flex justify-between items-start mb-4 relative z-10">
//             <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 text-[#c4a35a]">
//               <Wallet size={24} />
//             </div>
//           </div>
//           <div className="relative z-10 text-white">
//             <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-white/70">Available Balance</h3>
//             <p className="text-3xl font-black tracking-tight">₹{availableBalance.toLocaleString('en-IN')}</p>
//           </div>
//           <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
//         </div>

//         {/* Net Earnings */}
//         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//           <div className="flex justify-between items-start mb-4">
//             <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600"><IndianRupee size={24} /></div>
//             <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-gray-50 text-gray-500">After 10% Comm.</span>
//           </div>
//           <div>
//             <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">Net Earnings</h3>
//             <p className="text-2xl font-bold text-gray-900">₹{netEarnings.toLocaleString('en-IN')}</p>
//           </div>
//         </div>

//         {/* Pending Payouts */}
//         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//           <div className="flex justify-between items-start mb-4">
//             <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600"><Clock size={24} /></div>
//           </div>
//           <div>
//             <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">Pending Requests</h3>
//             <p className="text-2xl font-bold text-gray-900">₹{pendingPayouts.toLocaleString('en-IN')}</p>
//           </div>
//         </div>

//         {/* Total Withdrawn */}
//         <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
//           <div className="flex justify-between items-start mb-4">
//             <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600"><ArrowUpRight size={24} /></div>
//           </div>
//           <div>
//             <h3 className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">Total Withdrawn</h3>
//             <p className="text-2xl font-bold text-gray-900">₹{totalWithdrawn.toLocaleString('en-IN')}</p>
//           </div>
//         </div>

//       </div>

//       {/* 📜 PAYOUT HISTORY TABLE */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         <div className="p-5 border-b border-gray-50 bg-gray-50/30">
//           <h2 className="text-lg font-bold text-gray-900 font-serif">Withdrawal History</h2>
//         </div>
        
//         {loading ? (
//           <div className="p-16 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#3b2416] border-t-transparent"></div></div>
//         ) : payouts.length === 0 ? (
//           <div className="p-16 text-center">
//             <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
//             <p className="text-gray-500 font-medium">No payout requests yet.</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[700px]">
//               <thead>
//                 <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-black">
//                   <th className="p-5 pl-6">Req. ID & Date</th>
//                   <th className="p-5">Amount</th>
//                   <th className="p-5">Details</th>
//                   <th className="p-5 text-right pr-6">Status</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {payouts.map((payout) => (
//                   <tr key={payout.id} className="hover:bg-orange-50/30 transition-colors">
//                     <td className="p-5 pl-6">
//                       <div className="font-bold text-gray-900 uppercase">#{payout.id.slice(0,8)}</div>
//                       <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
//                         <Clock size={12} /> {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : "Recent"}
//                       </div>
//                     </td>
//                     <td className="p-5 font-black text-[#3b2416]">
//                       ₹{Number(payout.amount).toLocaleString('en-IN')}
//                     </td>
//                     <td className="p-5">
//                       <div className="text-xs text-gray-600 font-medium bg-gray-50 p-2 rounded-lg max-w-xs break-words border border-gray-100">
//                         {payout.details}
//                       </div>
//                     </td>
//                     <td className="p-5 text-right pr-6">
//                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(payout.status)}`}>
//                         {payout.status === "Pending" && <Clock size={12} />}
//                         {payout.status === "Completed" && <CheckCircle size={12} />}
//                         {payout.status === "Rejected" && <AlertCircle size={12} />}
//                         {payout.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes modalSlideIn {
//           from { opacity: 0; transform: scale(0.95) translateY(10px); }
//           to { opacity: 1; transform: scale(1) translateY(0); }
//         }
//         .animate-modalSlideIn { animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
//         .custom-scrollbar::-webkit-scrollbar { width: 5px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
//       `}</style>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Wallet, IndianRupee, ArrowUpRight, Clock, CheckCircle, AlertCircle, 
  Landmark, X, ShieldCheck, Building2, CreditCard, UserCircle,
  TrendingUp, History, Loader2, Info, Smartphone
} from "lucide-react";

export default function VendorPayouts() {
  const { user } = useAuth();
  
  // Real-time Data States
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Form States
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("UPI");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment details
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: ""
  });

  const ADMIN_COMMISSION_PERCENT = 10;
  const MIN_WITHDRAWAL = 500;

  // 🚀 REAL-TIME DATA FETCHING
  useEffect(() => {
    if (!user) return;

    const qOrders = query(collection(db, "orders"), where("vendorId", "==", user.uid));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => doc.data());
      setOrders(fetchedOrders);
    });

    const qPayouts = query(collection(db, "payouts"), where("vendorId", "==", user.uid));
    const unsubPayouts = onSnapshot(qPayouts, (snapshot) => {
      const fetchedPayouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedPayouts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPayouts(fetchedPayouts);
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubPayouts();
    };
  }, [user]);

  // 🧮 CALCULATIONS
  const totalSales = orders
    .filter(order => order.status === "Delivered")
    .reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);

  const adminCommission = (totalSales * ADMIN_COMMISSION_PERCENT) / 100;
  const netEarnings = totalSales - adminCommission;

  const totalWithdrawn = payouts
    .filter(p => p.status === "Completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingPayouts = payouts
    .filter(p => p.status === "Pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const availableBalance = netEarnings - totalWithdrawn - pendingPayouts;
  const isBalanceSufficient = availableBalance >= MIN_WITHDRAWAL;

  // Filter payouts
  const filteredPayouts = statusFilter === "All" 
    ? payouts 
    : payouts.filter(p => p.status === statusFilter);

  // TOAST HANDLER
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // SUBMIT REQUEST
  const handleRequestPayout = async (e) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);

    if (amount < MIN_WITHDRAWAL) return showToast(`Minimum withdrawal is ₹${MIN_WITHDRAWAL}`, "error");
    if (amount > availableBalance) return showToast("Amount exceeds available balance!", "error");
    
    let finalDetails = "";

    if (payoutMethod === "UPI") {
      if (!upiId.trim()) return showToast("Please enter a valid UPI ID", "error");
      if (!upiId.includes('@')) return showToast("Please enter a valid UPI ID with @", "error");
      finalDetails = `UPI ID: ${upiId}`;
    } else {
      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.bankName) {
        return showToast("Please fill all bank details", "error");
      }
      if (bankDetails.accountNumber.length < 9) return showToast("Please enter a valid account number", "error");
      if (bankDetails.ifscCode.length !== 11) return showToast("IFSC code must be 11 characters", "error");
      finalDetails = `Bank: ${bankDetails.bankName} | A/C: ${bankDetails.accountNumber} | IFSC: ${bankDetails.ifscCode}`;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "payouts"), {
        vendorId: user.uid,
        amount: amount,
        method: payoutMethod,
        details: finalDetails,
        status: "Pending",
        createdAt: Date.now(),
        timestamp: serverTimestamp()
      });

      showToast("Payout request submitted successfully! 🎉");
      closeModal();
    } catch (error) {
      console.error("Payout error:", error);
      showToast("Failed to submit request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto';
    setWithdrawAmount("");
    setUpiId("");
    setBankDetails({ accountName: "", accountNumber: "", ifscCode: "", bankName: "" });
    setPayoutMethod("UPI");
  };

  const getStatusBadge = (status) => {
    if (status === "Pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Rejected") return "bg-red-50 text-red-700 border-red-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getStatusIcon = (status) => {
    if (status === "Pending") return <Clock size={14} />;
    if (status === "Completed") return <CheckCircle size={14} />;
    if (status === "Rejected") return <AlertCircle size={14} />;
    return <Info size={14} />;
  };

  // Stats for the page
  const stats = [
    { 
      label: "Available Balance", 
      value: `₹${availableBalance.toLocaleString('en-IN')}`, 
      icon: Wallet, 
      bg: "bg-gradient-to-br from-[#3b2416] to-[#5a3d28]", 
      textColor: "text-white",
      subText: "text-white/70",
      isSpecial: true 
    },
    { 
      label: "Net Earnings", 
      value: `₹${netEarnings.toLocaleString('en-IN')}`, 
      icon: TrendingUp, 
      bg: "bg-white", 
      textColor: "text-stone-900",
      subText: "text-stone-500",
      badge: `After ${ADMIN_COMMISSION_PERCENT}% comm.`,
      isSpecial: false 
    },
    { 
      label: "Pending Requests", 
      value: `₹${pendingPayouts.toLocaleString('en-IN')}`, 
      icon: Clock, 
      bg: "bg-white", 
      textColor: "text-stone-900",
      subText: "text-stone-500",
      badge: `${payouts.filter(p => p.status === "Pending").length} pending`,
      isSpecial: false 
    },
    { 
      label: "Total Withdrawn", 
      value: `₹${totalWithdrawn.toLocaleString('en-IN')}`, 
      icon: ArrowUpRight, 
      bg: "bg-white", 
      textColor: "text-stone-900",
      subText: "text-stone-500",
      badge: "Lifetime",
      isSpecial: false 
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 font-sans text-stone-800 relative">
      
      {/* 🟢 TOAST NOTIFICATION - Portal */}
      {toast.show && createPortal(
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[999999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-down border backdrop-blur-md ${
          toast.type === 'error' 
            ? 'bg-red-50/95 border-red-200 text-red-800' 
            : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>,
        document.body
      )}

      {/* 💸 PAYOUT POPUP MODAL - Portal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Dark Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={closeModal}
          />
          
          {/* Popup Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-scale-in z-10">
            
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-[#3b2416] to-[#5a3d28] flex justify-between items-center shrink-0 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Landmark size={20} className="text-[#c4a35a]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Request Withdrawal</h3>
                  <p className="text-white/50 text-xs">Withdraw your earnings</p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20}/>
              </button>
            </div>
            
            {/* Body */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
              <form onSubmit={handleRequestPayout} className="space-y-5">
                
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Available</p>
                      <p className="text-2xl font-black text-[#3b2416] mt-0.5">₹{availableBalance.toLocaleString('en-IN')}</p>
                    </div>
                    <Wallet size={24} className="text-amber-600" />
                  </div>
                  <div className="mt-3 pt-3 border-t border-amber-200/50 flex items-center gap-1.5 text-xs text-amber-700">
                    <Info size={12} />
                    <span>Min withdrawal: <b>₹{MIN_WITHDRAWAL.toLocaleString('en-IN')}</b></span>
                  </div>
                </div>

                {/* Warning for low balance */}
                {!isBalanceSufficient && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                    <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-800">Balance too low</p>
                      <p className="text-xs text-red-600 mt-0.5">
                        You need ₹{MIN_WITHDRAWAL.toLocaleString('en-IN')} minimum. Keep selling!
                      </p>
                    </div>
                  </div>
                )}

                {/* Amount Input */}
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                    Amount (₹)
                  </label>
                  <input 
                    type="number" 
                    required 
                    disabled={!isBalanceSufficient}
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Enter amount (min ₹${MIN_WITHDRAWAL})`} 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none font-bold text-lg transition-all disabled:opacity-50"
                  />
                </div>

                {/* Method Selection */}
                <div className={!isBalanceSufficient ? "opacity-50 pointer-events-none" : ""}>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("UPI")}
                      className={`border-2 rounded-xl p-3 text-center font-bold transition-all ${
                        payoutMethod === "UPI" 
                          ? "border-[#3b2416] bg-[#3b2416]/5 text-[#3b2416]" 
                          : "border-stone-200 text-stone-400 hover:border-stone-300"
                      }`}
                    >
                      <Smartphone size={20} className="mx-auto mb-1" />
                      <span className="text-xs">UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("Bank")}
                      className={`border-2 rounded-xl p-3 text-center font-bold transition-all ${
                        payoutMethod === "Bank" 
                          ? "border-[#3b2416] bg-[#3b2416]/5 text-[#3b2416]" 
                          : "border-stone-200 text-stone-400 hover:border-stone-300"
                      }`}
                    >
                      <Building2 size={20} className="mx-auto mb-1" />
                      <span className="text-xs">Bank Transfer</span>
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                <div className={!isBalanceSufficient ? "opacity-50 pointer-events-none" : ""}>
                  {payoutMethod === "UPI" ? (
                    <div>
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 block">
                        UPI ID
                      </label>
                      <input 
                        type="text" 
                        required 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfc" 
                        className="w-full bg-white border border-stone-200 rounded-xl p-3 text-stone-800 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 outline-none font-medium transition-all"
                      />
                    </div>
                  ) : (
                    <div className="space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
                      <input 
                        type="text" required placeholder="Bank Name" 
                        value={bankDetails.bankName} 
                        onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})} 
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400/50 outline-none" 
                      />
                      <input 
                        type="text" required placeholder="Account Holder Name" 
                        value={bankDetails.accountName} 
                        onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})} 
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400/50 outline-none" 
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" required placeholder="Account Number" 
                          value={bankDetails.accountNumber} 
                          onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})} 
                          className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400/50 outline-none" 
                        />
                        <input 
                          type="text" required placeholder="IFSC Code" maxLength={11}
                          value={bankDetails.ifscCode} 
                          onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})} 
                          className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-amber-400/50 outline-none uppercase" 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || !isBalanceSufficient}
                  className="w-full py-3.5 bg-gradient-to-r from-[#3b2416] to-[#5a3d28] hover:from-[#2c1a10] hover:to-[#4a3020] text-white rounded-xl font-bold tracking-wider uppercase text-sm transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </button>
                
                <p className="text-[10px] text-center text-stone-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-500" /> 
                  Secure transaction
                </p>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 👑 HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">Wallet & Payouts</h1>
          <p className="text-stone-500 mt-1 text-sm md:text-base font-medium">Manage your earnings and withdrawals</p>
        </div>
        <button 
          onClick={openModal}
          className="bg-gradient-to-r from-[#c4a35a] to-[#e5c97a] hover:from-[#b59550] hover:to-[#d4b96a] text-[#3b2416] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <Landmark size={18} /> Request Payout
        </button>
      </div>

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <stat.icon size={22} className={stat.isSpecial ? "text-[#c4a35a]" : "text-stone-400"} />
              {stat.badge && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-stone-100 text-stone-500">
                  {stat.badge}
                </span>
              )}
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${stat.subText}`}>{stat.label}</p>
              <p className={`text-2xl font-black ${stat.textColor}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 📜 PAYOUT HISTORY */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
            <History size={20} className="text-[#6e4b31]" /> Withdrawal History
          </h2>
          
          {/* Filter Tabs */}
          <div className="flex bg-stone-50 p-1 rounded-xl gap-1">
            {["All", "Pending", "Completed", "Rejected"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === status 
                    ? "bg-white text-[#6e4b31] shadow-sm" 
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-stone-200 border-t-[#3b2416] mb-4"></div>
            <p className="text-stone-500 text-sm">Loading payouts...</p>
          </div>
        ) : filteredPayouts.length === 0 ? (
          <div className="p-16 text-center">
            <Wallet size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 font-medium">
              {statusFilter !== "All" ? `No ${statusFilter.toLowerCase()} payouts` : "No withdrawal history yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-stone-50/50 border-b text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-black">
                  <th className="p-4 pl-6">Request ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-sm">#{payout.id.slice(0, 10)}</div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString('en-IN') : "Recent"}
                      </div>
                    </td>
                    <td className="p-4 font-black text-[#3b2416]">
                      ₹{Number(payout.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-bold bg-stone-100 px-2 py-0.5 rounded-md mr-2">
                        {payout.method}
                      </span>
                      <span className="text-xs text-stone-500">{payout.details}</span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border ${getStatusBadge(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d6d3d1; border-radius: 10px; }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}