
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function VendorRoute({ children }) {
//   const { user, profile, loading } = useAuth();
  
// if (loading) return <div className="p-20 text-center animate-pulse">Verifying Access...</div>;

//   // 1. Check: User login hai?
//   // 2. Check: Role vendor hai?
//   // 3. Check: Status approved hai?
//   if (!user || profile?.role !== "vendor" || profile?.status !== "approved") {
//     // Agar kuch bhi missing hai, toh login pe wapas bhej do
//     return <Navigate to="/vendor-login" replace />;
//   }

//   return children;
// }
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function VendorRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="p-20 text-center animate-pulse font-bold text-gray-500">Verifying Seller Access...</div>;
  }

  // 1. Agar user login hi nahi hai
  if (!user) {
    return <Navigate to="/vendor-login" replace />;
  }

  // 2. 🛑 FIX: Agar account PENDING hai, toh yahi rok do, redirect mat karo!
  if (profile?.role === "vendor" && profile?.status === "pending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-amber-100 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Under Review</h2>
          <p className="text-gray-500">Admin is currently reviewing your seller application. You will be able to access your dashboard once approved.</p>
        </div>
      </div>
    );
  }

  // 3. Agar APPROVED vendor hai, tabhi dashboard/pages dikhao
  if (profile?.role === "vendor" && profile?.status === "approved") {
    return children;
  }

  // Baaki sab (Buyers/Admin) ko vendor login par bhej do
  return <Navigate to="/vendor-login" replace />;
}