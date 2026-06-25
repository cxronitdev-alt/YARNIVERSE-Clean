import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, addDoc, onSnapshot, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
// ⚠️ Crown icon add karo yahan
import { Star, ShoppingCart, User, Send, Zap, Heart, Share2, Shield, Truck, RotateCcw, Award, ChevronRight,ChevronLeft, Sparkles, ArrowLeft, Minus, Plus, Check, Clock, Package, MessageCircle, Crown } from "lucide-react";
import AuthModal from "../Auth/AuthModal"; 
import { useWishlist } from "../../context/WishlistContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { addToCart, setOpenCart } = useCart();
  const { user, profile } = useAuth(); 

  const { wishlistItems, toggleWishlist } = useWishlist();

  // Product States
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Review & Auth States
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // UI Enhancement States
  //const [isWishlisted, setIsWishlisted] = useState(false);
  const isWishlisted = product ? wishlistItems.some((item) => item.id === product.id) : false;
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); 

    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          setErrorMsg("Product Not Found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setErrorMsg("Error loading product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();

    const q = query(collection(db, "reviews"), where("productId", "==", id));
    const unsubscribeReviews = onSnapshot(q, (snap) => {
      const fetchedReviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedReviews.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
      });
      setReviews(fetchedReviews);
    });

    return () => unsubscribeReviews();
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      await addDoc(collection(db, "reviews"), {
        productId: id,
        userId: user.uid,
        userName: profile?.name || user.displayName || "Yarniverse User",
        userImage: profile?.image || user.photoURL || "",
        rating: newRating,
        comment: newComment,
        createdAt: serverTimestamp()
      });
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      console.error("Error posting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    stars: star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
  }));

  const handleAddToCart = () => {
    // 🚀 1. Ek naya object banayein jisme vendorId aur storeName confirm ho!
    const productWithVendorDetails = {
      ...product, // Product ki baaki saari details (name, price, image etc.)
      vendorId: product.vendorId || "admin",       // Vendor ID force karein
      storeName: product.storeName || "Yarniverse" // Store Name force karein
    };

    // 🚀 2. Ab is naye object ko cart me bhejein
    for (let i = 0; i < quantity; i++) {
      addToCart(productWithVendorDetails, true); // true = Add To Cart pe side drawer khulega
    }
    
    setQuantity(1);
  };
  
  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, false); // false = Buy Now pe side drawer NAHI khulega
    }
    setQuantity(1);
    navigate("/checkout"); // Aur seedha checkout page khul jayega
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f6] to-white flex flex-col items-center justify-center px-4">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 border-3 sm:border-4 border-[#6e4b31]/20 border-t-[#6e4b31] rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#6e4b31] w-6 h-6 sm:w-8 sm:h-8 animate-pulse" />
        </div>
        <p className="mt-4 sm:mt-6 text-[#6e4b31] font-serif text-base sm:text-lg animate-pulse tracking-wide">Discovering Craftsmanship...</p>
      </div>
    );
  }

  // Error State
  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f6] to-white flex flex-col items-center justify-center px-4">
        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🔍</div>
        <h2 className="text-xl sm:text-2xl font-serif text-gray-800 mb-2 text-center">{errorMsg}</h2>
        <p className="text-gray-500 text-sm mb-4 text-center">The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate("/")} className="px-6 py-3 bg-[#6e4b31] text-white rounded-xl font-medium hover:bg-[#4a3221] transition-colors text-sm">
          Return to Home
        </button>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gradient-to-b from-[#faf8f6] via-white to-[#faf8f6] min-h-screen font-sans">
      
      {/* Luxury Breadcrumb */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-1 sm:pb-2">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-400 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigate("/")} className="hover:text-[#6e4b31] transition-colors flex-shrink-0">Home</button>
          <ChevronRight size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
          <button onClick={() => navigate("/all-handcraft")} className="hover:text-[#6e4b31] transition-colors flex-shrink-0">{product.category || "Crafts"}</button>
          <ChevronRight size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
          <span className="text-[#6e4b31] font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
        
        {/* Main Product Card */}
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] shadow-xl shadow-gray-200/50 p-3 sm:p-6 lg:p-10 border border-gray-100">
          
          {/* Back Button - Mobile */}
          <button onClick={() => navigate(-1)} className="lg:hidden flex items-center gap-1.5 text-gray-400 hover:text-[#6e4b31] mb-3 transition-colors">
            <ArrowLeft size={16} />
            <span className="text-xs font-medium">Back</span>
          </button>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
{/* Left: Image Section (Responsive Slider) */}
<div className="space-y-3 sm:space-y-4">
  <div className="relative group">
    
    {/* Badges */}
    <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex flex-col gap-1.5 sm:gap-2">
      <span className="bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#6e4b31] shadow-sm border border-gray-100">
        {product.category || "Handcrafted"}
      </span>
    </div>

    {/* Wishlist Button */}
    <button 
      onClick={() => toggleWishlist(product)}
      className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:scale-110 transition-all cursor-pointer"
    >
      <Heart size={16} className={isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"} />
    </button>

    {/* 🚀 MAIN SLIDER IMAGE CONTAINER */}
    <div className="w-full aspect-[4/3] sm:aspect-[4/3] lg:aspect-[3/4] bg-gradient-to-br from-[#faf8f6] to-gray-100 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-gray-100 relative flex items-center justify-center">
      
      {/* Left Arrow (Sirf tab dikhega jab 1 se zyada images hon aur hover ho) */}
      {product.images && product.images.length > 1 && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
          }}
          className="absolute left-2 sm:left-4 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer md:flex hidden"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Main Image View */}
      {product.images && product.images.length > 0 ? (
        <img 
          src={product.images[currentImageIndex] || product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
        />
      ) : product.image ? (
        <img src={product.image} className="w-full h-full object-cover" alt="" />
      ) : (
        <Sparkles size={40} className="text-gray-300" />
      )}

      {/* Right Arrow */}
      {product.images && product.images.length > 1 && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
          }}
          className="absolute right-2 sm:right-4 z-20 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer md:flex hidden"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Mobile Swipe Indicators (Dots) */}
      {product.images && product.images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
          {product.images.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${currentImageIndex === idx ? 'w-4 bg-[#6e4b31]' : 'w-1.5 bg-gray-300/80'}`}
            />
          ))}
        </div>
      )}
    </div>
  </div>

  {/* 🚀 THUMBNAIL GALLERY (Desktop aur swipe view ke niche) */}
  {product.images && product.images.length > 1 && (
    <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide pt-1">
      {product.images.map((img, idx) => (
        <button 
          key={idx}
          onClick={() => setCurrentImageIndex(idx)} 
          className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
            currentImageIndex === idx ? 'border-[#6e4b31] shadow-md opacity-100 scale-105' : 'border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100'
          }`}
        >
          <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  )}
