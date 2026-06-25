// import { Heart, Star } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function ProductCard({ product }) {

//   const navigate = useNavigate();

//   return (
//     <div 
//       onClick={() => navigate(`/product/${product.id}`)}
//       className="cursor-pointer"
//     >

//       <div className="relative overflow-hidden rounded-[30px] group bg-white">

//         {product.discount && (
//           <span className="absolute top-5 left-5 z-10 bg-[#c28b45] text-white px-3 py-1 rounded-full text-sm">
//             {product.discount}
//           </span>
//         )}

//         <button 
//           onClick={(e)=> e.stopPropagation()}
//           className="absolute top-5 right-5 z-10 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-md"
//         >
//           <Heart size={22}/>
//         </button>


//         <img
//           src={product.image}
//           alt={product.name}
//           className="h-[500px] w-full object-cover transition duration-500 group-hover:scale-110"
//         />


//         <div className="
//           absolute bottom-0 left-0 right-0 
//           bg-black/70 text-white text-center py-4 
//           translate-y-full group-hover:translate-y-0 
//           transition duration-500
//         ">
//           Add To Cart
//         </div>

//       </div>


//       <div className="mt-5">

//         <h3 className="text-xl text-[#3b2416] font-medium">
//           {product.name}
//         </h3>


//         <div className="flex gap-1 mt-2">

//           {[...Array(5)].map((_,i)=>(
//             <Star
//               key={i}
//               size={16}
//               fill="#3b2416"
//               className="text-[#3b2416]"
//             />
//           ))}

//         </div>


//         <div className="mt-3 flex items-center gap-3">

//           <span className="text-2xl font-semibold text-[#3b2416]">
//             {product.price}
//           </span>

//           {
//             product.oldPrice &&
//             <span className="line-through text-gray-400">
//               {product.oldPrice}
//             </span>
//           }

//         </div>

//       </div>

//     </div>
//   );
// }
import { Heart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; // 🚀 1. Cart Context Import karein

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart(); // 🚀 2. addToCart function laayein

  // 🚀 3. Yeh function banayein jo Vendor ki details bhi cart me daalega
  const handleAddToCart = (e) => {
    e.stopPropagation(); // Isse card pe click hone se page nahi badlega
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      // SABSE ZAROORI CHEEZ: Vendor Details
      vendorId: product.vendorId || "admin", 
      storeName: product.storeName || "Yarniverse Official"
    });
    
    alert(`${product.name} added to cart!`); // Optional feedback
  };

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-[30px] group bg-white">
        
        {product.discount && (
          <span className="absolute top-5 left-5 z-10 bg-[#c28b45] text-white px-3 py-1 rounded-full text-sm">
            {product.discount}
          </span>
        )}

        <button 
          onClick={(e) => e.stopPropagation()} // Wishlist button pe bhi stopPropagation zaroori hai
          className="absolute top-5 right-5 z-10 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
        >
          <Heart size={22}/>
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="h-[500px] w-full object-cover transition duration-500 group-hover:scale-110"
        />

        {/* 🚀 4. onClick me handleAddToCart laga diya */}
        <button 
          onClick={handleAddToCart}
          className="
            absolute bottom-0 left-0 right-0 w-full
            bg-black/80 text-white text-center py-4 
            translate-y-full group-hover:translate-y-0 
            transition duration-500 font-medium hover:bg-black
          "
        >
          Add To Cart
        </button>

      </div>

      <div className="mt-5">
        <h3 className="text-xl text-[#3b2416] font-medium">
          {product.name}
        </h3>

        <div className="flex gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill="#3b2416"
              className="text-[#3b2416]"
            />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-2xl font-semibold text-[#3b2416]">
            ₹{product.price}
          </span>

          {product.oldPrice && (
            <span className="line-through text-gray-400">
              ₹{product.oldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}