// import { useState, useEffect } from "react";
// import { db } from "../../firebase/firebase";
// import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
// import { useAuth } from "../../context/AuthContext";
// import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, ChevronDown, Check } from "lucide-react";

// export default function MyOrders() {
//   const { user } = useAuth();
//   const [myOrders, setMyOrders] = useState([]);
  
//   // UI Features ke liye states
//   const [expandedOrder, setExpandedOrder] = useState(null); 
//   const [showSuccessPopup, setShowSuccessPopup] = useState(false);

//   useEffect(() => {
//     // Ab hum directly user ki ID (uid) se check kar rahe hain
//     // Isse user checkout mein koi bhi email daale, order yahan show hoga
//     if (!user?.uid) return; 
    
//     const q = query(
//       collection(db, "orders"), 
//       where("userId", "==", user.uid) 
//     );

//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
//       // Naye orders upar dikhane ke liye Date ke hisaab se sort
//       fetchedOrders.sort((a, b) => {
//         const dateA = a.orderDate?.toDate ? a.orderDate.toDate() : new Date(a.orderDate || 0);
//         const dateB = b.orderDate?.toDate ? b.orderDate.toDate() : new Date(b.orderDate || 0);
//         return dateB - dateA;
//       });

//       setMyOrders(fetchedOrders); 
//     });

//     return () => unsubscribe();
//   }, [user]);

//   // Status Icons & Colors
//   const getStatusUI = (status) => {
//     switch(status) {
//       case "Delivered": return { icon: <CheckCircle2 size={18} />, color: "text-green-600 bg-green-50 border-green-200" };
//       case "Out for Delivery": return { icon: <Truck size={18} />, color: "text-blue-600 bg-blue-50 border-blue-200" };
//       case "Shipped": return { icon: <Package size={18} />, color: "text-amber-600 bg-amber-50 border-amber-200" };
//       case "Cancelled": 
//       case "Reject": return { icon: <XCircle size={18} />, color: "text-red-600 bg-red-50 border-red-200" };
//       default: return { icon: <Clock size={18} />, color: "text-gray-600 bg-gray-50 border-gray-200" }; 
//     }
//   };

//   // Date aur Time Formatter
//   const formatDateTime = (dateVal) => {
//     if (!dateVal) return "Date/Time N/A";
//     const d = typeof dateVal.toDate === "function" ? dateVal.toDate() : new Date(dateVal);
    
//     return d.toLocaleString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   // Cancel Order Function
//   const handleCancelOrder = async (orderId) => {
//     const confirmCancel = window.confirm("Kya aap sach mein is order ko cancel karna chahte hain?");
//     if (!confirmCancel) return;

//     try {
//       const orderRef = doc(db, "orders", orderId);
//       await updateDoc(orderRef, {
//         status: "Cancelled"
//       });
      
//       // Green Tick Popup dikhayen
//       setShowSuccessPopup(true);
      
//       // 2.5 seconds baad popup hata dein
//       setTimeout(() => {
//         setShowSuccessPopup(false);
//       }, 2500);

//     } catch (error) {
//       console.error("Order cancel error:", error);
//       alert("Order cancel karne mein problem aayi. Kripya dobara try karein.");
//     }
//   };

//   // View Details Toggle
//   const toggleDetails = (orderId) => {
//     if (expandedOrder === orderId) {
//       setExpandedOrder(null); 
//     } else {
//       setExpandedOrder(orderId); 
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen py-6 md:py-10 relative">
      
//       {/* --- Green Tick Success Popup Overlay --- */}
//       {showSuccessPopup && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center transition-all p-4">
//           <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 transform scale-100 animate-bounce-short text-center w-full max-w-sm">
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
//               <Check size={40} className="text-green-500" />
//             </div>
//             <h3 className="text-2xl font-bold text-gray-900 m-0">Order Cancelled</h3>
//             <p className="text-gray-500 text-sm font-medium">Aapka order successfully cancel ho gaya hai.</p>
//           </div>
//         </div>
//       )}

