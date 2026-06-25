import { createContext, useContext, useState, useEffect } from "react";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";

// 🔥 NAYE FIREBASE IMPORTS (Apne firebase.js file ka sahi path yahan dalein)
import { auth, db } from "../firebase/firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  // 🚀 LocalStorage hata diya gaya hai. Ab default state empty array hai.
  const [wishlistItems, setWishlistItems] = useState([]);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Current user store karne ke liye

  const { addToCart } = useCart(); 

  // 🔥 STEP 1: User Login hai ya nahi check karein aur Firebase se data layein
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Agar user login hai, toh Firestore se uski specific wishlist fetch karein
        const docRef = doc(db, "wishlists", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setWishlistItems(docSnap.data().items || []);
        } else {
          setWishlistItems([]); // Naya user hai toh khali
        }
      } else {
        // User logged out hai toh wishlist clear kar do
        setWishlistItems([]);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // 🔥 STEP 2: Jab bhi wishlistItems change ho, use Firestore me save karein
  useEffect(() => {
    // Sirf tab save karo jab user login ho
    if (currentUser) {
      const syncWithFirebase = async () => {
        try {
          const docRef = doc(db, "wishlists", currentUser.uid);
          // 'items' array me saare products save kar rahe hain
          await setDoc(docRef, { items: wishlistItems });
        } catch (error) {
          console.error("Error saving wishlist to Firebase:", error);
        }
      };
      syncWithFirebase();
    }
  }, [wishlistItems, currentUser]);

  const toggleWishlist = (product) => {
    if (!currentUser) {
      alert("Please login to use the wishlist!");
      return;
    }

    setWishlistItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        setOpenWishlist(true);
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (id) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveToCart = (item) => {
    addToCart(item);
    removeFromWishlist(item.id);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, removeFromWishlist, openWishlist, setOpenWishlist }}>
      {children}
      
      {openWishlist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex justify-end transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setOpenWishlist(false)} />
          
          <div className="bg-white w-full max-w-md h-full relative z-10 shadow-2xl flex flex-col p-8 transform translate-x-0 transition-transform duration-300">
            
            <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-bold text-gray-900 tracking-wider">MY WISHLIST</span>
                <span className="font-mono text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-bold">
                  {wishlistItems.length} ITEMS
                </span>
              </div>
              <button 
                onClick={() => setOpenWishlist(false)} 
                className="text-neutral-400 hover:text-neutral-900 cursor-pointer border-0 bg-transparent transition-colors p-1"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
              {wishlistItems.length === 0 ? (
                <div className="text-center py-24 text-neutral-400 text-sm font-light tracking-wide">
                  Your luxury wishlist space is empty.
                </div>
              ) : (
                wishlistItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-neutral-100 bg-white rounded-2xl items-center justify-between shadow-xs hover:border-neutral-200 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-100">
                        <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="max-w-[160px]">
                        <h4 className="text-sm font-medium text-neutral-800 truncate tracking-wide">{item.name}</h4>
                        <div className="flex text-[9px] text-amber-500 my-0.5">★★★★★</div>
                        <p className="text-sm font-semibold text-neutral-900 mt-1">₹{item.price.toLocaleString('en-IN')}.00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => moveToCart(item)}
                        className="bg-neutral-900 text-white p-2.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer border-none shadow-xs flex items-center justify-center"
                        title="Move to Cart"
                      >
                        <ShoppingCart size={14} />
                      </button>
                      
                      <button 
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-neutral-400 hover:text-red-500 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-center"
                        title="Remove Product Instance"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-100 pt-5 mt-5">
              <button 
                onClick={() => setOpenWishlist(false)}
                className="w-full bg-neutral-900 hover:bg-black text-white text-xs font-mono font-bold tracking-widest py-4 uppercase rounded-xl border-none cursor-pointer transition-colors shadow-md"
              >
                Continue Exploring
              </button>
            </div>

          </div>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);