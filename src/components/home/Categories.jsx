// import { useState, useEffect } from "react";
// import { db } from "../../firebase/firebase";
// import { collection, getDocs, query, orderBy } from "firebase/firestore";
// // 🚀 FIX 1: Naye premium icons import kiye
// import { Heart, ShoppingCart, Zap } from "lucide-react"; 
// import { useWishlist } from "../../context/WishlistContext";
// import { useCart } from "../../context/CartContext";
// import { useNavigate } from "react-router-dom"; 
// // 🚀 FIX 2: Format price ke liye context import kiya (agar available ho)
// import { useCurrency } from "../../context/CurrencyContext"; 

// export default function Categories() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [visibleCount, setVisibleCount] = useState(4);

//   const { wishlistItems, toggleWishlist } = useWishlist();
//   const { addToCart } = useCart(); 
//   const navigate = useNavigate();
//   const { formatPrice } = useCurrency(); // Format consistency ke liye

//   // 1. LIVE DATA STREAMING FROM FIRESTORE
//   useEffect(() => {
//     const fetchAllLovedProducts = async () => {
//       try {
//         setLoading(true);
//         const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
//         const snap = await getDocs(q);
//         const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
//         setProducts(items);
//       } catch (err) {
//         console.error("Error loading loved creations:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAllLovedProducts();
//   }, []);

//   // 2. LOAD MORE / SHOW LESS CONTROLLER
//   const handleViewMoreToggle = () => {
//     if (visibleCount >= products.length) {
//       setVisibleCount(4); 
//     } else {
//       setVisibleCount(prev => prev + 4); 
//     }
//   };

//   // 3. BUY NOW LOGIC
//   const handleBuyNow = (e, item) => {
//     e.stopPropagation(); // Card click rokne ke liye
//     addToCart(item, false);
//     navigate("/checkout");
//   };

//   return (
//     // 📱 RESPONSIVE: Mobile padding aur spacing adjust ki
//     <section className="py-12 md:py-16 bg-[#f5f5f5]">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
        
//         {/* HEADING (Responsive Text Sizes) */}
//         <h2 className="text-center text-3xl md:text-[56px] leading-tight font-serif text-[#3a2417] tracking-wide mb-3 md:mb-4">
//           Our most LOVED
//         </h2>
//         <p className="text-center text-gray-500 text-xs md:text-sm font-light uppercase tracking-widest mb-8 md:mb-12 px-4">
//           Handcrafted Premium Masterpieces Curated Just For You
//         </p>

//         {/* INTERACTIVE PRODUCTS DYNAMIC UNIFIED GRID */}
//         {loading ? (
//           <div className="text-center py-20 text-gray-400 font-mono text-sm animate-pulse">
//             Syncing All Admin Products Feed...
//           </div>
//         ) : products.length === 0 ? (
//           <div className="text-center py-16 md:py-20 text-gray-400 font-light text-sm md:text-base bg-white/40 rounded-[2rem] border border-dashed mt-6">
//             Database empty hai. Admin Panel se products upload kijiye!
//           </div>
//         ) : (
//           <div>
//             {/* 📱 RESPONSIVE GRID: Mobile(1), Tablet(2), Desktop(4) */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//               {products.slice(0, visibleCount).map((item) => {
//                 const isLiked = wishlistItems.some(wish => wish.id === item.id);

//                 return (
//                   <div
//                     key={item.id}
//                     onClick={() => navigate(`/product/${item.id}`)}
//                     className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-300 cursor-pointer animate-fade-in"
//                   >
                    
//                     {/* Premium Image Container */}
//                     <div className="h-[260px] sm:h-[300px] md:h-[340px] bg-gray-50 overflow-hidden relative">
//                       <img 
//                         src={item.image} 
//                         alt={item.name} 
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
//                       />
                      
//                       {/* ❤️ WISHLIST HOOK */}
//                       <button 
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           toggleWishlist(item);
//                         }}
//                         className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer border-none flex items-center justify-center w-8 h-8 md:w-9 md:h-9 z-20 active:scale-90 transition-transform hover:bg-white"
//                       >
//                         <Heart 
//                           size={16} 
//                           className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} 
//                         />
//                       </button>
//                     </div>

//                     {/* Meta details footer info section */}
//                     <div className="flex flex-col p-4 md:p-5 flex-1">
//                       <h3 className="text-gray-900 font-bold text-[15px] md:text-base tracking-wide line-clamp-2 leading-tight group-hover:text-[#6e4b31] transition-colors">
//                         {item.name}
//                       </h3>
                      
