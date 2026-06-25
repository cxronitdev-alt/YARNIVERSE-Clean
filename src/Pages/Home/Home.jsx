import { useState, useEffect } from "react";
import HeroSlider from "../../components/home/HeroSlider";
import Categories from "../../components/home/Categories";
import AuthModal from "../Auth/AuthModal";

import { db } from "../../firebase/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
// 🚀 Icons import kiye naye design ke liye
import { Heart, ShoppingCart, Zap } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext"; 
import { useCurrency } from "../../context/CurrencyContext"; // 🚀 Currency format

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  
  const [newArrivals, setNewArrivals] = useState([]);
  const [categorizedProducts, setCategorizedProducts] = useState({}); 
  const [loading, setLoading] = useState(true);

  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart(); 
  const { formatPrice } = useCurrency(); // Same formatting as other pages

  // 🚀 BUY NOW Logic
  const handleBuyNow = (e, item) => {
    e.stopPropagation(); 
    addToCart(item);
    navigate("/checkout");
  };

  useEffect(() => {
    const fetchSynchronizedData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch New Arrivals (Latest 4 pieces)
        const latestQuery = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(4));
        const latestSnap = await getDocs(latestQuery);
        setNewArrivals(latestSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        // 2. Fetch All Products to group them
        const allSnap = await getDocs(collection(db, "products"));
        const allItems = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const groups = {};
        allItems.forEach((item) => {
          if (item.category) {
            if (!groups[item.category]) {
              groups[item.category] = [];
            }
            groups[item.category].push(item);
          }
        });

        setCategorizedProducts(groups); 
      } catch (err) {
        console.error("Home data fetching crashed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSynchronizedData();
  }, []);

  return (
    <div className="bg-[#f9f9f9] text-gray-900 min-h-screen antialiased font-sans overflow-hidden">
      <HeroSlider />
      <Categories />

      {/* ================= SECTION 1: THE NEW ARRIVALS GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12">
        <div className="mb-6 md:mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-[#3a2417]">✨ THE NEW ARRIVALS</h2>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 font-mono text-xs animate-pulse">Syncing New Arrivals...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {newArrivals.map((item) => {
              const isLiked = wishlistItems.some(wish => wish.id === item.id); 
              return (
                <div key={item.id} className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-300">
                  
                  {/* Premium Image Section */}
                  <div className="h-[260px] sm:h-[300px] md:h-[340px] bg-gray-50 overflow-hidden relative">
                    <img 
                      src={`${item.image}?t=${Date.now()}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                      crossOrigin="anonymous" 
                      onClick={() => navigate(`/product/${item.id}`)}
                    />
                    
                    <button 
                      onClick={() => toggleWishlist(item)}
                      className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer border-none flex items-center justify-center w-8 h-8 md:w-9 md:h-9 z-20 active:scale-90 transition-transform hover:bg-white"
                    >
                      <Heart size={16} className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
                    </button>
                  </div>

                  {/* Details & Action Section */}
                  <div className="flex flex-col p-4 md:p-5 flex-1">
                    <h3 
                      className="text-gray-900 font-bold text-[15px] md:text-base tracking-wide line-clamp-2 leading-tight cursor-pointer hover:text-[#6e4b31] transition-colors"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    
                    <div className="flex mt-2 mb-1">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono uppercase tracking-widest">
                        {item.category || "Craft"}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-lg md:text-xl font-black text-[#6e4b31]">
                        {formatPrice && typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${item.price}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer active:scale-95"
                          title="Add to Cart"
                        >
                          <ShoppingCart size={18} />
                        </button>
                        
                        <button 
                          onClick={(e) => handleBuyNow(e, item)}
                          className="flex items-center gap-1.5 px-4 h-10 bg-gradient-to-r from-[#6e4b31] to-[#4a3221] hover:from-[#4a3221] hover:to-[#2d1e14] text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                        >
                          <Zap size={16} className="fill-white/20" /> BUY
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= SECTION 2: DYNAMIC CATEGORY GRIDS ================= */}
      {Object.keys(categorizedProducts).map((categoryName) => (
        <div key={categoryName} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12">
          
          <div className="mb-6 md:mb-8 border-b border-gray-200 pb-3 md:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0">
            <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-[#3a2417] uppercase">
              🔥 {categoryName} COLLECTION
            </h2>
            <span 
              onClick={() => navigate("/all-handcraft", { state: { filterCategory: categoryName } })} 
              className="text-[10px] md:text-xs font-mono font-bold tracking-wider text-[#6e4b31] underline cursor-pointer uppercase hover:text-black"
            >
              View All ({categorizedProducts[categoryName].length})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categorizedProducts[categoryName].slice(0, 4).map((item) => {
              const isLiked = wishlistItems.some(wish => wish.id === item.id);
              return (
                <div key={item.id} className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-300">
                  
                  {/* Premium Image Section */}
                  <div className="h-[260px] sm:h-[300px] md:h-[340px] bg-gray-50 overflow-hidden relative">
                    <img 
                      src={`${item.image}?t=${Date.now()}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                      crossOrigin="anonymous" 
                      onClick={() => navigate(`/product/${item.id}`)}
                    />
                    
                    <button 
                      onClick={() => toggleWishlist(item)}
                      className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer border-none flex items-center justify-center w-8 h-8 md:w-9 md:h-9 z-20 active:scale-90 transition-transform hover:bg-white"
                    >
                      <Heart size={16} className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
                    </button>
                  </div>

                  {/* Details & Action Section */}
                  <div className="flex flex-col p-4 md:p-5 flex-1">
                    <h3 
                      className="text-gray-900 font-bold text-[15px] md:text-base tracking-wide line-clamp-2 leading-tight cursor-pointer hover:text-[#6e4b31] transition-colors"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    
                    <div className="flex mt-2 mb-1">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono uppercase tracking-widest">
                        {item.category || "Craft"}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-lg md:text-xl font-black text-[#6e4b31]">
                        {formatPrice && typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${item.price}`}
                      </span>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                          className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer active:scale-95"
                          title="Add to Cart"
                        >
                          <ShoppingCart size={18} />
                        </button>
                        
                        <button 
                          onClick={(e) => handleBuyNow(e, item)}
                          className="flex items-center gap-1.5 px-4 h-10 bg-gradient-to-r from-[#6e4b31] to-[#4a3221] hover:from-[#4a3221] hover:to-[#2d1e14] text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                        >
                          <Zap size={16} className="fill-white/20" /> BUY
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ))}

      {showAuth && <AuthModal closeModal={() => setShowAuth(false)} />}
    </div>
  );
}