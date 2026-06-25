import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, query, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { Landmark, CheckCircle, AlertCircle, Clock, Check, X, Search } from "lucide-react";

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // 🚀 REAL-TIME DATA FETCHING (All Vendor Payouts)
  useEffect(() => {
    const q = query(collection(db, "payouts"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPayouts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Newest first sort
      fetchedPayouts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPayouts(fetchedPayouts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // ✅ ❌ APPROVE OR REJECT FUNCTION
  const handleUpdateStatus = async (payoutId, vendorId, amount, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this payout as ${newStatus}?`)) return;

    try {
      // 1. Update the Payout Status
      await updateDoc(doc(db, "payouts", payoutId), {
        status: newStatus,
        updatedAt: Date.now()
      });

      // 2. Send Notification back to the Vendor
      let msg = newStatus === "Completed" 
        ? `Your payout of ₹${amount} has been successfully processed!`
        : `Your payout request of ₹${amount} was rejected. Please contact support.`;

      await addDoc(collection(db, "notifications"), {
        vendorId: vendorId, // Bhejna vendor ko hai
        type: "payout_update",
        message: msg,
        read: false,
        createdAt: Date.now()
      });

      showToast(`Payout marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating payout:", error);
      showToast("Failed to update status", "error");
    }
  };

  const filteredPayouts = payouts.filter(p => statusFilter === "All" || p.status === statusFilter);

  const getStatusBadge = (status) => {
    if (status === "Pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "Completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Rejected") return "bg-red-50 text-red-700 border-red-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      
      {toast.show && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-3 rounded-xl shadow-xl border ${toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">Payout Management</h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Review and process vendor withdrawal requests</p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-center">
        <div className="flex bg-gray-50 p-1 rounded-xl w-full xl:w-auto overflow-x-auto">
          {["Pending", "Completed", "Rejected", "All"].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-1 text-center ${
                statusFilter === status ? "bg-white text-[#3b2416] shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-[#3b2416] border-t-transparent"></div></div>
        ) : filteredPayouts.length === 0 ? (
          <div className="p-16 text-center">
            <Landmark size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No {statusFilter.toLowerCase()} payout requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-black">
                  <th className="p-5 pl-6">Req. ID & Date</th>
                  <th className="p-5">Vendor ID</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Payment Details</th>
                  <th className="p-5 text-right pr-6">Action / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5 pl-6">
                      <div className="font-bold text-gray-900 uppercase">#{payout.id.slice(0,8)}</div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Clock size={12} /> {payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : "Recent"}
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-mono bg-gray-100 p-1.5 rounded text-gray-600">{payout.vendorId.slice(0, 10)}...</span>
                    </td>
                    <td className="p-5 font-black text-[#3b2416] text-lg">
                      ₹{Number(payout.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-5">
                      <div className="text-xs text-gray-700 bg-orange-50/50 p-2.5 rounded-lg max-w-xs break-words border border-orange-100 font-medium">
                        <span className="text-orange-800 font-bold uppercase mb-1 block">{payout.method}</span>
                        {payout.details}
                      </div>
                    </td>
                    <td className="p-5 text-right pr-6">
                      {payout.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(payout.id, payout.vendorId, payout.amount, "Rejected")}
                            className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-100" title="Reject"
                          >
                            <X size={18} />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(payout.id, payout.vendorId, payout.amount, "Completed")}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-md flex items-center gap-1"
                          >
                            <Check size={16} /> Mark Paid
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(payout.status)}`}>
                          {payout.status === "Completed" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {payout.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}