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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#faf8f5] to-[#f5f0eb]">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-2 border-[#6e4b31] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[#6e4b31] font-light tracking-widest text-sm uppercase">Curating Collection...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-[#faf8f5] to-[#f5f0eb] min-h-screen py-8 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-light text-gray-900 mb-4 tracking-wide">
            {pageTitle}
          </h1>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#6e4b31] to-transparent mx-auto"></div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 md:mb-12 lg:mb-16">
          <button 
            onClick={() => handleFilterSelect("All")} 
            className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
              safeString(activeFilter) === "ALL" 
                ? "bg-[#6e4b31] text-white shadow-lg shadow-[#6e4b31]/20 scale-105" 
                : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md border border-gray-200/50"
            }`}
          >
            All
          </button>
          
          {dynamicCategories.map(cat => (
            <button
              key={cat}
              onClick={() => handleFilterSelect(cat)}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 ${
                safeString(activeFilter) === safeString(cat)
                  ? "bg-[#6e4b31] text-white shadow-lg shadow-[#6e4b31]/20 scale-105" 
                  : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:shadow-md border border-gray-200/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 lg:py-32">
            <div className="inline-block p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <ShoppingCart size={24} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-light text-sm tracking-wide uppercase">
                No products available in this category yet
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {filteredProducts.map((item) => {
              const isLiked = wishlistItems.some(wish => wish.id === item.id);
              return (
                <div key={item.id} className="group relative flex flex-col bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-gray-50 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      onClick={() => navigate(`/product/${item.id}`)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                    
                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(item);
                      }}
                      className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95 z-20"
                    >
                      <Heart 
                        size={16} 
                        className={`transition-all duration-300 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} 
                      />
                    </button>

                    {/* Quick Actions Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-1.5 sm:gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          className="flex-1 py-2 sm:py-2.5 bg-white text-gray-900 text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer active:scale-95"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={(e) => handleBuyNow(e, item)}
                          className="flex-1 py-2 sm:py-2.5 bg-[#6e4b31] text-white text-xs sm:text-sm font-medium rounded-xl sm:rounded-2xl hover:bg-[#5a3d28] transition-colors cursor-pointer active:scale-95"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-col p-3 sm:p-4 md:p-5 flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1 sm:mb-2">
                      <h3 
                        onClick={() => navigate(`/product/${item.id}`)}
                        className="text-gray-900 font-semibold text-xs sm:text-sm md:text-base leading-snug line-clamp-2 cursor-pointer hover:text-[#6e4b31] transition-colors flex-1"
                      >
                        {item.name}
                      </h3>
                    </div>
                    
                    <span className="text-[9px] sm:text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 sm:py-1 rounded-full font-medium uppercase tracking-wider w-fit mb-2 sm:mb-3">
                      {item.category}
                    </span>

                    {/* Price and Cart Button */}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#6e4b31]">
                        {typeof formatPrice === "function" ? formatPrice(item.price) : `₹${item.price}`}
                      </span>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item);
                        }}
                        className="p-1.5 sm:p-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl sm:rounded-2xl transition-all cursor-pointer active:scale-95 hover:shadow-md lg:hidden"
                        title="Add to Cart"
                      >
                        <ShoppingCart size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </button>
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