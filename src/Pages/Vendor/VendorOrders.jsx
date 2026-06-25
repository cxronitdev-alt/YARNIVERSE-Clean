// import { useState, useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { db } from "../../firebase/firebase";
// import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
// import { 
//   Package, Truck, CheckCircle, Clock, Search, X, AlertCircle, 
//   Info, RefreshCw, XCircle, Eye, MapPin, User, Phone, Mail, ShoppingBag 
// } from "lucide-react";

// export default function VendorOrders() {
//   const { user } = useAuth();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");

//   // Premium UI States
//   const [toast, setToast] = useState({ show: false, message: "", type: "success" });
//   const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, newStatus: "" });
  
//   // State for Order Details Modal
//   const [selectedOrder, setSelectedOrder] = useState(null);

//   const ALL_STATUSES = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

//   // 🚀 REAL-TIME FIREBASE CONNECTION
//   useEffect(() => {
//     if (!user) return;
//     const q = query(collection(db, "orders"), where("vendorId", "==", user.uid));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       fetchedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
//       setOrders(fetchedOrders);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, [user]);

//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
//   };

//   const handleStatusChangeRequest = (orderId, newStatus) => {
//     setConfirmModal({ isOpen: true, orderId, newStatus });
//   };

//   const confirmStatusUpdate = async () => {
//     const { orderId, newStatus } = confirmModal;
//     setConfirmModal({ isOpen: false, orderId: null, newStatus: "" });
//     try {
//       await updateDoc(doc(db, "orders", orderId), { 
//         status: newStatus,
//         updatedAt: Date.now() 
//       });
//       showToast(`Order status updated to ${newStatus}`);
      
//       if (selectedOrder && selectedOrder.id === orderId) {
//         setSelectedOrder(prev => ({ ...prev, status: newStatus }));
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       showToast("Failed to update status", "error");
//     }
//   };

//   // Helper to get full customer name based on your schema
//   const getCustomerName = (order) => {
//     if (order.customerInfo?.firstName) {
//       return `${order.customerInfo.firstName} ${order.customerInfo.lastName || ""}`.trim();
//     }
//     return order.customerName || "Customer";
//   };

//   const filteredOrders = orders.filter(order => {
//     const matchesStatus = statusFilter === "All" || (order.status || "Pending") === statusFilter;
//     const customerName = getCustomerName(order);
//     const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
//                           customerName.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesStatus && matchesSearch;
//   });

//   const getStatusColor = (status) => {
//     switch(status) {
//       case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
//       case "Processing": return "bg-purple-50 text-purple-700 border-purple-200";
//       case "Shipped": return "bg-blue-50 text-blue-700 border-blue-200";
//       case "Out for Delivery": return "bg-orange-50 text-orange-700 border-orange-200";
//       case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
//       case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
//       default: return "bg-gray-50 text-gray-700 border-gray-200";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch(status) {
//       case "Pending": return <Clock size={14} />;
//       case "Processing": return <RefreshCw size={14} className="animate-spin-slow" />;
//       case "Shipped": return <Truck size={14} />;
//       case "Out for Delivery": return <Package size={14} />;
//       case "Delivered": return <CheckCircle size={14} />;
//       case "Cancelled": return <XCircle size={14} />;
//       default: return <Info size={14} />;
//     }
//   };

//   // 🚀 UPDATED ADDRESS FINDER (Based on your exact Firebase Schema)
//   const renderAddress = (order) => {
//     if (order.customerInfo) {
//       const info = order.customerInfo;
//       return (
//         <p className="leading-relaxed">
//           {info.address && <>{info.address}<br/></>}
//           {info.city && <>{info.city}</>}
//           {info.state && <>, {info.state}</>}
//           {info.pincode && <> - {info.pincode}</>}
//         </p>
//       );
//     }
    
//     return <span className="text-gray-400 italic">Address details missing</span>;
//   };

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 relative">
      
//       {/* 🟢 CUSTOM TOAST NOTIFICATION */}
//       {toast.show && (
//         <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-3 rounded-xl shadow-xl animate-fade-in-up border ${
//           toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
//         }`}>
//           {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
//           <span className="font-bold text-sm">{toast.message}</span>
//         </div>
//       )}

