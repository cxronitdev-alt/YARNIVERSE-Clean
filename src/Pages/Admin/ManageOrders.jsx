// import { useState, useEffect } from "react";
// import { db } from "../../firebase/firebase";
// import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
// import { MapPin, Phone, User, Package, IndianRupee } from "lucide-react";

// export default function ManageOrders() {
//   const [orders, setOrders] = useState([]);
//   const [visibleCount, setVisibleCount] = useState(5);

//   useEffect(() => {
//     const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
//     return onSnapshot(q, (snapshot) => {
//       setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     });
//   }, []);

//   // 🚀 STATUS UPDATE FUNCTION (Real-time sync ke liye)
//   const updateStatus = async (orderId, newStatus) => {
//     try {
//       await updateDoc(doc(db, "orders", orderId), { status: newStatus });
//       // Optional: Aap chahien toh yahan success alert hata sakte hain taaki admin jaldi jaldi kaam kar sake
//       console.log(`Order ${orderId} updated to ${newStatus}`);
//     } catch (err) { 
//       alert("Status update failed. Please try again."); 
//       console.error(err);
//     }
//   };

//   // 🚀 SAFE DATE FORMATTER (Taki app crash na ho)
//   const formatOrderDate = (dateVal) => {
//     if (!dateVal) return "N/A";
//     if (typeof dateVal.toDate === "function") {
//       return dateVal.toDate().toLocaleString('en-IN', {
//         day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
//       });
//     }
//     return new Date(dateVal).toLocaleString();
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h2 className="text-3xl font-bold mb-8 text-[#6e4b31]">Order Management Hub</h2>
      
//       <div className="grid gap-6">
//         {orders.slice(0, visibleCount).map((order) => (
//           <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
//             {/* Header: ID & Date */}
//             <div className="flex justify-between items-center mb-4 border-b pb-4">
//               <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">
//                 ORDER ID: #{order.id.slice(0, 10)}
//               </span>
//               <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
//                 {formatOrderDate(order.orderDate)}
//               </span>
//             </div>

//             <div className="flex flex-col md:flex-row gap-8">
//               {/* Customer Info */}
//               <div className="flex-1 space-y-2">
//                 <h3 className="font-bold flex items-center gap-2 text-gray-800"><User size={16} className="text-[#6e4b31]"/> Customer Details</h3>
//                 <p className="text-sm font-medium text-gray-900">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
//                 <p className="text-sm text-gray-600 flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {order.customerInfo?.phone}</p>
//                 <p className="text-sm text-gray-600 flex items-start gap-2"><MapPin size={14} className="mt-1 text-gray-400" /> {order.customerInfo?.address}, {order.customerInfo?.city}</p>
//               </div>

//               {/* Products */}
//               <div className="flex-[2]">
//                 <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-800"><Package size={16} className="text-[#6e4b31]"/> Products Ordered</h3>
//                 <div className="space-y-2">
//                   {order.items?.map((item, i) => (
//                     <div key={i} className="flex justify-between bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
//                       <span className="font-medium text-gray-800">{item.name} <span className="text-gray-400 ml-1 font-mono">x{item.quantity}</span></span>
//                       <span className="font-bold text-[#6e4b31]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
//                     </div>
//                   ))}
//                 </div>
                
//                 {/* Grand Total Section */}
//                 <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center font-bold text-lg text-gray-800">
//                   <span>Grand Total</span>
//                   <span className="flex items-center text-[#6e4b31]"><IndianRupee size={18} />{order.totalAmount?.toLocaleString('en-IN')}</span>
//                 </div>
//               </div>

//               {/* Status Controller */}
//               <div className="w-full md:w-48 bg-gray-50 p-4 rounded-xl border border-gray-100">
//                 <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Update Status</label>
                
//                 {/* 🚀 EXACT MATCH DROPDOWN FOR USER UI */}
//                 <select 
//                   value={order.status || "Pending"}
//                   onChange={(e) => updateStatus(order.id, e.target.value)}
//                   className="w-full p-2.5 rounded-lg border border-gray-200 font-bold text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6e4b31] transition-all shadow-sm"
//                 >
//                   <option value="Pending">Pending</option>
//                   <option value="Shipped">Shipped</option>
//                   <option value="Out for Delivery">Out for Delivery</option>
//                   <option value="Delivered">Delivered</option>
//                   <option value="Cancelled">Cancelled</option>
//                 </select>
                
