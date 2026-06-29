import { Heart, Star, ShoppingBag, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useState } from "react";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const [isAdded, setIsAdded] = useState(false);

  // Check if product is in wishlist
  const isLiked = wishlistItems?.some(wish => wish.id === product.id) || false;

  // Add to cart with vendor details
  const handleAddToCart = (e) => {
    e.stopPropagation();
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      vendorId: product.vendorId || "admin", 
      storeName: product.storeName || "Yarniverse Official"
    });
    
    // Visual feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  // Handle wishlist toggle
  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist?.(product);
  };

  // Handle buy now
  const handleBuyNow = (e) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      vendorId: product.vendorId || "admin", 
      storeName: product.storeName || "Yarniverse Official"
    });
    navigate("/checkout");
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[25px] md:rounded-[30px] bg-white shadow-sm hover:shadow-xl md:hover:shadow-2xl transition-all duration-300 md:duration-500">
        
        {/* Discount Badge */}
        {product.discount && (
          <span className="absolute top-2 sm:top-3 md:top-5 left-2 sm:left-3 md:left-5 z-10 bg-[#c28b45] text-white px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium shadow-lg">
            {product.discount}
          </span>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={handleWishlist}
          className="absolute top-2 sm:top-3 md:top-5 right-2 sm:right-3 md:right-5 z-10 bg-white/95 backdrop-blur-sm w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 active:scale-90"
        >
          <Heart 
            size={16} 
            className={`sm:w-[18px] sm:h-[18px] md:w-[22px] md:h-[22px] transition-colors duration-300 ${
              isLiked ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Product Image */}
        <div className="aspect-[3/4] sm:aspect-[4/5] md:h-[400px] lg:h-[500px] bg-gray-50 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition duration-500 md:duration-700 group-hover:scale-105 md:group-hover:scale-110"
            loading="lazy"
          />
        </div>

        {/* Desktop Hover Overlay - Add to Cart */}
        <button 
          onClick={handleAddToCart}
          className="hidden md:block absolute bottom-0 left-0 right-0 w-full bg-black/80 backdrop-blur-sm text-white text-center py-3 lg:py-4 translate-y-full group-hover:translate-y-0 transition duration-500 font-medium hover:bg-black/90 text-sm lg:text-base"
        >
          <span className="flex items-center justify-center gap-2">
            <ShoppingBag size={18} className="lg:w-5 lg:h-5" />
            {isAdded ? "Added! ✓" : "Add To Cart"}
          </span>
        </button>

        {/* Mobile Quick Actions Overlay */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 p-1.5 sm:p-2 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex gap-1 sm:gap-1.5">
            <button 
              onClick={handleAddToCart}
              className="flex-1 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm text-gray-900 text-[10px] sm:text-xs font-medium rounded-lg sm:rounded-xl hover:bg-white transition-colors active:scale-95 flex items-center justify-center gap-1"
            >
              <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5" />
              {isAdded ? "Added!" : "Cart"}
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 py-1.5 sm:py-2 bg-[#6e4b31] text-white text-[10px] sm:text-xs font-medium rounded-lg sm:rounded-xl hover:bg-[#5a3d28] transition-colors active:scale-95 flex items-center justify-center gap-1"
            >
              <Zap size={12} className="sm:w-3.5 sm:h-3.5" />
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-3 sm:mt-4 md:mt-5 px-1 sm:px-2 md:px-0">
        <h3 className="text-sm sm:text-base md:text-lg lg:text-xl text-[#3b2416] font-medium line-clamp-2 leading-tight group-hover:text-[#6e4b31] transition-colors">
          {product.name}
        </h3>

        {/* Rating Stars */}
        <div className="flex gap-0.5 sm:gap-1 mt-1.5 sm:mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              fill="#3b2416"
              className="text-[#3b2416] sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
            />
          ))}
        </div>

        {/* Price Section */}
        <div className="mt-2 sm:mt-2.5 md:mt-3 flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-[#3b2416]">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>

          {product.oldPrice && (
            <span className="text-xs sm:text-sm md:text-base text-gray-400 line-through">
              ₹{product.oldPrice?.toLocaleString('en-IN')}
            </span>
          )}

          {product.discount && (
            <span className="text-[10px] sm:text-xs text-green-600 font-medium">
              {product.discount} off
            </span>
          )}
        </div>
      </div>
    </div>
  );
}