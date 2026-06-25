// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { db } from "../../firebase/firebase";
// import { collection, onSnapshot } from "firebase/firestore";
// import { Heart } from "lucide-react";
// import { useWishlist } from "../../context/WishlistContext";
// import { useCart } from "../../context/CartContext";
// import { useCurrency } from "../../context/CurrencyContext";

// export default function ProductPageTemplate({ pageTitle, allowedCategories = [] }) {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [loading, setLoading] = useState(true);
  
//   // ✅ SIRF NAYA FUNCTION IMPORT KIYA HAI
//   const { formatPrice } = useCurrency();
  
//   const [dynamicCategories, setDynamicCategories] = useState(allowedCategories);

//   const location = useLocation();
//   const { wishlistItems, toggleWishlist } = useWishlist();
//   const { addToCart } = useCart();

//   // 🚀 HAR TARAH KE SPACES AUR CASE KO HANDLE KARNE KE LIYE SAFE STRING FUNCTION
//   const safeString = (str) => (str ? str.toString().toUpperCase().trim() : "");
  
//   const currentMenu = safeString(pageTitle);

//   useEffect(() => {
//     if (location.state && location.state.filterCategory) {
//       setActiveFilter(location.state.filterCategory);
//     } else {
//       setActiveFilter("All");
//     }
//   }, [location.state]);

//   useEffect(() => {
//     setLoading(true);

//     // 1. Fetch Categories (Case-insensitive match)
//     const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
//       const fetchedCats = snap.docs.map(doc => doc.data());
      
//       const menuCats = fetchedCats
//         .filter(c => safeString(c.menu) === currentMenu)
//         .map(c => c.name); // Asal naam hi rakhenge UI ke liye

//       // Duplicate hatane ka safe tarika
//       const allMerged = [...allowedCategories, ...menuCats];
//       const uniqueCats = Array.from(new Set(allMerged.map(c => c.trim())));
//       setDynamicCategories(uniqueCats);
//     });

//     // 2. Fetch Products (Case-insensitive match)
//     const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
//       const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

//       const pageScopeProducts = items.filter(p => {
//         const matchMenu = safeString(p.parentMenu) === currentMenu;
//         const matchOldCat = allowedCategories.some(ac => safeString(ac) === safeString(p.category));
//         return matchMenu || matchOldCat;
//       });

//       setProducts(pageScopeProducts);
//       setLoading(false);
//     });

//     return () => {
//       unsubCategories();
//       unsubProducts();
//     };
//   }, [currentMenu, allowedCategories]);

//   // 3. 🚀 STRICT CASE-INSENSITIVE FILTERING FOR PRODUCTS
//   useEffect(() => {
//     if (safeString(activeFilter) === "ALL") {
//       setFilteredProducts(products);
//     } else {
//       setFilteredProducts(products.filter(p => safeString(p.category) === safeString(activeFilter)));
//     }
//   }, [activeFilter, products]);

//   const handleFilterSelect = (category) => {
//     setActiveFilter(category);
//   };

//   if (loading) return <div className="p-20 text-center text-[#6e4b31] animate-pulse font-mono text-sm">Loading Live Collection...</div>;

//   return (
//     <div className="bg-[#f9f9f9] min-h-screen py-10 px-10">
//       <div className="max-w-7xl mx-auto">
//         <h1 className="text-3xl font-serif font-bold text-center text-gray-900 mb-8 uppercase tracking-wide">{pageTitle}</h1>
        
//         {/* ======================= TABS UI ======================= */}
//         <div className="flex flex-wrap justify-center gap-4 mb-12">
//           <button 
//             onClick={() => handleFilterSelect("All")} 
//             className={`px-6 py-2.5 rounded-full text-sm font-medium border cursor-pointer transition-all ${
//               safeString(activeFilter) === "ALL" 
//                 ? "bg-[#6e4b31] text-white border-[#6e4b31] shadow-md" 
//                 : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
//             }`}
//           >
//             ALL
//           </button>
          
//           {dynamicCategories.map(cat => (
//             <button
//               key={cat}
//               onClick={() => handleFilterSelect(cat)}
//               className={`px-6 py-2.5 rounded-full text-sm font-medium border cursor-pointer uppercase transition-all ${
//                 safeString(activeFilter) === safeString(cat)
//                   ? "bg-[#6e4b31] text-white border-[#6e4b31] shadow-md" 
//                   : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
//               }`}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>

//         {/* ======================= PRODUCTS GRID ======================= */}
//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-20 bg-white border border-gray-200 rounded-[2rem] text-gray-400 font-light text-sm shadow-sm">
//             Is category mein abhi koi products upload nahi hue hain.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
//             {filteredProducts.map((item) => {
//               const isLiked = wishlistItems.some(wish => wish.id === item.id);
//               return (
//                 <div key={item.id} className="group relative flex flex-col bg-transparent overflow-hidden">
                  
//                   <div className="h-[380px] bg-gray-100 rounded-[2rem] overflow-hidden relative shadow-xs">
//                     <img src={item.image} alt="" className="w-full h-full object-cover" />
                    
//                     <button 
//                       onClick={() => toggleWishlist(item)}
//                       className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md cursor-pointer border-none flex items-center justify-center w-9 h-9 z-20 active:scale-90 transition-transform hover:bg-gray-50"
//                     >
//                       <Heart size={16} className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
//                     </button>

//                     <div 
//                       onClick={() => addToCart(item)}
//                       className="absolute bottom-0 left-0 w-full bg-black/80 hover:bg-black py-4 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-10 cursor-pointer flex justify-center items-center gap-2"
//                     >
//                       <span className="text-white text-xs font-bold tracking-widest uppercase">Add To Cart</span>
//                     </div>
//                   </div>

