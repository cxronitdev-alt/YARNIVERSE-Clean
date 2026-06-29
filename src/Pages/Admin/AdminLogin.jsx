import { useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Shield, 
  Sparkles,
  ArrowRight,
  Loader2,
  X
} from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const snap = await getDoc(doc(db, "users", res.user.uid));

      if (snap.exists() && snap.data().role === "admin") {
        navigate("/admin/dashboard");
      } else {
        setError("Access denied. Admin privileges required.");
        await auth.signOut();
      }
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex justify-center items-center p-3 sm:p-4 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-br from-[#6e4b31]/20 to-[#c4a35a]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-[#c4a35a]/10 to-[#6e4b31]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-[#c4a35a]/5 to-transparent rounded-full blur-3xl"></div>
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#c4a35a 1px, transparent 1px), linear-gradient(90deg, #c4a35a 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute -top-2 -right-2 z-20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2 hover:bg-white/20 transition-all duration-300 group"
          aria-label="Close"
        >
          <X size={18} className="text-gray-300 group-hover:text-white transition-colors sm:w-5 sm:h-5" />
        </button>

        {/* Decorative Top Border */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#c4a35a] to-transparent rounded-full"></div>
        
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c4a35a]/5 to-transparent pointer-events-none"></div>
          
          <div className="relative p-5 sm:p-8 lg:p-10">
            {/* Logo/Icon Area */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#6e4b31] to-[#c4a35a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-[#c4a35a]/20">
                  <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#c4a35a]" />
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white mb-2 tracking-wide">
                Admin
                <span className="font-bold bg-gradient-to-r from-[#c4a35a] to-[#e5c97a] bg-clip-text text-transparent"> Portal</span>
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm tracking-wider uppercase">Secure Access Only</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              {/* Email Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-focus-within:text-[#c4a35a] transition-colors duration-300" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-[#c4a35a]/50 focus:ring-2 focus:ring-[#c4a35a]/20 transition-all duration-300 hover:border-white/20"
                />
              </div>

              {/* Password Field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-focus-within:text-[#c4a35a] transition-colors duration-300" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-[#c4a35a]/50 focus:ring-2 focus:ring-[#c4a35a]/20 transition-all duration-300 hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-500 hover:text-[#c4a35a] transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 backdrop-blur-sm animate-fadeIn">
                  <p className="text-red-400 text-xs sm:text-sm flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                    <span className="flex-1">{error}</span>
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-3 sm:py-4 bg-gradient-to-r from-[#6e4b31] to-[#8b6547] hover:from-[#8b6547] hover:to-[#a0784a] text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base tracking-wide transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-[#6e4b31]/25 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      Access Portal
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#c4a35a] to-[#e5c97a] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 sm:mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] sm:text-xs">
                <span className="w-6 sm:w-8 h-px bg-gradient-to-r from-transparent to-gray-600"></span>
                <span className="tracking-wider uppercase">Restricted Area</span>
                <span className="w-6 sm:w-8 h-px bg-gradient-to-l from-transparent to-gray-600"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[#c4a35a]/30 to-transparent rounded-full"></div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}