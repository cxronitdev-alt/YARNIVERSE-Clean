import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; 
// ❌ useNavigate yahan se hata diya hai

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  // 🔴 Banned UI state
  const [showBannedAlert, setShowBannedAlert] = useState(false);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    let unsubSnapshot; 

    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      
      if (!currentUser) {
        if (unsubSnapshot) unsubSnapshot(); 
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      const docRef = doc(db, "users", currentUser.uid);
      
      unsubSnapshot = onSnapshot(docRef, async (snap) => {
        if (snap.exists()) {
          const userData = snap.data();

          // 🛑 REAL-TIME BAN CHECK LOGIC 🛑
          if (userData.isBanned) {
            setShowBannedAlert(true); 
            await signOut(auth);      
            setUser(null);
            setProfile(null);
            setLoading(false);
            return; 
          }

          setProfile({ uid: currentUser.uid, ...userData });
        } else {
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || "Yarniverse User",
            image: currentUser.photoURL || "",
            role: "user",
          });
        }
        setLoading(false);
      }, (err) => {
        console.error("Firestore Snapshot Sync Error:", err);
        setLoading(false);
      });
    });

    return () => {
      unsubAuth();
      if (unsubSnapshot) unsubSnapshot(); 
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, logout, loading }}>
      
      {/* 🔴 BANNED USER RED SCREEN OVERLAY 🔴 */}
      {showBannedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border-t-8 border-red-600 animate-in fade-in zoom-in duration-300">
            
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-wide">
              Access Denied
            </h2>
            
            <p className="text-gray-600 font-medium mb-8 leading-relaxed">
              Aapka account admin dwara <strong className="text-red-600">ban</strong> kar diya gaya hai. Kripya app access karne ke liye support team se sampark karein.
            </p>
            
            <button 
              onClick={() => {
                setShowBannedAlert(false);
                // ✅ Native browser redirect use kiya hai
                window.location.href = "/login"; 
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-red-600/30 cursor-pointer uppercase tracking-widest text-sm"
            >
              Okay, I Understand
            </button>
          </div>
        </div>
      )}

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);