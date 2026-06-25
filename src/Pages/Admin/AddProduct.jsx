
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { db } from "../../firebase/firebase";
// import { collection, addDoc, getDocs } from "firebase/firestore"; 
// import { Upload, Image, Plus, X, Check, FolderTree, ChevronRight, MapPin } from "lucide-react"; 

// // Default categories
// const defaultCategories = [
//   { name: "New Arrivals", menu: "HOME" },
//   { name: "Trending", menu: "HOME" },
//   { name: "Crochet", menu: "ALL HANDICRAFT" },
//   { name: "Knitting", menu: "ALL HANDICRAFT" },
//   { name: "Spring", menu: "COLLECTION" },
//   { name: "Summer", menu: "COLLECTION" },
//   { name: "Modern", menu: "DESIGN" },
//   { name: "Accessories", menu: "DESIGN" },
//   { name: "Bags", menu: "DESIGN" },
//   { name: "Toys", menu: "DESIGN" },
//   { name: "Luxury", menu: "DESIGN" },
//   { name: "Home Decor", menu: "CRAFT" },
//   { name: "Wall Art", menu: "CRAFT" },
//   { name: "Flash Sale", menu: "SALE" },
//   { name: "50% Off", menu: "SALE" },
// ];

// // 🚀 INDIAN STATES LIST
// const indianStates = [
//   "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
//   "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
//   "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
//   "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
//   "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
//   "Kashmir", "Delhi"
// ];

// export default function AddProduct() {
//   const [loading, setLoading] = useState(false);
//   const [statusMsg, setStatusMsg] = useState("");
  
//   // 🚀 NAYA FIELD: 'originState' yahan add kar diya hai
//   const [product, setProduct] = useState({ 
//     name: "", price: "", category: "", parentMenu: "", description: "", stock: "", originState: "" 
//   });
  
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);

//   const [categories, setCategories] = useState(defaultCategories);

//   // 🚀 STATE menu bhi yahan add kar diya hai admin drop down ke liye
//   const mainMenus = [
//     "HOME", "ALL HANDICRAFT", "COLLECTION", "DESIGN", "CRAFT", "SALE", "STATE"
//   ];

//   const [showNewCatForm, setShowNewCatForm] = useState(false);
//   const [newCatName, setNewCatName] = useState("");
//   const [selectedMainMenu, setSelectedMainMenu] = useState("");

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "categories"));
//         const fetchedCats = querySnapshot.docs.map(doc => doc.data());

//         if (fetchedCats.length > 0) {
//           const allCats = [...defaultCategories, ...fetchedCats];
//           const uniqueCats = Array.from(new Set(allCats.map(c => c.name)))
//             .map(name => allCats.find(c => c.name === name));
          
//           setCategories(uniqueCats);
//         }
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }
//     };
//     fetchCategories();
//   }, []);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleAddNewCategory = async () => {
//     if (!newCatName.trim() || !selectedMainMenu) {
//       alert("Please enter a category name and select a parent menu!");
//       return;
//     }
    
//     const newCatObj = { name: newCatName, menu: selectedMainMenu };

//     try {
//       await addDoc(collection(db, "categories"), newCatObj);
//       setCategories((prev) => [...prev, newCatObj]);
//       setProduct({ ...product, category: newCatName, parentMenu: selectedMainMenu });
      
//       setShowNewCatForm(false);
//       setNewCatName("");
//       setSelectedMainMenu("");
//     } catch (error) {
//       console.error("Error saving category to Firebase:", error);
//       alert("Failed to save new category permanently!");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!image) return alert("Please select an image file first!");
//     if (!product.category || !product.parentMenu) return alert("Please map a category and menu!");

//     try {
//       setLoading(true);
//       const formData = new FormData();
//       formData.append("file", image);
//       formData.append("upload_preset", "yarniverse_upload"); 

//       const res = await axios.post(
//         `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
//         formData
//       );

//       // Product Firebase mein upload ho raha hai (originState automatic chala jayega)
//       await addDoc(collection(db, "products"), {
//         ...product,
//         price: Number(product.price),
//         stock: Number(product.stock),
//         image: res.data.secure_url,
//         createdAt: Date.now(),
//       });

//       setStatusMsg(`✅ Success! Product mapped to [${product.parentMenu} > ${product.category}]`);
      