//                       <div className="flex mt-2 mb-1">
//                         <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono uppercase tracking-widest">
//                           {item.category || "Masterpiece"}
//                         </span>
//                       </div>
                      
//                       {/* 🚀 PREMIUM BUY ROW */}
//                       <div className="mt-auto pt-4 flex items-center justify-between">
//                         <span className="text-lg md:text-xl font-black text-[#6e4b31]">
//                           {formatPrice && typeof formatPrice === 'function' 
//                             ? formatPrice(item.price) 
//                             : `₹${item.price ? item.price.toLocaleString('en-IN') : "0"}.00`
//                           }
//                         </span>

//                         <div className="flex items-center gap-2">
//                           {/* Add to Cart Icon Button */}
//                           <button 
//                             onClick={(e) => { e.stopPropagation(); addToCart(item); }}
//                             className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer active:scale-95"
//                             title="Add to Cart"
//                           >
//                             <ShoppingCart size={18} />
//                           </button>
                          
//                           {/* BUY NOW Button */}
//                           <button 
//                             onClick={(e) => handleBuyNow(e, item)}
//                             className="flex items-center gap-1.5 px-4 h-10 bg-gradient-to-r from-[#6e4b31] to-[#4a3221] hover:from-[#4a3221] hover:to-[#2d1e14] text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
//                           >
//                             <Zap size={16} className="fill-white/20" /> BUY
//                           </button>
//                         </div>
//                       </div>
//                     </div>

//                   </div>
//                 );
//               })}
//             </div>

//             {/* VIEW MORE PRODUCTS BUTTON */}
//             {products.length > 4 && (
//               <button 
//                 onClick={handleViewMoreToggle}
//                 className="block mx-auto mt-10 md:mt-14 border border-[#3a2417] bg-transparent text-[#3a2417] px-8 md:px-12 py-3 hover:bg-[#3a2417] hover:text-white transition-all font-medium rounded-xl cursor-pointer text-xs md:text-sm uppercase tracking-wider shadow-xs"
//               >
//                 {visibleCount >= products.length ? "Show Less Pieces" : "View More Products"}
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Heart, ShoppingCart, Zap, Sparkles, ArrowRight } from "lucide-react"; 
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom"; 
import { useCurrency } from "../../context/CurrencyContext"; 

