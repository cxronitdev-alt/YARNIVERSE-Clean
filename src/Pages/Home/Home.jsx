// import { useState, useEffect } from "react";
// import HeroSlider from "../../components/home/HeroSlider";
// import Categories from "../../components/home/Categories";
// import AuthModal from "../Auth/AuthModal";

// import { db } from "../../firebase/firebase";
// import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
// // 🚀 Icons import kiye naye design ke liye
// import { Heart, ShoppingCart, Zap } from "lucide-react"; 
// import { useNavigate } from "react-router-dom";
// import { useWishlist } from "../../context/WishlistContext";
// import { useCart } from "../../context/CartContext"; 
// import { useCurrency } from "../../context/CurrencyContext"; // 🚀 Currency format

// export default function Home() {
//   const [showAuth, setShowAuth] = useState(false);
//   const navigate = useNavigate();
  
//   const [newArrivals, setNewArrivals] = useState([]);
//   const [categorizedProducts, setCategorizedProducts] = useState({}); 
//   const [loading, setLoading] = useState(true);

//   const { wishlistItems, toggleWishlist } = useWishlist();
//   const { addToCart } = useCart(); 
//   const { formatPrice } = useCurrency(); // Same formatting as other pages

//   // 🚀 BUY NOW Logic
//   const handleBuyNow = (e, item) => {
//     e.stopPropagation(); 
//     addToCart(item);
//     navigate("/checkout");
//   };

//   useEffect(() => {
//     const fetchSynchronizedData = async () => {
//       try {
//         setLoading(true);
        
//         // 1. Fetch New Arrivals (Latest 4 pieces)
//         const latestQuery = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(4));
//         const latestSnap = await getDocs(latestQuery);
//         setNewArrivals(latestSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

//         // 2. Fetch All Products to group them
//         const allSnap = await getDocs(collection(db, "products"));
//         const allItems = allSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

//         const groups = {};
//         allItems.forEach((item) => {
//           if (item.category) {
//             if (!groups[item.category]) {
//               groups[item.category] = [];
//             }
//             groups[item.category].push(item);
//           }
//         });

//         setCategorizedProducts(groups); 
//       } catch (err) {
//         console.error("Home data fetching crashed:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSynchronizedData();
//   }, []);

//   return (
//     <div className="bg-[#f9f9f9] text-gray-900 min-h-screen antialiased font-sans overflow-hidden">
//       <HeroSlider />
//       <Categories />

//       {/* ================= SECTION 1: THE NEW ARRIVALS GRID ================= */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12">
//         <div className="mb-6 md:mb-8 border-b border-gray-200 pb-4">
//           <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-[#3a2417]">✨ THE NEW ARRIVALS</h2>
//         </div>

//         {loading ? (
//           <div className="text-center py-10 text-gray-400 font-mono text-xs animate-pulse">Syncing New Arrivals...</div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             {newArrivals.map((item) => {
//               const isLiked = wishlistItems.some(wish => wish.id === item.id); 
//               return (
//                 <div key={item.id} className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-300">
                  
//                   {/* Premium Image Section */}
//                   <div className="h-[260px] sm:h-[300px] md:h-[340px] bg-gray-50 overflow-hidden relative">
//                     <img 
//                       src={`${item.image}?t=${Date.now()}`} 
//                       alt={item.name} 
//                       className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
//                       crossOrigin="anonymous" 
//                       onClick={() => navigate(`/product/${item.id}`)}
//                     />
                    
//                     <button 
//                       onClick={() => toggleWishlist(item)}
//                       className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer border-none flex items-center justify-center w-8 h-8 md:w-9 md:h-9 z-20 active:scale-90 transition-transform hover:bg-white"
//                     >
//                       <Heart size={16} className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
//                     </button>
//                   </div>