//       {/* 🔴 CUSTOM CONFIRMATION MODAL */}
//       {confirmModal.isOpen && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-fade-in-up">
//             <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
//               <AlertCircle size={32} />
//             </div>
//             <h3 className="text-xl font-bold text-gray-900 mb-2">Update Order?</h3>
//             <p className="text-gray-500 text-sm mb-6">
//               Are you sure you want to mark this order as <span className="font-bold text-gray-900">{confirmModal.newStatus}</span>?
//             </p>
//             <div className="flex gap-3">
//               <button 
//                 onClick={() => setConfirmModal({ isOpen: false, orderId: null, newStatus: "" })}
//                 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold transition-colors"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={confirmStatusUpdate}
//                 className="flex-1 bg-[#6e4b31] hover:bg-[#5a3d28] text-white py-2.5 rounded-xl font-bold transition-colors"
//               >
//                 Yes, Update
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🔵 ORDER DETAILS MODAL */}
//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up">
//             {/* Modal Header */}
//             <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">Order #{selectedOrder.id.slice(0,10).toUpperCase()}</h2>
//                 <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
//                   <Clock size={12} /> Placed on: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "Unknown"}
//                 </p>
//               </div>
//               <button 
//                 onClick={() => setSelectedOrder(null)}
//                 className="p-2 bg-white hover:bg-gray-100 rounded-full text-gray-500 transition-colors shadow-sm border border-gray-100"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar space-y-6">
              
//               {/* Status Banner */}
//               <div className={`p-4 rounded-xl border flex items-center justify-between ${getStatusColor(selectedOrder.status || "Pending")}`}>
//                 <div className="flex items-center gap-2 font-bold">
//                   {getStatusIcon(selectedOrder.status || "Pending")}
//                   <span>Current Status: {selectedOrder.status || "Pending"}</span>
//                 </div>
//               </div>

//               {/* Customer & Delivery Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Customer Info */}
//                 <div className="space-y-3">
//                   <h3 className="text-sm uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2">
//                     <User size={16} /> Customer Details
//                   </h3>
//                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-sm text-gray-700">
//                     <p className="font-bold text-gray-900 text-base">
//                       {getCustomerName(selectedOrder)}
//                     </p>
                    
//                     <p className="flex items-center gap-2">
//                       <Mail size={14} className="text-gray-400 shrink-0"/> 
//                       <span>{selectedOrder.customerInfo?.email || <span className="text-gray-400 italic">Email N/A</span>}</span>
//                     </p>
                    
//                     <p className="flex items-center gap-2">
//                       <Phone size={14} className="text-gray-400 shrink-0"/> 
//                       <span>{selectedOrder.customerInfo?.phone || <span className="text-gray-400 italic">Phone N/A</span>}</span>
//                     </p>
//                   </div>
//                 </div>

//                 {/* Shipping Info */}
//                 <div className="space-y-3">
//                   <h3 className="text-sm uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2">
//                     <MapPin size={16} /> Delivery Address
//                   </h3>
//                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 h-full">
//                     {renderAddress(selectedOrder)}
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items */}
//               <div className="space-y-3">
//                 <h3 className="text-sm uppercase tracking-wider font-bold text-gray-400 flex items-center gap-2">
//                   <ShoppingBag size={16} /> Order Items
//                 </h3>
//                 <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
//                   <table className="w-full text-sm text-left">
//                     <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
//                       <tr>
//                         <th className="py-3 px-4">Item</th>
//                         <th className="py-3 px-4 text-center">Qty</th>
//                         <th className="py-3 px-4 text-right">Price</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-50">
//                       {selectedOrder.items?.length > 0 ? (
//                         selectedOrder.items.map((item, idx) => (
//                           <tr key={idx} className="text-gray-700">
//                             <td className="py-3 px-4 font-medium">
//                               {item.name || item.productName || item.category || "Unknown Item"}
//                             </td>
//                             <td className="py-3 px-4 text-center">{item.qty || item.quantity || 1}</td>
//                             <td className="py-3 px-4 text-right">₹{item.price?.toLocaleString('en-IN') || "0"}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr><td colSpan="3" className="py-4 text-center text-gray-500">No items found</td></tr>
//                       )}
//                     </tbody>
//                     <tfoot className="bg-gray-50/50 border-t border-gray-100">
//                       <tr>
//                         <td colSpan="2" className="py-4 px-4 text-right font-bold text-gray-900">Total Amount:</td>
//                         <td className="py-4 px-4 text-right font-black text-[#6e4b31] text-lg">
//                           ₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || selectedOrder.total?.toLocaleString('en-IN') || "0"}
//                         </td>
//                       </tr>
//                     </tfoot>
//                   </table>
//                 </div>
//               </div>