//       // Form ko reset karna
//       setProduct({ name: "", price: "", category: "", parentMenu: "", description: "", stock: "", originState: "" });
//       setImage(null);
//       setImagePreview(null);
      
//       setTimeout(() => setStatusMsg(""), 5000);
//     } catch (err) {
//       console.error(err);
//       alert("Upload Processing Failed!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
//       <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-100 pb-4">Publish Product Node</h2>
      
//       {statusMsg && (
//         <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl mb-6 text-center text-sm font-bold shadow-sm flex items-center justify-center gap-2">
//           {statusMsg}
//         </div>
//       )}
      
//       <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        
//         {/* PRODUCT NAME */}
//         <div>
//           <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">PRODUCT NAME</label>
//           <input 
//             type="text" 
//             required 
//             placeholder="e.g. Handmade Jaipur Blanket" 
//             className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
//             value={product.name} 
//             onChange={(e) => setProduct({ ...product, name: e.target.value })} 
//           />
//         </div>
        
//         {/* PRICE & STOCK */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">PRICE (INR)</label>
//             <input 
//               type="number" 
//               required 
//               placeholder="0.00" 
//               className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
//               value={product.price} 
//               onChange={(e) => setProduct({ ...product, price: e.target.value })} 
//             />
//           </div>
//           <div>
//             <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">INVENTORY STOCK</label>
//             <input 
//               type="number" 
//               required 
//               placeholder="Qty" 
//               className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
//               value={product.stock} 
//               onChange={(e) => setProduct({ ...product, stock: e.target.value })} 
//             />
//           </div>
//         </div>

//         {/* 🚀 NAYA OPTIONAL STATE FIELD */}
//         <div className="bg-[#f4ede8]/30 p-4 rounded-xl border border-[#e8dcd0]">
//           <label className="text-xs font-bold text-[#6e4b31] flex items-center gap-1.5 mb-2 tracking-wider">
//             <MapPin size={14} /> FAMOUS STATE OF ORIGIN 
//             <span className="text-gray-400 font-medium normal-case ml-1 text-[10px]">(Optional)</span>
//           </label>
//           <select 
//             value={product.originState} 
//             onChange={(e) => setProduct({ ...product, originState: e.target.value })}
//             className="w-full px-4 py-3 border border-white rounded-xl bg-white focus:outline-[#6e4b31] transition-colors shadow-sm text-gray-700"
//           >
//             <option value="">-- No Specific State Selected --</option>
//             {indianStates.map(state => (
//               <option key={state} value={state}>{state}</option>
//             ))}
//           </select>
//         </div>
        
//         {/* ================= CATEGORY & MENU MAPPING AREA ================= */}
//         <div className="flex flex-col gap-3 bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-inner">
//           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Placement Mapping Node</label>
          
//           <div className="flex items-center gap-2">
//             <select 
//               required={!showNewCatForm} 
//               value={product.category} 
//               onChange={(e) => {
//                 const selectedCat = categories.find(c => c.name === e.target.value);
//                 if (selectedCat) {
//                   setProduct({ ...product, category: selectedCat.name, parentMenu: selectedCat.menu });
//                 } else {
//                   setProduct({ ...product, category: "", parentMenu: "" });
//                 }
//               }} 
//               className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-[#6e4b31] shadow-sm"
//               disabled={showNewCatForm} 
//             >
//               <option value="">Choose Existing Category...</option>
//               {categories.map((cat, index) => (
//                 <option key={index} value={cat.name}>
//                   {cat.name} — [{cat.menu}]
//                 </option>
//               ))}
//             </select>
            
//             <button 
//               type="button" 
//               onClick={() => setShowNewCatForm(!showNewCatForm)}
//               className={`p-3 rounded-xl border transition-all flex items-center justify-center shadow-sm cursor-pointer ${showNewCatForm ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-[#6e4b31] border-gray-200 hover:border-[#6e4b31] hover:bg-[#f4ede8]'}`}
//               title={showNewCatForm ? "Cancel" : "Create Custom Category"}
//             >
//               {showNewCatForm ? <X size={20} /> : <Plus size={20} />}
//             </button>
//           </div>