//                   {/* Details & Action Section */}
//                   <div className="flex flex-col p-4 md:p-5 flex-1">
//                     <h3 
//                       className="text-gray-900 font-bold text-[15px] md:text-base tracking-wide line-clamp-2 leading-tight cursor-pointer hover:text-[#6e4b31] transition-colors"
//                       onClick={() => navigate(`/product/${item.id}`)}
//                     >
//                       {item.name}
//                     </h3>
                    
//                     <div className="flex mt-2 mb-1">
//                       <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono uppercase tracking-widest">
//                         {item.category || "Craft"}
//                       </span>
//                     </div>

//                     <div className="mt-auto pt-4 flex items-center justify-between">
//                       <span className="text-lg md:text-xl font-black text-[#6e4b31]">
//                         {formatPrice && typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${item.price}`}
//                       </span>

//                       <div className="flex items-center gap-2">
//                         <button 
//                           onClick={(e) => { e.stopPropagation(); addToCart(item); }}
//                           className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer active:scale-95"
//                           title="Add to Cart"
//                         >
//                           <ShoppingCart size={18} />
//                         </button>
                        
//                         <button 
//                           onClick={(e) => handleBuyNow(e, item)}
//                           className="flex items-center gap-1.5 px-4 h-10 bg-gradient-to-r from-[#6e4b31] to-[#4a3221] hover:from-[#4a3221] hover:to-[#2d1e14] text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
//                         >
//                           <Zap size={16} className="fill-white/20" /> BUY
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* ================= SECTION 2: DYNAMIC CATEGORY GRIDS ================= */}
//       {Object.keys(categorizedProducts).map((categoryName) => (
//         <div key={categoryName} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8 md:py-12">
          
//           <div className="mb-6 md:mb-8 border-b border-gray-200 pb-3 md:pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0">
//             <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-wide text-[#3a2417] uppercase">
//               🔥 {categoryName} COLLECTION
//             </h2>
//             <span 
//               onClick={() => navigate("/all-handcraft", { state: { filterCategory: categoryName } })} 
//               className="text-[10px] md:text-xs font-mono font-bold tracking-wider text-[#6e4b31] underline cursor-pointer uppercase hover:text-black"
//             >
//               View All ({categorizedProducts[categoryName].length})
//             </span>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             {categorizedProducts[categoryName].slice(0, 4).map((item) => {
//               const isLiked = wishlistItems.some(wish => wish.id === item.id);
//               return (
//                 <div key={item.id} className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-300">
                  
//                   {/* Premium Image Section */}
//                   <div className="h-[260px] sm:h-[300px] md:h-[340px] bg-gray-50 overflow-hidden relative">
//                     <img 
//                       src={`${item.image}?t=${Date.now()}`} 
//                       alt={item.name} 
//                       className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
//                       crossOrigin="anonymous" 
//                       onClick={() => navigate(`/product/${item.id}`)}
//                     />
                    
//                     <button 
//                       onClick={() => toggleWishlist(item)}
//                       className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer border-none flex items-center justify-center w-8 h-8 md:w-9 md:h-9 z-20 active:scale-90 transition-transform hover:bg-white"
//                     >
//                       <Heart size={16} className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
//                     </button>
//                   </div>

//                   {/* Details & Action Section */}
//                   <div className="flex flex-col p-4 md:p-5 flex-1">
//                     <h3 
//                       className="text-gray-900 font-bold text-[15px] md:text-base tracking-wide line-clamp-2 leading-tight cursor-pointer hover:text-[#6e4b31] transition-colors"
//                       onClick={() => navigate(`/product/${item.id}`)}
//                     >
//                       {item.name}
//                     </h3>
                    
//                     <div className="flex mt-2 mb-1">
//                       <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono uppercase tracking-widest">
//                         {item.category || "Craft"}
//                       </span>
//                     </div>

//                     <div className="mt-auto pt-4 flex items-center justify-between">
//                       <span className="text-lg md:text-xl font-black text-[#6e4b31]">
//                         {formatPrice && typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${item.price}`}
//                       </span>