//       <div className="max-w-4xl mx-auto px-4 sm:px-6">
//         <div className="flex items-center gap-2 mb-6 md:mb-8">
//           <Package className="text-[#6e4b31]" size={28} />
//           <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 m-0">My Orders</h2>
//         </div>

//         <div className="space-y-4 md:space-y-6">
//           {myOrders.length === 0 ? (
//             <div className="bg-white p-8 md:p-12 text-center rounded-2xl shadow-sm border border-gray-100">
//               <Package size={48} className="mx-auto text-gray-300 mb-4" />
//               <p className="text-gray-500 font-medium text-lg">Aapne abhi tak koi order place nahi kiya hai.</p>
//             </div>
//           ) : (
//             myOrders.map(order => {
//               const statusUI = getStatusUI(order.status || "Pending");
//               const isExpanded = expandedOrder === order.id;
              
//               // Agar aapne checkout par 'cartItems' bheja tha, toh wo yahan render hoga
//               const orderItems = order.items || order.cartItems || [];

//               return (
//                 <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                  
//                   {/* --- Order Header (Responsive) --- */}
//                   <div className="bg-gray-50 px-4 md:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:justify-between sm:items-center">
//                     <div className="flex justify-between sm:block w-full sm:w-auto">
//                       <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order ID</p>
//                       <p className="text-sm font-mono font-bold text-gray-900">#{order.id.slice(0, 10).toUpperCase()}</p>
//                     </div>
//                     <div className="flex justify-between sm:block w-full sm:w-auto">
//                       <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Date & Time</p>
//                       <p className="text-sm font-medium text-gray-900">{formatDateTime(order.orderDate)}</p>
//                     </div>
//                     <div className="flex justify-between sm:block w-full sm:w-auto">
//                       <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total Amount</p>
//                       <p className="text-sm font-bold text-[#6e4b31]">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
//                     </div>
//                   </div>

//                   {/* --- Order Body (Responsive) --- */}
//                   <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//                     <div className="flex-1 w-full">
//                       <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold ${statusUI.color}`}>
//                         {statusUI.icon}
//                         {order.status || "Pending"}
//                       </div>
                      
//                       <div className="mt-4 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
//                         <p className="mb-1"><b>Deliver to:</b> {order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
//                         <p className="truncate"><b>Address:</b> {order.customerInfo?.address}, {order.customerInfo?.city}</p>
//                         <p className="truncate mt-1 text-xs"><b>Email used:</b> {order.customerInfo?.email}</p>
//                       </div>
//                     </div>

//                     {/* Action Buttons */}
//                     <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                      
//                       {(order.status === "Pending" || !order.status) && (
//                         <button 
//                           onClick={() => handleCancelOrder(order.id)}
//                           className="px-6 py-2.5 bg-white text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold cursor-pointer w-full"
//                         >
//                           Cancel Order
//                         </button>
//                       )}
                      
//                       <button 
//                         onClick={() => toggleDetails(order.id)}
//                         className="px-6 py-2.5 bg-[#6e4b31] text-white rounded-xl hover:bg-[#5a3d28] transition-colors text-sm font-bold cursor-pointer w-full flex items-center justify-center gap-2 border-none"
//                       >
//                         {isExpanded ? "Hide Details" : "View Details"} 
//                         {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
//                       </button>
//                     </div>
//                   </div>

//                   {/* --- Expanded Products Details Section --- */}
//                   {isExpanded && (
//                     <div className="px-4 md:px-6 pb-6 pt-2 bg-white border-t border-gray-50">
//                       <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Ordered Items</h4>
//                       <div className="space-y-3">
//                         {orderItems.length > 0 ? (
//                           orderItems.map((item, index) => (
//                             <div key={index} className="flex gap-4 items-center p-3 border border-gray-100 rounded-xl bg-gray-50/50">
//                               <img 
//                                 src={item.image} 
//                                 alt={item.name} 
//                                 className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg bg-white border border-gray-200 shrink-0" 
//                               />
//                               <div className="flex-1 min-w-0">
//                                 <h5 className="font-bold text-sm text-gray-800 truncate">{item.name}</h5>
//                                 <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5">{item.category}</p>
//                               </div>
//                               <div className="text-right shrink-0">
//                                 <p className="text-sm font-bold text-gray-900">₹{item.price}</p>
//                                 <p className="text-xs font-mono text-gray-500">Qty: {item.quantity}</p>
//                               </div>
//                             </div>
//                           ))
//                         ) : (
//                           <p className="text-sm text-gray-400 italic">Item details are not available for this older order.</p>
//                         )}
//                       </div>
//                     </div>
//                   )}

