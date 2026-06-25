import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate ,} from "react-router-dom";
import { Search, Heart, User, ShoppingBag, X, Trash2, Plus, Minus, Tag, CreditCard, Package, Menu, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext"; 
import { useCart } from "../../context/CartContext"; 
// import  logo  from "/images/logo.png"

import { db } from "../../firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";

const baseMenus = [
  { title: "HOME", path: "/" },
  { title: "ALL HANDCRAFT", path: "/all-handcraft" },
  { title: "STATE", path: "/state" },
  { title: "COLLECTION", path: "/collection" },
  { title: "DESIGN", path: "/design" },
  { title: "CRAFT", path: "/craft" },
  { title: "SALE", path: "/sale" }
];

const defaultCategoriesMap = {
  "HOME": ["New Arrivals", "Trending"],
  "ALL HANDCRAFT": ["Crochet", "Knitting"],
  "STATE": ["Rajasthan", "Gujarat", "Kashmir", "Kerala", "Punjab"],
  "COLLECTION": ["Spring", "Summer"],
  "DESIGN": ["Modern", "Luxury", "Accessories", "Bags", "Toys"],
  "CRAFT": ["Home Decor", "Wall Art"],
  "SALE": ["50% Off", "Flash Sale"]
};

export default function Navbar({ openAuth }) {
  const [openProfile, setOpenProfile] = useState(false);
  const [hoverMenu, setHoverMenu] = useState(null);
  
  // 📱 Mobile Menu States
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState(null);

  // 🔍 Premium Search Bar States
  const [openSearch, setOpenSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [dynamicMenus, setDynamicMenus] = useState(baseMenus.map(menu => ({
    ...menu,
    categories: defaultCategoriesMap[menu.title] || []
  })));

  const { user, profile, logout, loading } = useAuth();
  const { wishlistItems, setOpenWishlist } = useWishlist(); 
  const { cartItems, openCart, setOpenCart, updateQuantity, removeFromCart, getSubtotal, getDiscount, getTotalBill, parsePrice } = useCart(); 
  
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // 🚀 SEARCH SUBMIT LOGIC
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setOpenSearch(false); // Search karne ke baad close ho jaye
      setSearchQuery("");   // Input clear ho jaye
      setSearchResults([]);
    }
  };

  // Fetch all products for search
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real-time search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const search = searchQuery.toLowerCase();

    const filtered = products.filter((product) =>
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );

    setSearchResults(filtered.slice(0, 5));
  }, [searchQuery, products]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpenSearch(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "categories"),
      (snapshot) => {
        const fetchedCats = snapshot.docs.map((doc) => doc.data());
        const mergedCategoriesMap = JSON.parse(JSON.stringify(defaultCategoriesMap));

        fetchedCats.forEach((cat) => {
          if (mergedCategoriesMap[cat.menu]) {
            if (!mergedCategoriesMap[cat.menu].includes(cat.name)) {
              mergedCategoriesMap[cat.menu].push(cat.name);
            }
          } else {
            mergedCategoriesMap[cat.menu] = [cat.name];
          }
        });

        const updatedMenus = baseMenus.map((menu) => ({
          ...menu,
          categories: mergedCategoriesMap[menu.title] || [],
        }));

        setDynamicMenus(updatedMenus);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle subcategory click
  const handleSubCategoryClick = (e, menuPath, subCategoryName) => {
    e.stopPropagation(); 
    setHoverMenu(null);  
    setOpenMobileMenu(false); 
    navigate(menuPath, { state: { filterCategory: subCategoryName } });
  };

  // Handle search result click
  const handleSearchResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setOpenSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <nav className="bg-white px-4 md:px-10 py-4 flex flex-col justify-between shadow-sm sticky top-0 z-[9999]">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center w-full">
        
        {/* 📱 Left Side: Hamburger & Brand Name */}
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => setOpenMobileMenu(true)} 
            className="lg:hidden p-1 text-gray-700 hover:text-[#6e4b31] bg-transparent border-0 cursor-pointer"
          >
            <Menu size={24} />
          </button>

           <h1 
            className="text-xl md:text-3xl font-serif text-[#6e4b31] cursor-pointer font-bold tracking-wide" 
            onClick={() => navigate("/")}
          >
            YARNIVERSE
          </h1> 
        </div>

        {/* 💻 Desktop Menu */}
        <ul className="hidden lg:flex gap-6 font-medium relative m-0 p-0 list-none">
          {dynamicMenus.map((item, index) => (
            <li 
              key={index} 
              className="relative py-2" 
              onMouseEnter={() => setHoverMenu(index)} 
              onMouseLeave={() => setHoverMenu(null)}
            >
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `px-3 py-2 rounded-full text-sm flex items-center gap-1 ${
                    isActive ? "bg-[#6e4b31] text-white" : "text-gray-700 hover:bg-[#f4ede8]"
                  }`
                }
              >
                {item.title}
              </NavLink>

              {hoverMenu === index && item.categories && item.categories.length > 0 && (
                <div className="absolute left-0 top-10 w-72 bg-white shadow-xl rounded-xl p-4 z-50 border border-gray-100">
                  <h3 className="font-bold text-[#6e4b31] mb-2 text-xs uppercase tracking-wider">
                    Categories
                  </h3>
                  <div className="flex flex-col gap-1">
                    {item.categories.map((cat) => (
                      <p 
                        key={cat} 
                        onClick={(e) => handleSubCategoryClick(e, item.path, cat)} 
                        className="text-sm py-2 px-3 text-gray-600 hover:text-[#6e4b31] hover:bg-[#f4ede8] rounded-lg cursor-pointer transition-all font-medium text-left m-0"
                      >
                        {cat}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* 🛠 Right Side Icons */}
        <div className="flex items-center gap-3 md:gap-4 relative">
          
          {/* 🔍 SEARCH ICON */}
          <div ref={searchRef}>
            <Search 
              size={20} 
              onClick={() => setOpenSearch(!openSearch)} 
              className={`cursor-pointer transition-colors ${
                openSearch ? "text-[#6e4b31] scale-110" : "text-gray-700 hover:text-[#6e4b31]"
              }`} 
            />
          </div>
          
          {/* Wishlist Icon */}
          <button 
            onClick={() => setOpenWishlist(true)} 
            className="relative bg-transparent border-0 p-1 cursor-pointer group flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors"
          >
            <Heart size={20} className={wishlistItems.length > 0 ? "fill-red-500 text-red-500" : ""} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={() => setOpenCart(true)} 
            className="relative bg-transparent border-0 p-1 cursor-pointer group flex items-center justify-center text-gray-700 hover:text-[#6e4b31] transition-colors"
          >
            <ShoppingBag size={20} className={cartItems.length > 0 ? "text-[#6e4b31]" : ""} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#6e4b31] text-white font-mono font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {cartItems.reduce((acc, current) => acc + current.quantity, 0)}
              </span>
            )}
          </button>

          {/* Orders Icon (Desktop) */}
          {user && profile?.role !== "admin" && (
            <button 
              onClick={() => navigate("/my-orders")} 
              className="relative bg-transparent border-0 p-1 cursor-pointer group flex items-center justify-center text-gray-700 hover:text-[#6e4b31] transition-colors hidden sm:block" 
              title="My Orders"
            >
              <Package size={20} />
            </button>
          )}

          {/* Profile/Login Button */}
          {loading ? (
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gray-200 animate-pulse" />
          ) : user ? (
            <div ref={dropdownRef} className="relative inline-block">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setOpenProfile(!openProfile); 
                }} 
                className="flex items-center gap-2.5 cursor-pointer focus:outline-none border-none bg-transparent p-1 group"
              >
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-serif font-bold text-gray-800 tracking-wide uppercase group-hover:text-[#6e4b31] transition-colors">
                    {profile?.name || user?.displayName || "Yarniverse User"}
                  </span>
                  <span className={`text-[9px] font-mono font-bold tracking-widest uppercase ${
                    profile?.role === "admin" ? "text-red-500" : "text-gray-400"
                  }`}>
                    {profile?.role || "MEMBER"}
                  </span>
                </div>

                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#6e4b31] text-white flex items-center justify-center font-bold overflow-hidden border border-gray-200 shadow-xs shrink-0 relative">
                  {profile?.image || user?.photoURL ? (
                    <img 
                      src={`${profile?.image || user?.photoURL}?t=${Date.now()}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full"
                      crossOrigin="anonymous"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="font-serif text-sm">
                      {profile?.name ? profile.name[0].toUpperCase() : user?.email ? user.email[0].toUpperCase() : "U"}
                    </span>
                  )}
                </div>
              </button>
              
              {openProfile && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl p-2 z-[10000]">
                  <div className="px-3 py-2 border-b border-gray-50 mb-1 sm:hidden">
                    <p className="text-xs font-bold text-gray-800 truncate m-0">
                      {profile?.name || user?.displayName || "User"}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono truncate m-0">
                      {user?.email}
                    </p>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setOpenProfile(false)} 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg no-underline font-medium"
                  >
                    Profile
                  </Link>
                  {user && profile?.role !== "admin" && (
                    <Link 
                      to="/my-orders" 
                      onClick={() => setOpenProfile(false)} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg no-underline font-medium sm:hidden"
                    >
                      My Orders
                    </Link>
                  )}
                  {profile?.role === "admin" && (
                    <Link 
                      to="/admin" 
                      onClick={() => setOpenProfile(false)} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg no-underline font-medium"
                    >
                      Admin Panel
                    </Link>
                  )}
                   {profile?.role === "vendor" && (
                    <Link 
                      to="/vendor" 
                      onClick={() => setOpenProfile(false)} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg no-underline font-medium"
                    >Vendor Panel
                    </Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button 
                    onClick={() => { 
                      setOpenProfile(false); 
                      logout(); 
                      navigate("/"); 
                    }} 
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-0 font-medium"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={openAuth} 
              className="cursor-pointer bg-transparent border-none text-gray-700 hover:text-[#6e4b31]"
            >
              <User size={20} />
            </button>
          )}
        </div>
      </div>

      {/* 🔍 PREMIUM SLIDE-DOWN SEARCH BOX OVERLAY */}
      {openSearch && (
        <div className="w-full border-t border-gray-100 mt-4 pt-4 pb-2 animate-fade-in-up">
          <form 
            onSubmit={handleSearchSubmit} 
            className="relative max-w-3xl mx-auto"
          >
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-[#6e4b31] focus-within:bg-white focus-within:shadow-xs transition-all duration-300">
              <Search size={18} className="text-[#6e4b31] flex-shrink-0" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search handcrafted products, categories, states..."
                className="w-full bg-transparent border-0 outline-none text-sm text-gray-800 placeholder-gray-400 font-medium"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => { 
                  setOpenSearch(false); 
                  setSearchQuery(""); 
                  setSearchResults([]); 
                }} 
                className="text-gray-400 hover:text-black p-1 bg-transparent border-0 cursor-pointer transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* ✨ Real-time Search Results Dropdown */}
            {searchResults.length > 0 && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[99999] overflow-hidden max-h-80 overflow-y-auto">
                {/* Results Header */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                  <p className="text-xs text-gray-500 font-medium">
                    Found <span className="text-[#6e4b31] font-bold">{searchResults.length}</span> matching results
                  </p>
                </div>
                
                {/* Results List */}
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSearchResultClick(product.id)}
                    className="flex items-center gap-4 p-3 hover:bg-[#f4ede8] cursor-pointer transition-colors border-b border-gray-50 last:border-none group"
                  >
                    {/* Product Image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                      <img
                        src={product.image || product.images?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/56";
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#6e4b31] transition-colors">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-bold text-[#6e4b31]">
                          ₹{typeof product.price === 'string' ? parsePrice(product.price) : product.price}
                        </p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{product.originalPrice}
                          </p>
                        )}
                      </div>
                      {product.category && (
                        <p className="text-xs text-gray-500 mt-0.5 capitalize font-mono">
                          {product.category}
                        </p>
                      )}
                    </div>

                    {/* Arrow Indicator */}
                    <div className="text-gray-300 group-hover:text-[#6e4b31] transition-colors flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                ))}

                {/* View All Results Button */}
                <button
                  onClick={handleSearchSubmit}
                  className="w-full p-3 text-center text-sm font-semibold text-[#6e4b31] hover:bg-[#f4ede8] transition-colors border-t border-gray-100 bg-gray-50 sticky bottom-0 cursor-pointer"
                >
                  View all results for "{searchQuery}"
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* 📱 Mobile Menu Drawer Overlay */}
      {openMobileMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex justify-start lg:hidden transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setOpenMobileMenu(false)} />
          
          <div className="bg-white w-[85%] max-w-sm h-full relative z-10 shadow-2xl flex flex-col pt-6 pb-20 overflow-y-auto transform transition-transform duration-300">
            <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-100 mb-4">
              <h2 className="text-xl font-serif text-[#6e4b31] font-bold tracking-widest">MENU</h2>
              <button 
                onClick={() => setOpenMobileMenu(false)} 
                className="text-gray-500 hover:text-black bg-transparent border-0 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col px-4">
              {dynamicMenus.map((item, index) => (
                <div key={index} className="border-b border-gray-50 last:border-none">
                  <div className="flex justify-between items-center py-3">
                    <NavLink 
                      to={item.path} 
                      onClick={() => setOpenMobileMenu(false)} 
                      className={({ isActive }) => 
                        `flex-1 text-base font-medium ${
                          isActive ? "text-[#6e4b31]" : "text-gray-800"
                        }`
                      }
                    >
                      {item.title}
                    </NavLink>
                    
                    {item.categories && item.categories.length > 0 && (
                      <button 
                        onClick={() => setMobileExpandedMenu(mobileExpandedMenu === index ? null : index)}
                        className="p-2 text-gray-500 bg-gray-50 rounded-lg border-0"
                      >
                        {mobileExpandedMenu === index ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                    )}
                  </div>

                  {mobileExpandedMenu === index && item.categories && item.categories.length > 0 && (
                    <div className="pl-4 pb-3 flex flex-col gap-2 border-l-2 border-[#6e4b31]/20 ml-2 mb-2 animate-fade-in-up">
                      {item.categories.map((cat) => (
                        <span 
                          key={cat} 
                          onClick={(e) => handleSubCategoryClick(e, item.path, cat)} 
                          className="text-sm text-gray-500 hover:text-[#6e4b31] py-1.5 cursor-pointer font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🛒 Cart Drawer */}
      {openCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex justify-end transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setOpenCart(false)} />
          
          <div className="bg-white w-full sm:w-[400px] max-w-full h-full relative z-10 shadow-2xl flex flex-col p-6 sm:p-8 transform translate-x-0 transition-transform duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-serif font-bold text-gray-900 tracking-wider">
                  SHOPPING BAG
                </span>
                <span className="font-mono text-[10px] sm:text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full font-bold">
                  {cartItems.length} ITEMS
                </span>
              </div>
              <button 
                onClick={() => setOpenCart(false)} 
                className="text-neutral-400 hover:text-neutral-900 cursor-pointer border-0 bg-transparent transition-colors p-1"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {cartItems.length === 0 ? (
                <div className="text-center py-24 text-neutral-400 text-sm font-light tracking-wide">
                  Aapka bag khali hai. Continue shopping karke items add karein!
                </div>
              ) : (
                cartItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-neutral-100 bg-white rounded-2xl items-center justify-between shadow-xs"
                  >
                    <div className="flex gap-3 sm:gap-4 items-center">
                      <img 
                        src={item.image} 
                        alt="" 
                        className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-50 rounded-xl object-cover border" 
                      />
                      <div className="max-w-[120px] sm:max-w-[150px]">
                        <h4 className="text-sm font-medium text-neutral-800 truncate tracking-wide">
                          {item.name}
                        </h4>
                        <p className="text-[10px] sm:text-xs text-gray-400 uppercase mt-0.5 font-mono">
                          {item.category}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-neutral-900 mt-1">
                          ₹{((parsePrice ? parsePrice(item.price) : Number(item.price)) * item.quantity).toLocaleString('en-IN')}.00
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 sm:gap-3">
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-neutral-300 hover:text-red-500 bg-transparent border-0 cursor-pointer p-0.5"
                      >
                        <Trash2 size={15} />
                      </button>
                      <div className="flex items-center gap-1 sm:gap-2 border border-neutral-200 rounded-lg p-0.5 sm:p-1 bg-neutral-50/50">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)} 
                          className="p-1 text-gray-500 hover:text-black border-0 bg-transparent cursor-pointer"
                        >
                          <Minus size={11}/>
                        </button>
                        <span className="text-[10px] sm:text-xs font-mono font-bold w-3 sm:w-4 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)} 
                          className="p-1 text-gray-500 hover:text-black border-0 bg-transparent cursor-pointer"
                        >
                          <Plus size={11}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 pt-4 mt-4 space-y-3 bg-neutral-50/50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 rounded-t-[2rem]">
                <div className="flex justify-between text-xs sm:text-sm text-neutral-500 font-light">
                  <span>Bag Subtotal</span>
                  <span className="font-mono">₹{getSubtotal().toLocaleString('en-IN')}.00</span>
                </div>
                
                <div className="flex justify-between text-xs sm:text-sm text-emerald-600 font-medium items-center">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Tag size={12}/> Welcome Promo
                  </span>
                  <span className="font-mono">- ₹{getDiscount().toLocaleString('en-IN')}.00</span>
                </div>

                <div className="flex justify-between text-xs sm:text-sm text-neutral-500 font-light">
                  <span>Estimated Shipping</span>
                  <span className="text-[10px] sm:text-xs uppercase font-bold text-neutral-600 font-mono">
                    FREE
                  </span>
                </div>

                <div className="border-t border-neutral-200/60 my-2 pt-2 sm:pt-3 flex justify-between items-center text-gray-900">
                  <span className="font-serif font-bold text-sm sm:text-base tracking-wide">
                    Total Payable
                  </span>
                  <span className="font-serif font-bold text-lg sm:text-xl text-[#6e4b31]">
                    ₹{getTotalBill().toLocaleString('en-IN')}.00
                  </span>
                </div>

                <button 
                  onClick={() => {
                    setOpenCart(false);
                    navigate("/checkout");
                  }}
                  className="w-full bg-black text-white py-3 sm:py-4 text-sm sm:text-base rounded-xl cursor-pointer mt-2 hover:bg-gray-800 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}