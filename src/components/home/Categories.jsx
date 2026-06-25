import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
// 🚀 FIX 1: Naye premium icons import kiye
import { Heart, ShoppingCart, Zap } from "lucide-react"; 
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom"; 
// 🚀 FIX 2: Format price ke liye context import kiya (agar available ho)
import { useCurrency } from "../../context/CurrencyContext"; 

export default function Categories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);

  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart(); 
  const navigate = useNavigate();
  const { formatPrice } = useCurrency(); // Format consistency ke liye

  // 1. LIVE DATA STREAMING FROM FIRESTORE
  useEffect(() => {
    const fetchAllLovedProducts = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        setProducts(items);
      } catch (err) {
        console.error("Error loading loved creations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLovedProducts();
  }, []);

  // 2. LOAD MORE / SHOW LESS CONTROLLER
  const handleViewMoreToggle = () => {
    if (visibleCount >= products.length) {
      setVisibleCount(4); 
    } else {
      setVisibleCount(prev => prev + 4); 
    }
  };

  // 3. BUY NOW LOGIC
  const handleBuyNow = (e, item) => {
    e.stopPropagation(); // Card click rokne ke liye
    addToCart(item, false);
    navigate("/checkout");
  };

  return (
    // 📱 RESPONSIVE: Mobile padding aur spacing adjust ki
    <section className="py-12 md:py-16 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        
        {/* HEADING (Responsive Text Sizes) */}
        <h2 className="text-center text-3xl md:text-[56px] leading-tight font-serif text-[#3a2417] tracking-wide mb-3 md:mb-4">
          Our most LOVED
        </h2>
        <p className="text-center text-gray-500 text-xs md:text-sm font-light uppercase tracking-widest mb-8 md:mb-12 px-4">
          Handcrafted Premium Masterpieces Curated Just For You
        </p>

        {/* INTERACTIVE PRODUCTS DYNAMIC UNIFIED GRID */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-mono text-sm animate-pulse">
            Syncing All Admin Products Feed...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 md:py-20 text-gray-400 font-light text-sm md:text-base bg-white/40 rounded-[2rem] border border-dashed mt-6">
            Database empty hai. Admin Panel se products upload kijiye!
          </div>
        ) : (
          <div>
            {/* 📱 RESPONSIVE GRID: Mobile(1), Tablet(2), Desktop(4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {products.slice(0, visibleCount).map((item) => {
                const isLiked = wishlistItems.some(wish => wish.id === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-300 cursor-pointer animate-fade-in"
                  >
                    
                    {/* Premium Image Container */}
                    <div className="h-[260px] sm:h-[300px] md:h-[340px] bg-gray-50 overflow-hidden relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      
                      {/* ❤️ WISHLIST HOOK */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(item);
                        }}
                        className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer border-none flex items-center justify-center w-8 h-8 md:w-9 md:h-9 z-20 active:scale-90 transition-transform hover:bg-white"
                      >
                        <Heart 
                          size={16} 
                          className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} 
                        />
                      </button>
                    </div>

                    {/* Meta details footer info section */}
                    <div className="flex flex-col p-4 md:p-5 flex-1">
                      <h3 className="text-gray-900 font-bold text-[15px] md:text-base tracking-wide line-clamp-2 leading-tight group-hover:text-[#6e4b31] transition-colors">
                        {item.name}
                      </h3>
                      
                      <div className="flex mt-2 mb-1">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono uppercase tracking-widest">
                          {item.category || "Masterpiece"}
                        </span>
                      </div>
                      
                      {/* 🚀 PREMIUM BUY ROW */}
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <span className="text-lg md:text-xl font-black text-[#6e4b31]">
                          {formatPrice && typeof formatPrice === 'function' 
                            ? formatPrice(item.price) 
                            : `₹${item.price ? item.price.toLocaleString('en-IN') : "0"}.00`
                          }
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Add to Cart Icon Button */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                            className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer active:scale-95"
                            title="Add to Cart"
                          >
                            <ShoppingCart size={18} />
                          </button>
                          
                          {/* BUY NOW Button */}
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

            {/* VIEW MORE PRODUCTS BUTTON */}
            {products.length > 4 && (
              <button 
                onClick={handleViewMoreToggle}
                className="block mx-auto mt-10 md:mt-14 border border-[#3a2417] bg-transparent text-[#3a2417] px-8 md:px-12 py-3 hover:bg-[#3a2417] hover:text-white transition-all font-medium rounded-xl cursor-pointer text-xs md:text-sm uppercase tracking-wider shadow-xs"
              >
                {visibleCount >= products.length ? "Show Less Pieces" : "View More Products"}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}