//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>
      
//       {/* Animation Styles for the Popup */}
//       <style dangerouslySetInnerHTML={{__html: `
//         @keyframes bounce-short {
//           0% { transform: scale(0.8); opacity: 0; }
//           50% { transform: scale(1.05); opacity: 1; }
//           100% { transform: scale(1); opacity: 1; }
//         }
//         .animate-bounce-short { animation: bounce-short 0.4s ease-out forwards; }
//       `}} />
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom"; // 🚀 Redirect ke liye
import { Package, Clock, CheckCircle2, Truck, XCircle, Check, ChevronRight } from "lucide-react";

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate(); // 🚀 Hook init
  const [myOrders, setMyOrders] = useState([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    if (!user?.uid) return; 
    
    const q = query(collection(db, "orders"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedOrders.sort((a, b) => {
        const dateA = a.orderDate?.toDate ? a.orderDate.toDate() : new Date(a.orderDate || 0);
        const dateB = b.orderDate?.toDate ? b.orderDate.toDate() : new Date(b.orderDate || 0);
        return dateB - dateA;
      });
      setMyOrders(fetchedOrders); 
    });
    return () => unsubscribe();
  }, [user]);

  const getStatusUI = (status) => {
    switch(status) {
      case "Delivered": return { icon: <CheckCircle2 size={18} />, color: "text-green-600 bg-green-50 border-green-200" };
      case "Out for Delivery": return { icon: <Truck size={18} />, color: "text-blue-600 bg-blue-50 border-blue-200" };
      case "Shipped": return { icon: <Package size={18} />, color: "text-amber-600 bg-amber-50 border-amber-200" };
      case "Cancelled": 
      case "Reject": return { icon: <XCircle size={18} />, color: "text-red-600 bg-red-50 border-red-200" };
      default: return { icon: <Clock size={18} />, color: "text-gray-600 bg-gray-50 border-gray-200" }; 
    }
  };

  const formatDateTime = (dateVal) => {
    if (!dateVal) return "Date/Time N/A";
    const d = typeof dateVal.toDate === "function" ? dateVal.toDate() : new Date(dateVal);
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Kya aap sach mein is order ko cancel karna chahte hain?");
    if (!confirmCancel) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "Cancelled" });
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 2500);
    } catch (error) {
      console.error("Error:", error);
      alert("Error cancelling order.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-green-500" /></div>
            <h3 className="text-xl font-bold">Order Cancelled</h3>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Package className="text-[#6e4b31]" /> My Orders
        </h2>

        <div className="space-y-6">
          {myOrders.map(order => {
            const statusUI = getStatusUI(order.status || "Pending");
            const orderItems = order.items || order.cartItems || [];

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order ID</p>
                    <p className="text-sm font-mono font-bold">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusUI.color}`}>
                    {order.status || "Pending"}
                  </div>
                </div>

                <div className="p-6">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 mb-4 items-center">
                      <img src={item.image} className="w-16 h-16 object-cover rounded-lg border" />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} | ₹{item.price}</p>
                      </div>
                      {/* 🚀 YAHAN CHANGE HUA HAI: Direct Product Page pe jayega */}
                      <button 
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="text-[#6e4b31] font-bold text-xs flex items-center gap-1 hover:underline"
                      >
                        View Details <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 mt-2 flex justify-between items-center">
                    <p className="text-sm text-gray-500">{formatDateTime(order.orderDate)}</p>
                    <p className="font-bold text-[#6e4b31]">Total: ₹{order.totalAmount?.toLocaleString()}</p>
                  </div>

                  {(order.status === "Pending" || !order.status) && (
                    <button 
                      onClick={() => handleCancelOrder(order.id)}
                      className="w-full mt-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50 transition"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}