</div>

            {/* Right: Product Info */}
            <div className="flex flex-col justify-center space-y-4 sm:space-y-5 lg:space-y-6">
              
              {/* Brand/Artisan Label */}
              <div className="flex items-center gap-2">
                <Crown size={14} className="text-amber-500 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Premium Handcraft</span>
              </div>

              {/* Product Name */}
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-serif font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Live Rating */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={14} 
                      className={`sm:w-4 sm:h-4 ${star <= Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} 
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{avgRating > 0 ? avgRating : "0"}</span>
                <span className="text-[10px] sm:text-xs text-gray-400">({reviews.length} reviews)</span>
                {avgRating >= 4 && (
                  <span className="text-[10px] sm:text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Highly Rated</span>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#6e4b31]">
                    ₹{product.price ? product.price.toLocaleString('en-IN') : "0"}
                  </p>
                  {product.originalPrice && (
                    <p className="text-sm sm:text-base lg:text-lg text-gray-400 line-through font-medium">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                {product.originalPrice && (
                  <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold">
                    You save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')} ({Math.round((1 - product.price/product.originalPrice) * 100)}% OFF)
                  </p>
                )}
              </div>

              <div className="h-px w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>

              {/* Description */}
              <div>
                <p className={`text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base ${!showFullDescription && 'line-clamp-3 sm:line-clamp-4'}`}>
                  {product.description || "A beautiful handcrafted masterpiece created with pure passion and luxury materials by skilled artisans."}
                </p>
                {product.description && product.description.length > 150 && (
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-[#6e4b31] text-xs font-medium mt-1 hover:underline"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* USP Badges */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 bg-gray-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  <Truck size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 bg-gray-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  <RotateCcw size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span>Easy Returns</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 bg-gray-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  <Shield size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-600 bg-gray-50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                  <Award size={12} className="text-[#6e4b31] sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                  <span>Artisan Made</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-200">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600 cursor-pointer"
                  >
                    <Minus size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <span className="w-8 sm:w-10 text-center text-sm sm:text-base font-bold text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-600 cursor-pointer"
                  >
                    <Plus size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 lg:gap-4 pt-2">
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 lg:py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer active:scale-95 border border-gray-200"
                >
                  <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" /> Add to Bag
                </button>
                
                <button 
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center gap-2 py-3 sm:py-3.5 lg:py-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all bg-gradient-to-r from-[#6e4b31] to-[#4a3221] hover:from-[#4a3221] hover:to-[#2d1e14] text-white shadow-lg shadow-[#6e4b31]/20 cursor-pointer active:scale-95"
                >
                  <Zap size={16} className="fill-white/30 sm:w-[18px] sm:h-[18px]"/> Buy Now
                </button>
              </div>

              {/* Share Button */}
              <button className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 hover:text-[#6e4b31] transition-colors w-fit">
                <Share2 size={12} className="sm:w-3.5 sm:h-3.5" />
                Share this product
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-6 sm:mt-8 lg:mt-10">
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Tab Buttons */}
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab("description")}
                className={`flex-1 min-w-[100px] py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === "description" 
                    ? "text-[#6e4b31] border-b-2 border-[#6e4b31] bg-[#faf8f6]" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 min-w-[100px] py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
                  activeTab === "reviews" 
                    ? "text-[#6e4b31] border-b-2 border-[#6e4b31] bg-[#faf8f6]" 
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                Reviews ({reviews.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              
              {/* Description Tab */}
              {activeTab === "description" && (
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-gray-900 mb-2 sm:mb-3">About This Masterpiece</h3>
                    <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                      {product.description || "A beautiful handcrafted masterpiece created with pure passion and luxury materials by skilled artisans."}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">Category</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">{product.category || "Handcrafted"}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">Craft Type</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">{product.craftType || "Artisanal"}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">Material</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900">{product.material || "Premium Quality"}</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                      <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">Delivery Time</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 flex items-center gap-1">
                        <Clock size={12} className="sm:w-3.5 sm:h-3.5" /> 5-7 Business Days
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
                  
                  <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                    <div className="text-center bg-gradient-to-br from-[#faf8f6] to-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                      <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#6e4b31]">{avgRating > 0 ? avgRating : "0"}</p>
                      <div className="flex justify-center gap-1 my-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={16} 
                            className={`sm:w-[18px] sm:h-[18px] ${star <= Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} 
                          />
                        ))}
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500">{reviews.length} verified reviews</p>
                    </div>

                    <div className="space-y-2">
                      {ratingDistribution.map(({ stars, count, percentage }) => (
                        <div key={stars} className="flex items-center gap-2 sm:gap-3">
                          <span className="text-[10px] sm:text-xs font-medium text-gray-600 w-4 sm:w-5">{stars}</span>
                          <Star size={10} className="fill-amber-500 text-amber-500 sm:w-3 sm:h-3" />
                          <div className="flex-1 h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-400 w-6 sm:w-8 text-right">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    
                    {/* Review Form */}
                    <div className="bg-gradient-to-br from-[#faf8f6] to-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-100">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 sm:mb-4">Share Your Experience</h3>
                      
                      {!user ? (
                        <div className="text-center py-3 sm:py-4">
                          <p className="text-gray-500 mb-3 text-xs sm:text-sm">Login to share your review</p>
                          <button 
                            onClick={() => setShowAuth(true)} 
                            className="bg-black hover:bg-gray-800 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Login to Review
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2">Your Rating</label>
                            <div className="flex gap-1 sm:gap-2">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setNewRating(star)}
                                  className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                >
                                  <Star 
                                    size={20} 
                                    className={`sm:w-[22px] sm:h-[22px] ${star <= newRating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <textarea 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="What did you love about this product?"
                              className="w-full bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-xs sm:text-sm outline-none focus:border-[#6e4b31] focus:ring-1 focus:ring-[#6e4b31] transition-all min-h-[80px] sm:min-h-[100px] resize-none"
                              required
                            ></textarea>
                          </div>

                          <button 
                            type="submit" 
                            disabled={submittingReview || !newComment.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-bold py-2.5 sm:py-3 rounded-xl uppercase tracking-wider text-[10px] sm:text-xs transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            {submittingReview ? (
                              <>Posting...</>
                            ) : (
                              <><Send size={14} className="sm:w-4 sm:h-4" /> Submit Review</>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-3 sm:space-y-4">
                      {reviews.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 text-gray-400">
                          <MessageCircle size={32} className="mx-auto mb-2 sm:w-10 sm:h-10 opacity-30" />
                          <p className="text-xs sm:text-sm font-medium">No reviews yet. Be the first to review!</p>
                        </div>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev.id} className="bg-white border border-gray-100 p-3 sm:p-5 rounded-2xl hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                {rev.userImage ? (
                                  <img src={rev.userImage} alt="" className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover bg-gray-100 flex-shrink-0" />
                                ) : (
                                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#6e4b31] to-[#4a3221] text-white flex items-center justify-center flex-shrink-0">
                                    <User size={14} className="sm:w-4 sm:h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">{rev.userName}</p>
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                          key={star} 
                                          size={10} 
                                          className={`sm:w-3 sm:h-3 ${star <= rev.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"}`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-gray-400">
                                      {rev.createdAt ? new Date(rev.createdAt.toDate()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Just now"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {rev.rating >= 4 && (
                                <Check size={14} className="text-green-500 flex-shrink-0 sm:w-4 sm:h-4" />
                              )}
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mt-2 sm:mt-3">
                              {rev.comment}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explore More */}
        <div className="mt-6 sm:mt-8 lg:mt-10 text-center">
          <button 
            onClick={() => navigate("/all-handcraft")}
            className="inline-flex items-center gap-2 text-[#6e4b31] font-medium text-xs sm:text-sm hover:underline"
          >
            Explore More Handcrafted Products <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && <AuthModal closeModal={() => setShowAuth(false)} />}
      
      {/* Custom Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}