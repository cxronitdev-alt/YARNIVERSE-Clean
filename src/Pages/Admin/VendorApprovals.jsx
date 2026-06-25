// import { useState, useEffect } from "react";
// import { db } from "../../firebase/firebase";
// import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
// import { CheckCircle, XCircle, Store, Mail, Clock } from "lucide-react";

// export default function VendorApprovals() {
//   const [pendingVendors, setPendingVendors] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // 1. Firebase se sirf 'pending' vendors uthana
//   useEffect(() => {
//     const fetchPendingVendors = async () => {
//       try {
//         const q = query(
//           collection(db, "users"), 
//           where("role", "==", "vendor"), 
//           where("status", "==", "pending")
//         );
//         const querySnapshot = await getDocs(q);
        
//         const vendors = querySnapshot.docs.map(doc => ({ 
//           id: doc.id, 
//           ...doc.data() 
//         }));
        
//         setPendingVendors(vendors);
//       } catch (error) {
//         console.error("Error fetching vendors:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPendingVendors();
//   }, []);

//   // 2. Approve ya Reject karne ka function
//   const handleAction = async (vendorId, actionStatus) => {
//     // actionStatus me ya toh "approved" aayega ya "rejected"
//     const confirmAction = window.confirm(`Are you sure you want to ${actionStatus.toUpperCase()} this vendor?`);
//     if (!confirmAction) return;

//     try {
//       // Firebase me status update karna
//       const vendorRef = doc(db, "users", vendorId);
//       await updateDoc(vendorRef, { status: actionStatus });
      
//       // UI se us vendor ko hata dena (taaki page refresh na karna pade)
//       setPendingVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      
//       alert(`Vendor successfully ${actionStatus}!`);
//     } catch (error) {
//       console.error("Error updating vendor status:", error);
//       alert("Failed to update status.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-[70vh]">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#6e4b31] border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 md:p-8 max-w-7xl mx-auto">
//       <div className="mb-8">
//         <h1 className="text-3xl font-serif font-bold text-gray-900">Vendor Approvals</h1>
//         <p className="text-gray-500 mt-2">Review and manage new seller applications.</p>
//       </div>

//       {pendingVendors.length === 0 ? (
//         <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
//           <Store size={48} className="mx-auto text-gray-300 mb-4" />
//           <h3 className="text-xl font-bold text-gray-700">No Pending Requests</h3>
//           <p className="text-gray-500 mt-2">All vendor applications have been processed.</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {pendingVendors.map(vendor => (
//             <div key={vendor.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              
//               <div className="flex justify-between items-start mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
//                     <Store size={24} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-bold text-gray-900">{vendor.storeName}</h3>
//                     <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md mt-1 w-fit">
//                       <Clock size={12} /> PENDING REVIEW
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2 mb-6 border-t border-gray-50 pt-4">
//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   <span className="font-bold text-gray-900 w-16">Owner:</span> {vendor.name}
//                 </div>
//                 <div className="flex items-center gap-2 text-sm text-gray-600">
//                   <span className="font-bold text-gray-900 w-16">Email:</span> 
//                   <Mail size={14} className="text-gray-400"/> {vendor.email}
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <button 
//                   onClick={() => handleAction(vendor.id, "approved")}
//                   className="flex-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
//                 >
//                   <CheckCircle size={18} /> Approve
//                 </button>
//                 <button 
//                   onClick={() => handleAction(vendor.id, "rejected")}
//                   className="flex-1 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
//                 >
//                   <XCircle size={18} /> Reject
//                 </button>
//               </div>

//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

export default function VendorApprovals() {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sirf pending vendors ko database se lana
  useEffect(() => {
    const fetchPendingVendors = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "==", "vendor"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        setPendingVendors(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingVendors();
  }, []);

  // 🛑 FIX: Approve/Reject action bina page reload ke
  const handleAction = async (vendorId, actionStatus) => {
    const confirmAction = window.confirm(`Are you sure you want to ${actionStatus} this seller?`);
    if (!confirmAction) return;

    try {
      // 1. Firebase me background update (No navigate/reload)
      await updateDoc(doc(db, "users", vendorId), { status: actionStatus });
      
      // 2. UI se turant hata do taaki list clean ho jaye
      setPendingVendors(prev => prev.filter(vendor => vendor.id !== vendorId));
      
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update status.");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading requests...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Vendor Approvals</h1>

      {pendingVendors.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-10 text-center text-gray-500">
          No pending vendor requests at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingVendors.map(vendor => (
            <div key={vendor.id} className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">{vendor.storeName}</h3>
              <p className="text-sm text-gray-500 mb-4">{vendor.name} • {vendor.email}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleAction(vendor.id, "approved")}
                  className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white py-2 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleAction(vendor.id, "rejected")}
                  className="flex-1 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white py-2 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}