export default function Categories() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4);

  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart(); 
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Live data streaming from Firestore
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

  // Load more / Show less controller
  const handleViewMoreToggle = () => {
    if (visibleCount >= products.length) {
      setVisibleCount(4); 
      document.getElementById('loved-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setVisibleCount(prev => prev + 4); 
    }
  };

  // Buy now logic
  const handleBuyNow = (e, item) => {
    e.stopPropagation();
    addToCart(item, false);
    navigate("/checkout");
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-[#faf8f5] via-[#f8f5f0] to-[#f5f2ed]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <div className="h-8 sm:h-10 md:h-14 w-48 sm:w-64 md:w-80 lg:w-96 bg-gray-200 rounded-lg mx-auto mb-3 sm:mb-4 animate-pulse"></div>
            <div className="h-3 sm:h-4 w-36 sm:w-48 md:w-64 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gray-200"></div>
                <div className="p-2 sm:p-3 md:p-4 lg:p-5 space-y-1.5 sm:space-y-2 md:space-y-3">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="loved-section" className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-[#faf8f5] via-[#f8f5f0] to-[#f5f2ed] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-[#6e4b31]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-[#6e4b31]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
        
        {/* Heading Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
            <Sparkles size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
            <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-[#6e4b31] uppercase tracking-[0.15em] sm:tracking-[0.2em]">Curated Collection</span>
            <Sparkles size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[56px] leading-tight font-serif text-[#3a2417] mb-2 sm:mb-3 md:mb-4 tracking-wide">
            Our most LOVED
          </h2>
          <div className="w-12 sm:w-16 md:w-20 lg:w-24 h-[1px] bg-gradient-to-r from-transparent via-[#6e4b31] to-transparent mx-auto mb-2 sm:mb-3 md:mb-4"></div>
          <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm font-light uppercase tracking-[0.1em] sm:tracking-[0.15em] max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto px-2 sm:px-4">
            Handcrafted Premium Masterpieces Curated Just For You
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20 lg:py-24">
            <div className="inline-block p-6 sm:p-8 md:p-10 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <ShoppingCart size={18} className="text-gray-300 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
              </div>
              <p className="text-gray-400 font-light text-xs sm:text-sm md:text-base tracking-wide">
                Database empty hai. Admin Panel se products upload kijiye!
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* 
              RESPONSIVE GRID BREAKDOWN:
              - Mobile (320px-640px): grid-cols-2 = 2 columns
              - Tablet (640px-1024px): sm:grid-cols-2 md:grid-cols-3 = 2-3 columns
              - Desktop (1024px+): lg:grid-cols-4 = 4 columns
              - Large Desktop (1280px+): xl:grid-cols-4 with more gap
            */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-6">
              {products.slice(0, visibleCount).map((item, index) => {
                const isLiked = wishlistItems.some(wish => wish.id === item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 md:duration-500 hover:-translate-y-0.5 md:hover:-translate-y-1 cursor-pointer animate-fade-in active:scale-[0.98] md:active:scale-100"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    
                    {/* Premium Image Container */}
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-gray-50 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 md:duration-700 ease-out group-hover:scale-105 md:group-hover:scale-110" 
                        loading="lazy"
                      />
                      
                      {/* Category Badge - Always visible */}
                      <div className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3 z-10">
                        <span className="text-[7px] sm:text-[9px] md:text-[10px] bg-white/95 backdrop-blur-sm text-[#6e4b31] px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded-full font-medium uppercase tracking-wider shadow-sm">
                          {item.category || "Premium"}
                        </span>
                      </div>

                      {/* Wishlist Button - Visible on mobile, hover on desktop */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(item);
                        }}
                        className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3 bg-white/90 backdrop-blur-sm p-1 sm:p-1.5 md:p-2 rounded-full shadow-lg cursor-pointer md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 z-20"
                      >
                        <Heart 
                          size={12} 
                          className={`transition-all duration-300 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} 
                        />
                      </button>

                      {/* Quick Actions Overlay - Desktop Only (md and up) */}
                      <div className="hidden md:block absolute bottom-0 left-0 right-0 p-2 lg:p-3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-1.5 lg:gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(item);
                            }}
                            className="flex-1 py-2 lg:py-2.5 bg-white text-gray-900 text-[10px] lg:text-xs font-medium rounded-xl lg:rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer active:scale-95"
                          >
                            Add to Cart
                          </button>
                          <button 
                            onClick={(e) => handleBuyNow(e, item)}
                            className="flex-1 py-2 lg:py-2.5 bg-[#6e4b31] text-white text-[10px] lg:text-xs font-medium rounded-xl lg:rounded-2xl hover:bg-[#5a3d28] transition-colors cursor-pointer active:scale-95"
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col p-2 sm:p-2.5 md:p-3 lg:p-4 flex-1">
                      <h3 className="text-gray-900 font-semibold text-[11px] sm:text-xs md:text-sm lg:text-base leading-snug line-clamp-2 group-hover:text-[#6e4b31] transition-colors mb-0.5 sm:mb-1">
                        {item.name}
                      </h3>
                      
                      {/* Price and Actions */}
                      <div className="mt-auto pt-1.5 sm:pt-2 md:pt-2.5 lg:pt-3 flex items-center justify-between">
                        <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-[#6e4b31]">
                          {formatPrice && typeof formatPrice === 'function' 
                            ? formatPrice(item.price) 
                            : `₹${item.price ? item.price.toLocaleString('en-IN') : "0"}`
                          }
                        </span>

                        {/* Mobile/Tablet Cart & Buy Buttons */}
                        <div className="flex items-center gap-1 sm:gap-1.5 md:hidden">
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              addToCart(item); 
                            }}
                            className="p-1 sm:p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl transition-all cursor-pointer active:scale-95"
                            title="Add to Cart"
                          >
                            <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => handleBuyNow(e, item)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#6e4b31] hover:bg-[#5a3d28] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wider rounded-lg sm:rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 flex items-center gap-0.5 sm:gap-1"
                          >
                            <Zap size={10} className="sm:w-3 sm:h-3" /> Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View More Button */}
            {products.length > 4 && (
              <div className="text-center mt-6 sm:mt-8 md:mt-10 lg:mt-12">
                <button 
                  onClick={handleViewMoreToggle}
                  className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 bg-white border-2 border-[#3a2417] text-[#3a2417] font-medium text-[10px] sm:text-xs md:text-sm uppercase tracking-wider rounded-full hover:bg-[#3a2417] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {visibleCount >= products.length ? (
                    <>
                      Show Less
                      <ArrowRight size={12} className="rotate-180 transition-transform group-hover:-translate-x-1 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    </>
                  ) : (
                    <>
                      View More Products
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    </>
                  )}
                </button>
                
                {/* Product count indicator */}
                <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 mt-1.5 sm:mt-2 md:mt-3 font-light tracking-wider">
                  Showing {Math.min(visibleCount, products.length)} of {products.length} masterpieces
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add custom CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}