//                       <div className="flex items-center gap-2">
//                         <button 
//                           onClick={(e) => { e.stopPropagation(); addToCart(item); }}
//                           className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors cursor-pointer active:scale-95"
//                           title="Add to Cart"
//                         >
//                           <ShoppingCart size={18} />
//                         </button>
                        
//                         <button 
//                           onClick={(e) => handleBuyNow(e, item)}
//                           className="flex items-center gap-1.5 px-4 h-10 bg-gradient-to-r from-[#6e4b31] to-[#4a3221] hover:from-[#4a3221] hover:to-[#2d1e14] text-white text-xs md:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
//                         >
//                           <Zap size={16} className="fill-white/20" /> BUY
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       ))}

//       {showAuth && <AuthModal closeModal={() => setShowAuth(false)} />}
//     </div>
//   );
// }

import { useState, useEffect } from "react";
import HeroSlider from "../../components/home/HeroSlider";
import Categories from "../../components/home/Categories";
import AuthModal from "../Auth/AuthModal";
import { db } from "../../firebase/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Heart, ShoppingCart, Zap, Sparkles, ArrowRight, ChevronRight } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext"; 
import { useCurrency } from "../../context/CurrencyContext";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();
  
  const [newArrivals, setNewArrivals] = useState([]);
  const [categorizedProducts, setCategorizedProducts] = useState({}); 
  const [loading, setLoading] = useState(true);

  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart(); 
  const { formatPrice } = useCurrency();

  // BUY NOW Logic
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

  // Loading skeleton component
  const ProductSkeleton = () => (
    <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden animate-pulse">
      <div className="aspect-[3/4] sm:aspect-[4/5] bg-gray-200"></div>
      <div className="p-2 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2">
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-2.5 sm:h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#faf8f5] via-[#f8f5f0] to-[#f5f2ed] text-gray-900 min-h-screen antialiased font-sans overflow-hidden">
      <HeroSlider />
      <Categories />

      {/* ================= SECTION 1: THE NEW ARRIVALS GRID ================= */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <div>
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <Sparkles size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold tracking-wide text-[#3a2417]">
                ✨ THE NEW ARRIVALS
              </h2>
            </div>
            <div className="w-12 sm:w-16 md:w-20 h-[2px] bg-gradient-to-r from-[#6e4b31] to-transparent"></div>
          </div>
          <button 
            onClick={() => navigate("/new-arrivals")}
            className="text-[10px] sm:text-xs font-medium text-[#6e4b31] hover:text-[#3a2417] transition-colors flex items-center gap-1 group"
          >
            View All 
            <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-white/50 rounded-2xl sm:rounded-3xl border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart size={18} className="text-gray-300 sm:w-5 sm:h-5" />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-light tracking-wide">
              No new arrivals yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-6">
            {newArrivals.map((item) => {
              const isLiked = wishlistItems.some(wish => wish.id === item.id); 
              return (
                <div key={item.id} className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 md:duration-500 hover:-translate-y-0.5 md:hover:-translate-y-1">
                  
                  {/* Premium Image Section */}
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-gray-50 overflow-hidden">
                    <img 
                      src={`${item.image}?t=${Date.now()}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500 md:duration-700 group-hover:scale-105 md:group-hover:scale-110" 
                      crossOrigin="anonymous" 
                      onClick={() => navigate(`/product/${item.id}`)}
                      loading="lazy"
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3 z-10">
                      <span className="text-[7px] sm:text-[9px] md:text-[10px] bg-white/95 backdrop-blur-sm text-[#6e4b31] px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded-full font-medium uppercase tracking-wider shadow-sm">
                        {item.category || "New"}
                      </span>
                    </div>

                    {/* Wishlist Button */}
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

                    {/* Desktop Quick Actions Overlay */}
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

                  {/* Details & Mobile Actions */}
                  <div className="flex flex-col p-2 sm:p-2.5 md:p-3 lg:p-4 flex-1">
                    <h3 
                      className="text-gray-900 font-semibold text-[11px] sm:text-xs md:text-sm lg:text-base leading-snug line-clamp-2 cursor-pointer hover:text-[#6e4b31] transition-colors mb-0.5 sm:mb-1"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>

                    <div className="mt-auto pt-1.5 sm:pt-2 flex items-center justify-between">
                      <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-[#6e4b31]">
                        {formatPrice && typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${item.price}`}
                      </span>

                      {/* Mobile/Tablet Action Buttons */}
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
        )}
      </div>

      {/* ================= SECTION 2: DYNAMIC CATEGORY GRIDS ================= */}
      {Object.keys(categorizedProducts).map((categoryName) => (
        <div key={categoryName} className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
          
          <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div>
              <div className="flex items-center gap-2 mb-1 sm:mb-2">
                <Sparkles size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif font-bold tracking-wide text-[#3a2417] uppercase">
                  🔥 {categoryName} COLLECTION
                </h2>
              </div>
              <div className="w-12 sm:w-16 md:w-20 h-[2px] bg-gradient-to-r from-[#6e4b31] to-transparent"></div>
            </div>
            <button 
              onClick={() => navigate("/all-handcraft", { state: { filterCategory: categoryName } })}
              className="text-[10px] sm:text-xs font-medium text-[#6e4b31] hover:text-[#3a2417] transition-colors flex items-center gap-1.5 sm:gap-2 group bg-white/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-white"
            >
              View All ({categorizedProducts[categoryName].length})
              <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 xl:gap-6">
            {categorizedProducts[categoryName].slice(0, 4).map((item) => {
              const isLiked = wishlistItems.some(wish => wish.id === item.id);
              return (
                <div key={item.id} className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 md:duration-500 hover:-translate-y-0.5 md:hover:-translate-y-1">
                  
                  {/* Premium Image Section */}
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-gray-50 overflow-hidden">
                    <img 
                      src={`${item.image}?t=${Date.now()}`} 
                      alt={item.name} 
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500 md:duration-700 group-hover:scale-105 md:group-hover:scale-110" 
                      crossOrigin="anonymous" 
                      onClick={() => navigate(`/product/${item.id}`)}
                      loading="lazy"
                    />
                    
                    {/* Category Badge */}
                    <div className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3 z-10">
                      <span className="text-[7px] sm:text-[9px] md:text-[10px] bg-white/95 backdrop-blur-sm text-[#6e4b31] px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-2.5 md:py-1 rounded-full font-medium uppercase tracking-wider shadow-sm">
                        {item.category || "Craft"}
                      </span>
                    </div>

                    {/* Wishlist Button */}
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

                    {/* Desktop Quick Actions */}
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

                  {/* Details & Mobile Actions */}
                  <div className="flex flex-col p-2 sm:p-2.5 md:p-3 lg:p-4 flex-1">
                    <h3 
                      className="text-gray-900 font-semibold text-[11px] sm:text-xs md:text-sm lg:text-base leading-snug line-clamp-2 cursor-pointer hover:text-[#6e4b31] transition-colors mb-0.5 sm:mb-1"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>

                    <div className="mt-auto pt-1.5 sm:pt-2 flex items-center justify-between">
                      <span className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-[#6e4b31]">
                        {formatPrice && typeof formatPrice === 'function' ? formatPrice(item.price) : `₹${item.price}`}
                      </span>

                      {/* Mobile/Tablet Action Buttons */}
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
        </div>
      ))}

      {/* Empty State for no categories */}
      {!loading && Object.keys(categorizedProducts).length === 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <div className="inline-block p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-50 flex items-center justify-center">
              <ShoppingCart size={18} className="text-gray-300 sm:w-5 sm:h-5" />
            </div>
            <p className="text-gray-400 text-xs sm:text-sm font-light tracking-wide">
              Products coming soon. Stay tuned!
            </p>
          </div>
        </div>
      )}

      {showAuth && <AuthModal closeModal={() => setShowAuth(false)} />}
    </div>
  );
}