//           {product.category && product.parentMenu && !showNewCatForm && (
//             <div className="flex items-center gap-2 mt-2 px-1 text-sm font-bold text-[#6e4b31] bg-[#6e4b31]/5 p-2.5 rounded-lg border border-[#6e4b31]/20">
//               <FolderTree size={16} className="text-[#6e4b31]" />
//               <span className="text-[#6e4b31]/70 font-medium text-xs uppercase tracking-wider">Saving to:</span>
//               <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{product.parentMenu}</span>
//               <ChevronRight size={14} className="text-[#6e4b31]/50" />
//               <span className="bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100">{product.category}</span>
//             </div>
//           )}

//           {showNewCatForm && (
//             <div className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col gap-3 mt-2 shadow-sm">
//               <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2">
//                 <Plus size={14}/> Create Custom Category
//               </p>
              
//               <div className="flex gap-2">
//                 <input 
//                   type="text" 
//                   placeholder="e.g. Winter Scarves" 
//                   value={newCatName}
//                   onChange={(e) => setNewCatName(e.target.value)}
//                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors"
//                 />
//                 <select 
//                   value={selectedMainMenu}
//                   onChange={(e) => setSelectedMainMenu(e.target.value)}
//                   className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors"
//                 >
//                   <option value="">Map to Main Menu...</option>
//                   {mainMenus.map(menu => <option key={menu} value={menu}>{menu}</option>)}
//                 </select>
                
//                 <button 
//                   type="button" 
//                   onClick={handleAddNewCategory}
//                   className="bg-emerald-600 text-white px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1 text-sm font-bold shadow-sm cursor-pointer"
//                 >
//                   <Check size={16} /> Save
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//         {/* ========================================================== */}

//         {/* DESCRIPTION */}
//         <div>
//           <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">DESCRIPTION & DETAILS</label>
//           <textarea 
//             rows="4" 
//             required 
//             placeholder="Craftsmanship details, materials used, description..." 
//             className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
//             value={product.description} 
//             onChange={(e) => setProduct({ ...product, description: e.target.value })}
//           ></textarea>
//         </div>
        
//         {/* IMAGE UPLOAD */}
//         <div className="flex gap-4 items-center">
//           <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 cursor-pointer hover:bg-[#f4ede8] hover:border-[#6e4b31] transition-colors group">
//             <Upload size={28} className="text-gray-400 mb-2 group-hover:text-[#6e4b31] transition-colors" />
//             <span className="text-sm font-bold text-gray-500 group-hover:text-[#6e4b31] transition-colors">{image ? image.name : "Click to browse product image"}</span>
//             <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
//           </label>
//           <div className="w-32 h-32 border border-gray-200 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
//             {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover hover:scale-105 transition-transform" alt="" /> : <Image size={28} className="text-gray-300" />}
//           </div>
//         </div>

//         {/* SUBMIT BUTTON */}
//         <button 
//           type="submit" 
//           disabled={loading} 
//           className="bg-[#1a1a1a] hover:bg-black disabled:bg-gray-400 text-white py-4 rounded-xl font-bold tracking-widest uppercase mt-2 cursor-pointer shadow-xl shadow-black/10 hover:shadow-black/20 transition-all flex justify-center items-center gap-2"
//         >
//           {loading ? (
//             <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> Uploading Database...</>
//           ) : (
//             "Publish Live Product"
//           )}
//         </button>
//       </form>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import axios from "axios";
import { db } from "../../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore"; 
import { Upload, Plus, X, Check, FolderTree, ChevronRight, MapPin, Trash2 } from "lucide-react"; 

// Default categories
const defaultCategories = [
  { name: "New Arrivals", menu: "HOME" },
  { name: "Trending", menu: "HOME" },
  { name: "Crochet", menu: "ALL HANDICRAFT" },
  { name: "Knitting", menu: "ALL HANDICRAFT" },
  { name: "Spring", menu: "COLLECTION" },
  { name: "Summer", menu: "COLLECTION" },
  { name: "Modern", menu: "DESIGN" },
  { name: "Accessories", menu: "DESIGN" },
  { name: "Bags", menu: "DESIGN" },
  { name: "Toys", menu: "DESIGN" },
  { name: "Luxury", menu: "DESIGN" },
  { name: "Home Decor", menu: "CRAFT" },
  { name: "Wall Art", menu: "CRAFT" },
  { name: "Flash Sale", menu: "SALE" },
  { name: "50% Off", menu: "SALE" },
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Kashmir", "Delhi"
];