//                   <div className="mt-4 flex flex-col gap-1.5 px-2">
//                     <h3 className="text-gray-800 font-medium text-[15px] tracking-wide line-clamp-2 leading-tight">{item.name}</h3>
                    
//                     <div className="flex">
//                       <span className="text-[9px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-mono uppercase tracking-widest">
//                         {item.category}
//                       </span>
//                     </div>

//                     <div className="flex text-amber-500 text-xs my-0.5">★★★★★</div>
                    
//                     {/* ✅ YAHAN PARR FINAL FIX APPLY KIYA HAI */}
//                     <span className="text-base font-bold text-gray-900">
//                       {typeof formatPrice === "function" ? formatPrice(item.price) : `₹${item.price}`}
//                     </span>
//                   </div>

//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; 
import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Heart, ShoppingCart, Zap } from "lucide-react"; 
import { useWishlist } from "../../context/WishlistContext";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";

export default function ProductPageTemplate({ pageTitle, allowedCategories = [] }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  
  const { formatPrice } = useCurrency();
  const [dynamicCategories, setDynamicCategories] = useState(allowedCategories);

  const location = useLocation();
  const navigate = useNavigate(); 
  
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const safeString = (str) => (str ? str.toString().toUpperCase().trim() : "");
  const currentMenu = safeString(pageTitle);

  const handleBuyNow = (e, item) => {
    e.stopPropagation(); 
    addToCart(item);
    navigate("/checkout");
  };

  useEffect(() => {
    if (location.state && location.state.filterCategory) {
      setActiveFilter(location.state.filterCategory);
    } else {
      setActiveFilter("All");
    }
  }, [location.state]);

  useEffect(() => {
    setLoading(true);

    const unsubCategories = onSnapshot(collection(db, "categories"), (snap) => {
      const fetchedCats = snap.docs.map(doc => doc.data());
      
      const menuCats = fetchedCats
        .filter(c => safeString(c.menu) === currentMenu)
        .map(c => c.name); 

      const allMerged = [...allowedCategories, ...menuCats];
      const uniqueCats = Array.from(new Set(allMerged.map(c => c.trim())));
      setDynamicCategories(uniqueCats);
    });

    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const pageScopeProducts = items.filter(p => {
        const matchMenu = safeString(p.parentMenu) === currentMenu;
        const matchOldCat = allowedCategories.some(ac => safeString(ac) === safeString(p.category));
        return matchMenu || matchOldCat;
      });

      setProducts(pageScopeProducts);
      setLoading(false);
    });

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, [currentMenu, allowedCategories]);

  useEffect(() => {
    if (safeString(activeFilter) === "ALL") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => safeString(p.category) === safeString(activeFilter)));
    }
  }, [activeFilter, products]);

  const handleFilterSelect = (category) => {
    setActiveFilter(category);
  };

  if (loading) return <div className="p-20 text-center text-[#6e4b31] animate-pulse font-mono text-sm">Loading Live Collection...</div>;

  return (
    <div className="bg-[#f9f9f9] min-h-screen py-8 md:py-10 px-4 sm:px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-center text-gray-900 mb-6 md:mb-8 uppercase tracking-wide">
          {pageTitle}
        </h1>
        
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 md:mb-12">
          <button 
            onClick={() => handleFilterSelect("All")} 
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border cursor-pointer transition-all ${
              safeString(activeFilter) === "ALL" 
                ? "bg-[#6e4b31] text-white border-[#6e4b31] shadow-md" 
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
            }`}
          >
            ALL
          </button>
          
          {dynamicCategories.map(cat => (
            <button
              key={cat}
              onClick={() => handleFilterSelect(cat)}
              className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium border cursor-pointer uppercase transition-all ${
                safeString(activeFilter) === safeString(cat)
                  ? "bg-[#6e4b31] text-white border-[#6e4b31] shadow-md" 
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 md:py-20 bg-white border border-gray-200 rounded-[2rem] text-gray-400 font-light text-sm shadow-sm mx-2">
            Is category mein abhi koi products upload nahi hue hain.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((item) => {
              const isLiked = wishlistItems.some(wish => wish.id === item.id);
              return (
                <div key={item.id} className="group relative flex flex-col bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xs hover:shadow-xl transition-shadow duration-300">
                  
                  <div className="h-[260px] sm:h-[300px] md:h-[340px] bg-gray-50 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" 
                    />
                    
                    <button 
                      onClick={() => toggleWishlist(item)}
                      className="absolute top-3 md:top-4 right-3 md:right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm cursor-pointer border-none flex items-center justify-center w-8 h-8 md:w-9 md:h-9 z-20 active:scale-90 transition-transform hover:bg-white"
                    >
                      <Heart size={16} className={`transition-colors duration-200 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
                    </button>
                  </div>

                  <div className="flex flex-col p-4 md:p-5 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="text-gray-900 font-bold text-[15px] md:text-base tracking-wide line-clamp-2 leading-tight cursor-pointer hover:text-[#6e4b31] transition-colors flex-1"
                      >
                        {item.name}
                      </h3>
                    </div>
                    
                    <div className="flex mt-2 mb-1">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono uppercase tracking-widest">
                        {item.category}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <span className="text-lg md:text-xl font-black text-[#6e4b31]">
                        {typeof formatPrice === "function" ? formatPrice(item.price) : `₹${item.price}`}
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
    </div>
  );
}