//                 {/* Payment Method Info */}
//                 <div className="mt-4 pt-4 border-t border-gray-200">
//                   <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Mode</p>
//                   <span className={`text-xs font-bold px-2 py-1 rounded-md ${order.paymentMethod === 'Cash on Delivery' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
//                     {order.paymentMethod || "N/A"}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* See More Button */}
//       {visibleCount < orders.length && (
//         <button 
//           onClick={() => setVisibleCount(prev => prev + 5)}
//           className="mt-8 w-full py-4 bg-[#6e4b31] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#5a3d28] transition-colors shadow-md cursor-pointer"
//         >
//           See More Orders
//         </button>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { MapPin, Phone, User, Package, IndianRupee, Store } from "lucide-react";

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("orderDate", "desc"));
    return onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  // 🚀 STATUS UPDATE FUNCTION (Real-time sync ke liye)
  const updateStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      console.log(`Order ${orderId} updated to ${newStatus}`);
    } catch (err) { 
      alert("Status update failed. Please try again."); 
      console.error(err);
    }
  };

  // 🚀 SAFE DATE FORMATTER (Taki app crash na ho)
  const formatOrderDate = (dateVal) => {
    if (!dateVal) return "N/A";
    if (typeof dateVal.toDate === "function") {
      return dateVal.toDate().toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    }
    return new Date(dateVal).toLocaleString();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-[#6e4b31]">Order Management Hub</h2>
      
      <div className="grid gap-6">
        {orders.slice(0, visibleCount).map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* Header: ID & Date */}
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-wider">
                ORDER ID: #{order.id.slice(0, 10)}
              </span>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {formatOrderDate(order.orderDate)}
              </span>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Customer Info */}
              <div className="flex-1 space-y-2">
                <h3 className="font-bold flex items-center gap-2 text-gray-800"><User size={16} className="text-[#6e4b31]"/> Customer Details</h3>
                <p className="text-sm font-medium text-gray-900">{order.customerInfo?.firstName} {order.customerInfo?.lastName}</p>
                <p className="text-sm text-gray-600 flex items-center gap-2"><Phone size={14} className="text-gray-400"/> {order.customerInfo?.phone}</p>
                <p className="text-sm text-gray-600 flex items-start gap-2"><MapPin size={14} className="mt-1 text-gray-400" /> {order.customerInfo?.address}, {order.customerInfo?.city}</p>
              </div>

              {/* Products */}
              <div className="flex-[2]">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-gray-800"><Package size={16} className="text-[#6e4b31]"/> Products Ordered</h3>
                <div className="space-y-2">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                      <span className="font-medium text-gray-800">{item.name} <span className="text-gray-400 ml-1 font-mono">x{item.quantity || 1}</span></span>
                      <span className="font-bold text-[#6e4b31]">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                
                {/* Grand Total Section */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center font-bold text-lg text-gray-800">
                  <span>Grand Total</span>
                  <span className="flex items-center text-[#6e4b31]"><IndianRupee size={18} />{order.totalAmount?.toLocaleString('en-IN') || order.subTotal?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Status Controller */}
              <div className="w-full md:w-48 bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  {order.vendorId && order.vendorId !== "admin" ? "Order Status" : "Update Status"}
                </label>
                
                {/* 🛑 SECURITY CHECK: Agar vendor ka order hai toh Dropdown hide karo */}
                {order.vendorId && order.vendorId !== "admin" ? (
                  <div className="flex flex-col gap-3 mt-1">
                    <span className={`px-3 py-2 rounded-lg text-sm font-bold text-center border ${
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {order.status || "Pending"}
                    </span>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 text-center shadow-sm">
                      <span className="text-[9px] font-bold uppercase text-gray-400 flex items-center justify-center gap-1 mb-0.5">
                        <Store size={10} /> Managed By
                      </span>
                      <p className="text-xs font-bold text-[#6e4b31] truncate" title={order.storeName}>
                        {order.storeName || "Vendor"}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ✅ ADMIN UI: Agar admin ka order hai toh Dropdown dikhao */
                  <select 
                    value={order.status || "Pending"}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-200 font-bold text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6e4b31] transition-all shadow-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                )}
                
                {/* Payment Method Info */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Mode</p>
                  <span className={`text-[11px] font-bold px-2.5 py-1.5 rounded-md inline-block w-full text-center ${
                    order.paymentMethod === 'Cash on Delivery' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {order.paymentMethod || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* See More Button */}
      {visibleCount < orders.length && (
        <button 
          onClick={() => setVisibleCount(prev => prev + 5)}
          className="mt-8 w-full py-4 bg-[#6e4b31] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#5a3d28] transition-colors shadow-md cursor-pointer"
        >
          See More Orders
        </button>
      )}
    </div>
  );
}