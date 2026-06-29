import { useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Store, Mail, Lock, Sparkles, Shield, Crown, X } from "lucide-react";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        if (userData.role !== "vendor") {
          await signOut(auth);
          setError("Access Denied! This portal is only for registered Sellers.");
          setLoading(false);
          return;
        }

        if (userData.status === "pending") {
          await signOut(auth);
          setError("Your account is still pending approval by admin.");
          setLoading(false);
          return;
        }

        if (userData.status === "rejected") {
          await signOut(auth);
          setError("Your seller application was rejected.");
          setLoading(false);
          return;
        }

        navigate("/vendor/dashboard");
      } else {
        await signOut(auth);
        setError("Account data not found.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-amber-300/20 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md relative mx-auto">
        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute -top-2 -right-2 z-20 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-50 group"
          aria-label="Close"
        >
          <X size={20} className="text-gray-600 group-hover:text-gray-900 transition-colors" />
        </button>

        {/* Premium Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-amber-100/50 hover:shadow-3xl transition-all duration-500">
          {/* Luxury Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 p-3 sm:p-4 rounded-full">
                <Store size={36} className="text-amber-800 sm:w-[48px] sm:h-[48px]" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3 sm:mt-4 tracking-tight">
              <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                Seller Portal
              </span>
            </h2>
            <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm font-light tracking-wide px-2">
              Welcome back to the <span className="text-amber-700 font-medium">Yarniverse</span> marketplace
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 text-xs sm:text-sm font-medium bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border border-red-200/50 backdrop-blur-sm flex items-center gap-2">
              <Shield size={14} className="flex-shrink-0 sm:w-[16px] sm:h-[16px]" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-5">
            <div className="relative group">
              <Mail size={16} className="absolute left-3 sm:left-4 top-3 sm:top-3.5 text-amber-400 group-focus-within:text-amber-600 transition-colors duration-300 sm:w-[18px] sm:h-[18px]" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-amber-400 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white focus:shadow-lg text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-amber-400/30 transition-all duration-300"></div>
            </div>

            <div className="relative group">
              <Lock size={16} className="absolute left-3 sm:left-4 top-3 sm:top-3.5 text-amber-400 group-focus-within:text-amber-600 transition-colors duration-300 sm:w-[18px] sm:h-[18px]" />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border-2 border-gray-100 focus:border-amber-400 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white focus:shadow-lg text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-amber-400/30 transition-all duration-300"></div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-[length:200%_100%] animate-shimmer"></div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              <span className="relative flex items-center justify-center gap-2 text-white font-bold py-3 sm:py-4 tracking-wide text-sm sm:text-base">
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="group-hover:rotate-90 transition-transform duration-500 sm:w-[18px] sm:h-[18px]" />
                    Access Dashboard
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2">
              <span className="text-gray-500">New to Yarniverse?</span>
              <Link
                to="/vendor-register"
                className="text-amber-700 font-bold hover:text-amber-900 transition-colors duration-300 flex items-center gap-1 group"
              >
                Apply as Vendor
                <Crown size={12} className="group-hover:rotate-12 transition-transform duration-300 sm:w-[14px] sm:h-[14px]" />
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-2 sm:pt-3 border-t border-amber-100/50">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200/50"></div>
              <div className="flex items-center gap-1 text-[10px] sm:text-xs text-amber-400/70">
                <Shield size={10} className="sm:w-[12px] sm:h-[12px]" />
                <span>Secure Access</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200/50"></div>
            </div>
          </div>
        </div>

        {/* Decorative Badge */}
        <div className="absolute -top-3 -right-3 sm:-right-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg transform rotate-6 backdrop-blur-sm">
          Premium
        </div>
      </div>

      {/* Custom Animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}