// import { useState, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import { db } from "../../firebase/firebase";
// import { collection, getDocs } from "firebase/firestore";
// import { Layers, ShoppingCart, Filter } from "lucide-react";

// export default function AllHandcraft() {
//   const [products, setProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [activeFilter, setActiveFilter] = useState("All");

//   const location = useLocation();

//   // 1. Fetch data on load
//   useEffect(() => {
//     const fetchAllProducts = async () => {
//       try {
//         const snap = await getDocs(collection(db, "products"));
//         const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
//         setProducts(items);
//         setFilteredProducts(items); // Default value set
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchAllProducts();
//   }, []);

//   // 2. Sync and capture dynamic category clicks sent from the Navbar Mega Menu
//   useEffect(() => {
//     if (location.state && location.state.filterCategory) {
//       const targetCategory = location.state.filterCategory;
//       setActiveFilter(targetCategory);
      
//       const matched = products.filter(p => p.category === targetCategory);
//       setFilteredProducts(matched);
//     } else {
//       setActiveFilter("All");
//       setFilteredProducts(products);
//     }
//   }, [location.state, products]);

//   // Handle local filter buttons action
//   const applyLocalFilter = (category) => {
//     setActiveFilter(category);
//     if (category === "All") {
//       setFilteredProducts(products);
//     } else {
//       setFilteredProducts(products.filter(p => p.category === category));
//     }
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen py-12 px-10">
//       <div className="max-w-7xl mx-auto">
        
//         {/* Title Header */}
//         <div className="flex items-center justify-between border-b pb-6 mb-8">
//           <div>
//             <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wide">CRAFTSMANSHIP COLLECTION</h1>
//             <p className="text-sm text-gray-500 mt-1">Showing active items under: <span className="font-bold text-[#6e4b31] font-mono">{activeFilter}</span></p>
//           </div>
//           <button onClick={() => applyLocalFilter("All")} className="flex items-center gap-2 text-sm font-semibold border px-4 py-2 bg-white rounded-xl hover:bg-gray-50 cursor-pointer">
//             <Filter size={16} /> Reset Filter
//           </button>
//         </div>

//         {/* Dynamic Items Render Loop */}
//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-20 bg-white border rounded-2xl shadow-xs">
//             <p className="text-gray-400 font-medium">Is category node `{activeFilter}` ke andar abhi koi uploaded item save nahi hai database mein.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
//             {filteredProducts.map((item) => (
//               <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden group hover:shadow-md transition-shadow">
//                 <div className="h-64 bg-gray-50 overflow-hidden relative">
//                   <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" />
//                   <span className="absolute top-3 left-3 text-[10px] bg-white/90 backdrop-blur-xs text-[#6e4b31] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
//                     {item.category}
//                   </span>
//                 </div>
//                 <div className="p-5 flex flex-col gap-2">
//                   <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h3>
//                   <p className="text-sm text-gray-500 line-clamp-2 h-10">{item.description}</p>
//                   <div className="flex items-center justify-between mt-3 border-t pt-3 border-gray-50">
//                     <span className="text-xl font-bold text-[#6e4b31]">₹{item.price}</span>
//                     <button className="bg-[#6e4b31] hover:bg-[#593c26] text-white p-2 rounded-xl transition-colors cursor-pointer">
//                       <ShoppingCart size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // 👈 useNavigate import kiya
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Layers, ShoppingCart, Filter } from "lucide-react";

export default function AllHandcraft() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");

  const location = useLocation();
  const navigate = useNavigate(); // 👈 Navigate initialize kiya

  // 1. Fetch data on load
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setProducts(items);
        setFilteredProducts(items); // Default value set
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllProducts();
  }, []);

  // 2. Sync and capture dynamic category clicks sent from the Navbar Mega Menu
  useEffect(() => {
    if (location.state && location.state.filterCategory) {
      const targetCategory = location.state.filterCategory;
      setActiveFilter(targetCategory);
      
      const matched = products.filter(p => p.category === targetCategory);
      setFilteredProducts(matched);
    } else {
      setActiveFilter("All");
      setFilteredProducts(products);
    }
  }, [location.state, products]);

  // Handle local filter buttons action
  const applyLocalFilter = (category) => {
    setActiveFilter(category);
    if (category === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === category));
    }
  };

  return (
    // 📱 Responsive Padding: px-4 (Mobile), sm:px-6 (Tablet), lg:px-10 (Desktop)
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Title Header - Responsive Flexbox */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 sm:pb-6 mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 tracking-wide">
              CRAFTSMANSHIP COLLECTION
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing active items under: <span className="font-bold text-[#6e4b31] font-mono">{activeFilter}</span>
            </p>
          </div>
          <button 
            onClick={() => applyLocalFilter("All")} 
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold border px-4 py-2 bg-white rounded-xl hover:bg-gray-50 cursor-pointer w-full sm:w-auto justify-center transition-colors"
          >
            <Filter size={16} /> Reset Filter
          </button>
        </div>

        {/* Dynamic Items Render Loop */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 sm:py-20 bg-white border rounded-2xl shadow-xs mx-2">
            <p className="text-gray-400 font-medium text-sm sm:text-base px-4">
              Is category node `{activeFilter}` ke andar abhi koi uploaded item save nahi hai database mein.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                
                {/* 🚀 IMAGE PAR CLICK LOGIC */}
                <div className="h-56 sm:h-64 bg-gray-50 overflow-hidden relative">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer" 
                  />
                  <span className="absolute top-3 left-3 text-[9px] sm:text-[10px] bg-white/90 backdrop-blur-xs text-[#6e4b31] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {item.category}
                  </span>
                </div>
                
                <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
                  {/* 🚀 TITLE PAR CLICK LOGIC */}
                  <h3 
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="font-bold text-gray-800 text-base sm:text-lg line-clamp-1 cursor-pointer hover:text-[#6e4b31] transition-colors"
                  >
                    {item.name}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 h-8 sm:h-10">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto border-t pt-3 border-gray-50">
                    <span className="text-lg sm:text-xl font-bold text-[#6e4b31]">₹{item.price}</span>
                    <button className="bg-[#6e4b31] hover:bg-[#593c26] text-white p-2 rounded-xl transition-colors cursor-pointer active:scale-95">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}