//             </div>
//           </div>
//         </div>
//       )}

//       {/* 👑 HEADER */}
//       <div>
//         <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Order Management</h1>
//         <p className="text-sm md:text-base text-gray-500 mt-1">Real-time order tracking & fulfillment</p>
//       </div>

//       {/* 🔍 FILTERS & TABS */}
//       <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
//         <div className="flex bg-gray-50 p-1 rounded-xl w-full xl:w-auto overflow-x-auto custom-scrollbar">
//           {["All", ...ALL_STATUSES].map(status => (
//             <button
//               key={status}
//               onClick={() => setStatusFilter(status)}
//               className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-1 text-center ${
//                 statusFilter === status ? "bg-white text-[#6e4b31] shadow-sm" : "text-gray-500 hover:text-gray-900"
//               }`}
//             >
//               {status}
//             </button>
//           ))}
//         </div>
//         <div className="flex items-center bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 w-full xl:w-80">
//           <Search size={18} className="text-gray-400 mr-2 shrink-0" />
//           <input 
//             type="text" 
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search Order ID or Customer..." 
//             className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
//           />
//         </div>
//       </div>

//       {/* 📦 ORDERS TABLE */}
//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="p-16 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6e4b31] border-t-transparent"></div></div>
//         ) : filteredOrders.length === 0 ? (
//           <div className="p-16 text-center text-gray-500 font-medium">No orders found.</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[850px]">
//               <thead>
//                 <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase text-gray-500 font-black">
//                   <th className="p-5 pl-6">Order Info</th>
//                   <th className="p-5">Customer</th>
//                   <th className="p-5">Amount</th>
//                   <th className="p-5">Current Status</th>
//                   <th className="p-5 pr-6 text-right">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {filteredOrders.map((order) => {
//                   const currentStatus = order.status || "Pending";
//                   return (
//                     <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
//                       <td className="p-5 pl-6">
//                         <div className="font-bold text-gray-900">{order.id.slice(0,10).toUpperCase()}</div>
//                         <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
//                           <Clock size={12} /> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recent"}
//                         </div>
//                       </td>
//                       <td className="p-5">
//                         <div className="font-bold text-gray-900">{getCustomerName(order)}</div>
//                         <div className="text-xs text-gray-500 mt-1 line-clamp-1">{order.items?.map(i => `${i.qty || 1}x ${i.name || i.category || "Item"}`).join(', ')}</div>
//                       </td>
//                       <td className="p-5 font-black text-[#6e4b31]">₹{order.totalAmount?.toLocaleString('en-IN') || order.total?.toLocaleString('en-IN') || "0"}</td>
//                       <td className="p-5">
//                         <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(currentStatus)}`}>
//                           {getStatusIcon(currentStatus)} {currentStatus}
//                         </span>
//                       </td>
//                       <td className="p-5 pr-6 flex items-center justify-end gap-3">
                        
//                         {/* 👁️ VIEW DETAILS BUTTON */}
//                         <button
//                           onClick={() => setSelectedOrder(order)}
//                           className="p-2 text-gray-500 hover:text-[#6e4b31] bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-[#6e4b31]/30 rounded-lg transition-colors shadow-sm"
//                           title="View Order Details"
//                         >
//                           <Eye size={18} />
//                         </button>

