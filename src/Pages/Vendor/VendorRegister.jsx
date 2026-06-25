import { useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Store, User, Mail, Lock, Sparkles, Crown, Shield, Building2 } from "lucide-react";

export default function VendorRegister() {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    storeName: "" 
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        storeName: formData.storeName,
        role: "vendor",
        status: "pending",
        createdAt: serverTimestamp()
      });

      setMessage("🎉 Registration successful! Your request has been sent to Admin for approval.");
      setTimeout(() => navigate("/vendor-login"), 4000);
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-md w-full relative">
        {/* Premium Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-amber-100/50 hover:shadow-3xl transition-all duration-500">
          {/* Luxury Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-full">
                <Building2 size={48} className="text-amber-800" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 tracking-tight">
              <span className="bg-gradient-to-r from-amber-700 to-amber-900 bg-clip-text text-transparent">
                Become a Seller
              </span>
            </h2>
            <p className="text-gray-500 mt-2 text-sm font-light tracking-wide">
              Join the <span className="text-amber-700 font-medium">Yarniverse</span> marketplace community
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-2xl mb-6 text-sm font-medium backdrop-blur-sm flex items-center gap-2 ${
              message.includes("Error") 
                ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border border-red-200/50" 
                : "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200/50"
            }`}>
              <Shield size={16} className="flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative group">
              <User size={18} className="absolute left-4 top-3.5 text-amber-400 group-focus-within:text-amber-600 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Full Name"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-amber-400 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white focus:shadow-lg"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-amber-400/30 transition-all duration-300"></div>
            </div>

            <div className="relative group">
              <Store size={18} className="absolute left-4 top-3.5 text-amber-400 group-focus-within:text-amber-600 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Store/Brand Name"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-amber-400 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white focus:shadow-lg"
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-amber-400/30 transition-all duration-300"></div>
            </div>

            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-3.5 text-amber-400 group-focus-within:text-amber-600 transition-colors duration-300" />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-amber-400 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white focus:shadow-lg"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-amber-400/30 transition-all duration-300"></div>
            </div>

            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-3.5 text-amber-400 group-focus-within:text-amber-600 transition-colors duration-300" />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-amber-400 outline-none transition-all duration-300 bg-gray-50/50 focus:bg-white focus:shadow-lg"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <div className="absolute inset-0 rounded-2xl pointer-events-none border-2 border-transparent group-focus-within:border-amber-400/30 transition-all duration-300"></div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-[length:200%_100%] animate-shimmer"></div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
              <span className="relative flex items-center justify-center gap-2 text-white font-bold py-4 tracking-wide">
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    Registering...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                    Apply as Vendor
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Already a seller?</span>
              <Link
                to="/vendor-login"
                className="text-amber-700 font-bold hover:text-amber-900 transition-colors duration-300 flex items-center gap-1 group"
              >
                Log in
                <Crown size={14} className="group-hover:rotate-12 transition-transform duration-300" />
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-amber-100/50">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-200/50"></div>
              <div className="flex items-center gap-1 text-xs text-amber-400/70">
                <Shield size={12} />
                <span>Secure Registration</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-200/50"></div>
            </div>
          </div>
        </div>

        {/* Decorative Badge */}
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform rotate-6 backdrop-blur-sm">
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