export default function AddProduct() {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  
  const [product, setProduct] = useState({ 
    name: "", price: "", category: "", parentMenu: "", description: "", stock: "", originState: "" 
  });
  
  // 🚀 NAYI STATES: Multiple images ke liye arrays banaye hain
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [categories, setCategories] = useState(defaultCategories);
  const mainMenus = ["HOME", "ALL HANDICRAFT", "COLLECTION", "DESIGN", "CRAFT", "SALE", "STATE"];

  const [showNewCatForm, setShowNewCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [selectedMainMenu, setSelectedMainMenu] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetchedCats = querySnapshot.docs.map(doc => doc.data());

        if (fetchedCats.length > 0) {
          const allCats = [...defaultCategories, ...fetchedCats];
          const uniqueCats = Array.from(new Set(allCats.map(c => c.name)))
            .map(name => allCats.find(c => c.name === name));
          
          setCategories(uniqueCats);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // 🚀 NAYA FUNCTION: Multiple images select karne ke liye
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 🚀 NAYA FUNCTION: Selected image ko hatane ke liye
  const removeImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddNewCategory = async () => {
    if (!newCatName.trim() || !selectedMainMenu) {
      alert("Please enter a category name and select a parent menu!");
      return;
    }
    
    const newCatObj = { name: newCatName, menu: selectedMainMenu };

    try {
      await addDoc(collection(db, "categories"), newCatObj);
      setCategories((prev) => [...prev, newCatObj]);
      setProduct({ ...product, category: newCatName, parentMenu: selectedMainMenu });
      
      setShowNewCatForm(false);
      setNewCatName("");
      setSelectedMainMenu("");
    } catch (error) {
      console.error("Error saving category to Firebase:", error);
      alert("Failed to save new category permanently!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return alert("Please select at least one image!");
    if (!product.category || !product.parentMenu) return alert("Please map a category and menu!");

    try {
      setLoading(true);
      
      // 🚀 MULTIPLE UPLOAD LOGIC: Cloudinary par saari images ek sath upload ho rahi hain
      const uploadedImageUrls = await Promise.all(
        images.map(async (img) => {
          const formData = new FormData();
          formData.append("file", img);
          formData.append("upload_preset", "yarniverse_upload"); 
          const res = await axios.post(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`, formData);
          return res.data.secure_url;
        })
      );

      // Firebase me save karein
      await addDoc(collection(db, "products"), {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        image: uploadedImageUrls[0], // Pehli image main thumbnail banegi
        images: uploadedImageUrls,   // Saari images array me jayengi slider ke liye
        createdAt: Date.now(),
      });

      setStatusMsg(`✅ Success! Product mapped to [${product.parentMenu} > ${product.category}]`);
      
      setProduct({ name: "", price: "", category: "", parentMenu: "", description: "", stock: "", originState: "" });
      setImages([]);
      setImagePreviews([]);
      
      setTimeout(() => setStatusMsg(""), 5000);
    } catch (err) {
      console.error(err);
      alert("Upload Processing Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto w-full">
      <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 mb-6 uppercase tracking-wide border-b border-gray-100 pb-4">Publish Product Node</h2>
      
      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-4 rounded-xl mb-6 text-center text-sm font-bold shadow-sm flex items-center justify-center gap-2">
          {statusMsg}
        </div>
      )}
      
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        
        {/* PRODUCT NAME */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">PRODUCT NAME</label>
          <input 
            type="text" 
            required 
            placeholder="e.g. Handmade Jaipur Blanket" 
            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
            value={product.name} 
            onChange={(e) => setProduct({ ...product, name: e.target.value })} 
          />
        </div>
        
        {/* PRICE & STOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">PRICE (INR)</label>
            <input 
              type="number" 
              required 
              placeholder="0.00" 
              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
              value={product.price} 
              onChange={(e) => setProduct({ ...product, price: e.target.value })} 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">INVENTORY STOCK</label>
            <input 
              type="number" 
              required 
              placeholder="Qty" 
              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
              value={product.stock} 
              onChange={(e) => setProduct({ ...product, stock: e.target.value })} 
            />
          </div>
        </div>

        {/* STATE OF ORIGIN */}
        <div className="bg-[#f4ede8]/30 p-4 rounded-xl border border-[#e8dcd0]">
          <label className="text-xs font-bold text-[#6e4b31] flex items-center gap-1.5 mb-2 tracking-wider">
            <MapPin size={14} /> FAMOUS STATE OF ORIGIN 
            <span className="text-gray-400 font-medium normal-case ml-1 text-[10px]">(Optional)</span>
          </label>
          <select 
            value={product.originState} 
            onChange={(e) => setProduct({ ...product, originState: e.target.value })}
            className="w-full px-4 py-3 border border-white rounded-xl bg-white focus:outline-[#6e4b31] transition-colors shadow-sm text-gray-700"
          >
            <option value="">-- No Specific State Selected --</option>
            {indianStates.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        
        {/* CATEGORY MAPPING (Same as before but responsive) */}
        <div className="flex flex-col gap-3 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-inner">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Placement Mapping Node</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
            <select 
              required={!showNewCatForm} 
              value={product.category} 
              onChange={(e) => {
                const selectedCat = categories.find(c => c.name === e.target.value);
                if (selectedCat) setProduct({ ...product, category: selectedCat.name, parentMenu: selectedCat.menu });
                else setProduct({ ...product, category: "", parentMenu: "" });
              }} 
              className="w-full sm:flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-[#6e4b31] shadow-sm"
              disabled={showNewCatForm} 
            >
              <option value="">Choose Existing Category...</option>
              {categories.map((cat, index) => <option key={index} value={cat.name}>{cat.name} — [{cat.menu}]</option>)}
            </select>
            
            <button 
              type="button" 
              onClick={() => setShowNewCatForm(!showNewCatForm)}
              className={`w-full sm:w-auto p-3 rounded-xl border transition-all flex items-center justify-center shadow-sm cursor-pointer ${showNewCatForm ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-[#6e4b31] border-gray-200 hover:border-[#6e4b31] hover:bg-[#f4ede8]'}`}
            >
              {showNewCatForm ? <><X size={20} /> Cancel</> : <><Plus size={20} /> Custom</>}
            </button>
          </div>

          {showNewCatForm && (
            <div className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col gap-3 mt-2 shadow-sm">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-2"><Plus size={14}/> Create Custom Category</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="text" placeholder="e.g. Winter Scarves" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors"
                />
                <select 
                  value={selectedMainMenu} onChange={(e) => setSelectedMainMenu(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors"
                >
                  <option value="">Map to Main Menu...</option>
                  {mainMenus.map(menu => <option key={menu} value={menu}>{menu}</option>)}
                </select>
                <button type="button" onClick={handleAddNewCategory} className="bg-emerald-600 text-white px-4 py-2 sm:py-0 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-1 text-sm font-bold shadow-sm">
                  <Check size={16} /> Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">DESCRIPTION & DETAILS</label>
          <textarea 
            rows="4" 
            required 
            placeholder="Craftsmanship details, materials used, description..." 
            className="w-full px-4 py-3 border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-[#6e4b31] transition-colors" 
            value={product.description} 
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
          ></textarea>
        </div>
        
        {/* 🚀 MULTIPLE IMAGE UPLOAD AREA */}
        <div>
          <label className="text-xs font-bold text-gray-500 block mb-2 tracking-wider">PRODUCT IMAGES (You can select multiple)</label>
          <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8 bg-gray-50 cursor-pointer hover:bg-[#f4ede8] hover:border-[#6e4b31] transition-colors group mb-4">
            <Upload size={32} className="text-gray-400 mb-3 group-hover:text-[#6e4b31] transition-colors" />
            <span className="text-sm font-bold text-gray-500 group-hover:text-[#6e4b31] transition-colors text-center">
              Click to browse product images <br/><span className="font-normal text-xs">(Hold Ctrl/Cmd to select multiple)</span>
            </span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
          </label>

          {/* 🚀 IMAGE PREVIEW GRID */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square border border-gray-200 rounded-xl overflow-hidden group">
                  <img src={preview} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                  <button 
                    type="button" 
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                  >
                    <Trash2 size={12} />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[9px] text-center py-1 font-bold">
                      MAIN
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={loading} 
          className="bg-[#1a1a1a] w-full hover:bg-black disabled:bg-gray-400 text-white py-4 rounded-xl font-bold tracking-widest uppercase mt-2 cursor-pointer shadow-xl shadow-black/10 hover:shadow-black/20 transition-all flex justify-center items-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span> Uploading Database...</>
          ) : (
            "Publish Live Product"
          )}
        </button>
      </form>
    </div>
  );
}