//                         {currentStatus === "Cancelled" || currentStatus === "Delivered" ? (
//                           <div className="w-[125px] text-center">
//                             <span className="text-gray-400 text-sm font-bold">Closed</span>
//                           </div>
//                         ) : (
//                           <select
//                             value={currentStatus}
//                             onChange={(e) => handleStatusChangeRequest(order.id, e.target.value)}
//                             className="w-[125px] bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg px-2 py-2 focus:ring-2 focus:ring-[#6e4b31] outline-none cursor-pointer hover:border-gray-300 transition-all shadow-sm"
//                           >
//                             {ALL_STATUSES.map(stat => (
//                               <option key={stat} value={stat} disabled={stat === currentStatus}>{stat}</option>
//                             ))}
//                           </select>
//                         )}
//                       </td>
//                     </tr>
//                   )
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//       <style>{`.animate-spin-slow { animation: spin 2s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } } .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }`}</style>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { 
  Package, Truck, CheckCircle, Clock, Search, X, AlertCircle, 
  Info, RefreshCw, XCircle, Eye, MapPin, User, Phone, Mail, 
  ShoppingBag, ChevronDown, Filter, SlidersHorizontal, 
  Box, IndianRupee, Calendar, Hash, Copy, ExternalLink,
  ChevronLeft, ArrowRight, Star, TrendingUp, MoreVertical
} from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Premium UI States
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, orderId: null, newStatus: "" });
  
  // 🚀 FULLSCREEN ORDER DETAILS MODAL
  const [selectedOrder, setSelectedOrder] = useState(null);

  const ALL_STATUSES = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

  // 🚀 REAL-TIME FIREBASE CONNECTION
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), where("vendorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setOrders(fetchedOrders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const handleStatusChangeRequest = (orderId, newStatus) => {
    setConfirmModal({ isOpen: true, orderId, newStatus });
  };

  const confirmStatusUpdate = async () => {
    const { orderId, newStatus } = confirmModal;
    setConfirmModal({ isOpen: false, orderId: null, newStatus: "" });
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        updatedAt: Date.now() 
      });
      showToast(`Order status updated to ${newStatus}`);
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status", "error");
    }
  };

  // Helper to get full customer name
  const getCustomerName = (order) => {
    if (order.customerInfo?.firstName) {
      return `${order.customerInfo.firstName} ${order.customerInfo.lastName || ""}`.trim();
    }
    return order.customerName || "Customer";
  };

  // 🆕 Helper to get product names from order items
  const getProductNames = (order) => {
    if (!order.items || order.items.length === 0) return "No items";
    return order.items.map(item => item.name || item.productName || item.title || "Unknown Product").join(", ");
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "All" || (order.status || "Pending") === statusFilter;
    const customerName = getCustomerName(order);
    const productNames = getProductNames(order);
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productNames.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Processing": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Shipped": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Out for Delivery": return "bg-orange-50 text-orange-700 border-orange-200";
      case "Delivered": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Pending": return <Clock size={14} />;
      case "Processing": return <RefreshCw size={14} className="animate-spin-slow" />;
      case "Shipped": return <Truck size={14} />;
      case "Out for Delivery": return <Package size={14} />;
      case "Delivered": return <CheckCircle size={14} />;
      case "Cancelled": return <XCircle size={14} />;
      default: return <Info size={14} />;
    }
  };

  // 🚀 UPDATED ADDRESS FINDER
  const renderAddress = (order) => {
    if (order.customerInfo) {
      const info = order.customerInfo;
      return (
        <p className="leading-relaxed">
          {info.address && <>{info.address}<br/></>}
          {info.city && <>{info.city}</>}
          {info.state && <>, {info.state}</>}
          {info.pincode && <> - {info.pincode}</>}
        </p>
      );
    }
    return <span className="text-gray-400 italic">Address details missing</span>;
  };

  // 📊 Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "Pending" || !o.status).length,
    processing: orders.filter(o => o.status === "Processing").length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    totalRevenue: orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0)
  };

  // 🌟 MODAL OVERLAYS RENDERED VIA PORTAL
  const modalOverlays = (
    <>
      {/* 🟢 CUSTOM TOAST NOTIFICATION */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[999999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-down border backdrop-blur-sm ${
          toast.type === 'error' 
            ? 'bg-red-50/95 border-red-200 text-red-800' 
            : 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* 🔴 CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-stone-100 animate-scale-in">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertCircle size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Update Order Status</h3>
            <p className="text-stone-500 text-sm mb-2">
              Change status to <span className="font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-lg">{confirmModal.newStatus}</span>?
            </p>
            <p className="text-xs text-stone-400 mb-8">This will notify the customer about the update.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmModal({ isOpen: false, orderId: null, newStatus: "" })}
                className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3.5 rounded-xl font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmStatusUpdate}
                className="flex-1 bg-[#6e4b31] hover:bg-[#5a3d28] text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-[#6e4b31]/20"
              >
                Yes, Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔵 FULLSCREEN ORDER DETAILS MODAL - PORTAL RENDERED */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          
          {/* Modal Container */}
          <div className="relative bg-white md:rounded-3xl shadow-2xl w-full max-w-5xl h-full md:h-[92vh] flex flex-col overflow-hidden animate-scale-in border-0 md:border border-stone-200">
            
            {/* Modal Header */}
            <div className="px-6 md:px-8 py-5 border-b border-stone-100 flex justify-between items-center bg-gradient-to-r from-stone-50 to-white shrink-0 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-stone-100 rounded-full transition-all text-stone-400 hover:text-stone-800"
                >
                  <ChevronLeft size={24} />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif font-bold text-xl md:text-2xl text-stone-900">
                      Order #{selectedOrder.id.slice(0, 12).toUpperCase()}
                    </h2>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedOrder.status || "Pending")}`}>
                      {getStatusIcon(selectedOrder.status || "Pending")}
                      {selectedOrder.status || "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5">
                    <Calendar size={12} /> 
                    {selectedOrder.createdAt 
                      ? new Date(selectedOrder.createdAt).toLocaleString('en-IN', { 
                          day: 'numeric', month: 'short', year: 'numeric', 
                          hour: '2-digit', minute: '2-digit' 
                        }) 
                      : "Date Unknown"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-all bg-white shadow-sm border border-stone-100"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50/30">
              <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                
                {/* Order Progress Tracker */}
                <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <TrendingUp size={14} /> Order Progress
                  </h3>
                  <div className="flex items-center justify-between relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200">
                      <div 
                        className="h-full bg-[#6e4b31] transition-all duration-500"
                        style={{ 
                          width: `${(ALL_STATUSES.indexOf(selectedOrder.status || "Pending") / (ALL_STATUSES.length - 1)) * 100}%` 
                        }}
                      />
                    </div>
                    
                    {ALL_STATUSES.map((status, idx) => {
                      const currentIdx = ALL_STATUSES.indexOf(selectedOrder.status || "Pending");
                      const isCompleted = idx <= currentIdx && selectedOrder.status !== "Cancelled";
                      const isCurrent = idx === currentIdx;
                      
                      return (
                        <div key={status} className="relative z-10 flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isCompleted 
                              ? 'bg-[#6e4b31] border-[#6e4b31] text-white' 
                              : isCurrent && selectedOrder.status === "Cancelled"
                              ? 'bg-red-500 border-red-500 text-white'
                              : 'bg-white border-stone-200 text-stone-400'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle size={18} />
                            ) : selectedOrder.status === "Cancelled" && isCurrent ? (
                              <XCircle size={18} />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <span className={`text-[10px] font-bold mt-2 text-center ${
                            isCompleted ? 'text-[#6e4b31]' : 'text-stone-400'
                          }`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Customer & Delivery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Info Card */}
                  <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={14} /> Customer Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#6e4b31]/5 rounded-full flex items-center justify-center">
                          <User size={20} className="text-[#6e4b31]" />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-lg">
                            {getCustomerName(selectedOrder)}
                          </p>
                          <p className="text-xs text-stone-400">Customer</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl">
                          <Mail size={16} className="text-stone-400 shrink-0"/> 
                          <span className="font-medium">
                            {selectedOrder.customerInfo?.email || <span className="text-stone-400 italic">Email not provided</span>}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 text-sm text-stone-600 bg-stone-50 p-3 rounded-xl">
                          <Phone size={16} className="text-stone-400 shrink-0"/> 
                          <span className="font-medium">
                            {selectedOrder.customerInfo?.phone || <span className="text-stone-400 italic">Phone not provided</span>}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Card */}
                  <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin size={14} /> Delivery Address
                    </h3>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <MapPin size={18} className="text-amber-600" />
                      </div>
                      <div className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl flex-1">
                        {renderAddress(selectedOrder)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items Table */}
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                  <div className="p-6 pb-4">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                      <ShoppingBag size={14} /> Order Items
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-stone-50/80 text-xs uppercase text-stone-500 font-black border-y border-stone-100">
                          <th className="py-4 px-6">Product</th>
                          <th className="py-4 px-6 text-center">Quantity</th>
                          <th className="py-4 px-6 text-right">Price</th>
                          <th className="py-4 px-6 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {selectedOrder.items?.length > 0 ? (
                          selectedOrder.items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-stone-50/50 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center">
                                    <Box size={18} className="text-stone-400" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-stone-900">
                                      {item.name || item.productName || item.title || "Unknown Product"}
                                    </p>
                                    {item.category && (
                                      <p className="text-xs text-stone-400">{item.category}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-lg font-bold text-xs">
                                  {item.qty || item.quantity || 1}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right font-medium text-stone-700">
                                ₹{(item.price || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-4 px-6 text-right font-black text-[#6e4b31]">
                                ₹{((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-stone-400 font-medium">
                              No items found in this order
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-[#6e4b31]/5 border-t-2 border-[#6e4b31]/10">
                          <td colSpan={3} className="py-5 px-6 text-right font-bold text-stone-900 text-base">
                            Total Amount
                          </td>
                          <td className="py-5 px-6 text-right font-black text-[#6e4b31] text-xl">
                            ₹{(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all text-sm"
                  >
                    Close Details
                  </button>
                  {selectedOrder.status !== "Delivered" && selectedOrder.status !== "Cancelled" && (
                    <button 
                      onClick={() => {
                        const currentIdx = ALL_STATUSES.indexOf(selectedOrder.status || "Pending");
                        if (currentIdx < ALL_STATUSES.length - 2) {
                          handleStatusChangeRequest(selectedOrder.id, ALL_STATUSES[currentIdx + 1]);
                        }
                      }}
                      className="px-6 py-3 rounded-xl font-bold text-white bg-[#6e4b31] hover:bg-[#5a3d28] transition-all shadow-lg shadow-[#6e4b31]/20 flex items-center gap-2 text-sm"
                    >
                      <ArrowRight size={16} /> Next Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 relative font-sans text-stone-800">
      
      {/* 🌟 RENDER MODALS VIA PORTAL TO ESCAPE SIDEBAR STACKING */}
      {createPortal(modalOverlays, document.body)}

      {/* 👑 HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">Order Management</h1>
          <p className="text-stone-500 mt-1 md:mt-2 text-sm md:text-base font-medium">Real-time order tracking & fulfillment center</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-stone-400 bg-stone-50 px-4 py-2 rounded-full">
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Processing', value: stats.processing, icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue', value: `₹${(stats.totalRevenue/1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-[#6e4b31]', bg: 'bg-[#6e4b31]/5' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <span className="text-xl md:text-2xl font-black text-stone-900">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* 🔍 FILTERS & TABS */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex bg-stone-50 p-1.5 rounded-xl w-full lg:w-auto overflow-x-auto custom-scrollbar">
            {["All", ...ALL_STATUSES].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-1 text-center ${
                  statusFilter === status 
                    ? "bg-white text-[#6e4b31] shadow-sm ring-1 ring-stone-200/50" 
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {status === "All" ? "All Orders" : status}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-stone-50 px-4 py-2.5 rounded-xl border border-stone-100 w-full lg:w-80 focus-within:ring-2 focus-within:ring-[#6e4b31]/20 transition-all">
            <Search size={18} className="text-stone-400 mr-2.5 shrink-0" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search orders, customers, products..." 
              className="bg-transparent border-none outline-none w-full text-sm text-stone-700 placeholder-stone-400 font-medium"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="p-1 hover:bg-stone-200 rounded-full">
                <X size={14} className="text-stone-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 📦 ORDERS TABLE */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 md:p-24 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-[#6e4b31] mb-4"></div>
            <p className="text-stone-500 text-sm font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 md:p-24 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={36} className="text-stone-300"/>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">No Orders Found</h3>
            <p className="text-stone-500 text-sm font-medium">
              {searchTerm || statusFilter !== "All" 
                ? "No orders match your current filters." 
                : "Orders will appear here once customers place them."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-stone-50/50 border-b border-stone-100 text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-black">
                  <th className="p-4 md:p-5 pl-6 md:pl-8">Order Info</th>
                  <th className="p-4 md:p-5">Customer</th>
                  <th className="p-4 md:p-5">Product(s)</th>
                  <th className="p-4 md:p-5">Amount</th>
                  <th className="p-4 md:p-5">Status</th>
                  <th className="p-4 md:p-5 pr-6 md:pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredOrders.map((order) => {
                  const currentStatus = order.status || "Pending";
                  const productNames = getProductNames(order);
                  
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors group">
                      <td className="p-4 md:p-5 pl-6 md:pl-8">
                        <div className="font-bold text-stone-900 text-sm md:text-base">
                          #{order.id.slice(0, 12).toUpperCase()}
                        </div>
                        <div className="text-[10px] md:text-xs text-stone-400 mt-1 flex items-center gap-1">
                          <Calendar size={12} /> 
                          {order.createdAt 
                            ? new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                day: 'numeric', month: 'short', year: 'numeric' 
                              }) 
                            : "Recent"}
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="font-bold text-stone-900 text-sm">{getCustomerName(order)}</div>
                        <div className="text-xs text-stone-400 mt-1 truncate max-w-[150px]">
                          {order.customerInfo?.email || order.customerInfo?.phone || ""}
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="text-sm text-stone-700 font-medium line-clamp-1 max-w-[200px]" title={productNames}>
                          {productNames}
                        </div>
                        <div className="text-xs text-stone-400 mt-1">
                          {order.items?.length || 0} item(s)
                        </div>
                      </td>
                      <td className="p-4 md:p-5">
                        <span className="font-black text-[#6e4b31] text-sm md:text-base">
                          ₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="p-4 md:p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] md:text-xs font-bold border whitespace-nowrap ${getStatusColor(currentStatus)}`}>
                          {getStatusIcon(currentStatus)} {currentStatus}
                        </span>
                      </td>
                      <td className="p-4 md:p-5 pr-6 md:pr-8 text-right">
                        <div className="flex items-center justify-end gap-2 md:gap-3">
                          
                          {/* 👁️ VIEW DETAILS BUTTON */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2.5 text-stone-400 hover:text-[#6e4b31] bg-stone-50 hover:bg-[#6e4b31]/10 border border-stone-200 hover:border-[#6e4b31]/30 rounded-xl transition-all shadow-sm"
                            title="View Order Details"
                          >
                            <Eye size={17} />
                          </button>

                          {currentStatus === "Cancelled" || currentStatus === "Delivered" ? (
                            <span className="text-stone-400 text-xs font-bold w-[110px] text-center bg-stone-50 py-2 rounded-xl">
                              Closed
                            </span>
                          ) : (
                            <select
                              value={currentStatus}
                              onChange={(e) => handleStatusChangeRequest(order.id, e.target.value)}
                              className="w-[130px] bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[#6e4b31]/30 outline-none cursor-pointer hover:border-stone-300 transition-all shadow-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat pr-8"
                            >
                              {ALL_STATUSES.map(stat => (
                                <option key={stat} value={stat} disabled={stat === currentStatus}>
                                  {stat}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d6d3d1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #a8a29e; }
        
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-spin-slow { animation: spin 2s linear infinite; }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}