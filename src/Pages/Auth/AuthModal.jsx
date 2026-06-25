import { useState } from "react";
import { auth, db } from "../../firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn,
  Sparkles,
  Crown,
  ArrowRight,
  Loader2,
  Shield,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AuthModal({ closeModal }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async () => {
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset link has been sent to your email. Please check your inbox.");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else {
        setError(err.message.replace("Firebase: ", ""));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAuthLoading(true);

    try {
      if (isSignUp) {
        // USER SIGNUP
        const res = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userData = {
          uid: res.user.uid,
          email: res.user.email,
          role: "user",
        };

        await setDoc(
          doc(db, "users", res.user.uid),
          userData
        );

        navigate("/");
        closeModal();
      } else {
        // LOGIN
        const res = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const snap = await getDoc(
          doc(db, "users", res.user.uid)
        );

        if (snap.exists()) {
          const role = snap.data().role;

          // 🚫 Admin Security Check
          if (role === "admin") {
            await signOut(auth);
            setError("Admins must login from Admin Login page.");
            return;
          }

          // 🛑 VENDOR SECURITY CHECK (Naya Logic)
          if (role === "vendor") {
            await signOut(auth);
            setError("You are a Seller! Please login from the 'Seller Portal' link in the footer.");
            return;
          }
        }

        // ✅ Normal User Login
        navigate("/");
        closeModal();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message.replace("Firebase: ", "")
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
    setShowPassword(false);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center pt-20 sm:pt-24 p-4">
      {/* Backdrop with luxury effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-[#1a1a2e]/80 backdrop-blur-md"
        onClick={closeModal}
      ></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#c4a35a]/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-[#6e4b31]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-[#e5c97a]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Modal Container - Compact Version */}
      <div className="relative w-full max-w-sm sm:max-w-md animate-modalSlideIn">
        {/* Top decorative line */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-[#c4a35a] to-transparent"></div>
        
        <div className="relative bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#c4a35a]/10 via-transparent to-[#6e4b31]/10 pointer-events-none"></div>
          
          <div className="relative p-4 sm:p-6">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-all duration-300 hover:rotate-90 group"
            >
              <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {/* Header Icon - Smaller */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#6e4b31] to-[#c4a35a] rounded-xl flex items-center justify-center shadow-lg shadow-[#c4a35a]/20 transform hover:scale-105 transition-transform duration-300">
                  {isSignUp ? (
                    <UserPlus className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
                  ) : (
                    <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={1.5} />
                  )}
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#c4a35a] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Title - Compact */}
            <div className="text-center mb-5">
              <h2 className="text-2xl sm:text-3xl font-light text-white mb-1 tracking-wide">
                {isSignUp ? (
                  <>
                    Join the{" "}
                    <span className="font-bold bg-gradient-to-r from-[#c4a35a] to-[#e5c97a] bg-clip-text text-transparent">
                      Elite
                    </span>
                  </>
                ) : (
                  <>
                    Welcome{" "}
                    <span className="font-bold bg-gradient-to-r from-[#c4a35a] to-[#e5c97a] bg-clip-text text-transparent">
                      Back
                    </span>
                  </>
                )}
              </h2>
              <p className="text-gray-400 text-xs tracking-wider uppercase">
                {isSignUp ? "Create your account" : "Sign in to continue"}
              </p>
            </div>

            {/* Messages - Compact */}
            {error && (
              <div className="mb-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-lg p-3 flex items-start gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs sm:text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-lg p-3 flex items-start gap-2 animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-green-300 text-xs sm:text-sm">{success}</p>
              </div>
            )}

            {/* Form - Compact spacing */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Email Field */}
              <div className="relative group">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500 group-focus-within:text-[#c4a35a] transition-colors duration-300" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c4a35a]/50 focus:ring-2 focus:ring-[#c4a35a]/20 transition-all duration-300 hover:border-white/20"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative group">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block pl-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-500 group-focus-within:text-[#c4a35a] transition-colors duration-300" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#c4a35a]/50 focus:ring-2 focus:ring-[#c4a35a]/20 transition-all duration-300 hover:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-[#c4a35a] transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="text-xs sm:text-sm text-[#c4a35a] hover:text-[#e5c97a] transition-colors duration-300 hover:underline underline-offset-4"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Submit Button - Smaller padding */}
              <button
                type="submit"
                disabled={authLoading}
                className="relative w-full py-3 bg-gradient-to-r from-[#6e4b31] via-[#8b6547] to-[#6e4b31] hover:from-[#8b6547] hover:via-[#a0784a] hover:to-[#8b6547] text-white rounded-lg font-medium text-sm tracking-wide transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-[#6e4b31]/25 overflow-hidden group mt-1"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {authLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isSignUp ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </form>

            {/* Toggle Sign In/Sign Up - Compact */}
            <div className="mt-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-6 h-px bg-gradient-to-r from-transparent to-gray-600"></span>
                <Shield className="w-3 h-3 text-gray-500" />
                <span className="w-6 h-px bg-gradient-to-l from-transparent to-gray-600"></span>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">
                {isSignUp ? "Already have an account?" : "New to our platform?"}{" "}
                <button
                  onClick={toggleMode}
                  className="text-[#c4a35a] hover:text-[#e5c97a] font-semibold transition-colors duration-300 hover:underline underline-offset-4 ml-1"
                >
                  {isSignUp ? "Sign In" : "Create Account"}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom decorative line */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#c4a35a]/30 to-transparent"></div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-modalSlideIn {
          animation: modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}