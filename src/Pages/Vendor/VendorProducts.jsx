// import { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom"; 
// import { useAuth } from "../../context/AuthContext";
// import { db } from "../../firebase/firebase";
// import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
// import { 
//   Edit, Trash2, Plus, Search, PackageOpen, AlertCircle, 
//   CheckCircle, X, ImagePlus, Tag, Box, IndianRupee, FileText, 
//   UploadCloud, RefreshCw, Link as LinkIcon, ChevronDown, 
//   ChevronUp, Eye, Download, Filter, SlidersHorizontal, 
//   ArrowUpDown, Grid3X3, List, MoreVertical, Copy, 
//   ExternalLink, ShoppingBag, Star, TrendingUp, Clock,
//   Check, ChevronLeft, ChevronRight, ZoomIn, Move, Loader2,
//   Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw,
//   Minus, Info, MapPin, Calendar, User, Hash, Percent
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";

// // 🌟 YARNIVERSE NAVBAR CATEGORIES
// const NAVBAR_CATEGORIES = [
//   "All Handcraft",
//   "State",
//   "Collection",
//   "Design",
//   "Craft",
//   "Sale",
//   "Home Decor",
//   "Clothing",
//   "Accessories",
//   "Art & Collectibles"
// ];

// export default function VendorProducts() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [viewMode, setViewMode] = useState("grid");
//   const [sortBy, setSortBy] = useState("newest");
//   const [filterCategory, setFilterCategory] = useState("All");
//   const [showFilters, setShowFilters] = useState(false);

//   // Premium UI States
//   const [toast, setToast] = useState({ show: false, message: "", type: "success" });
//   const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
//   const [editModal, setEditModal] = useState({ isOpen: false, productData: null });
//   const [previewModal, setPreviewModal] = useState({ isOpen: false, product: null });
//   const [selectedProducts, setSelectedProducts] = useState([]);
//   const [bulkActionModal, setBulkActionModal] = useState(false);
  
//   // Image Upload States
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [newImageUrl, setNewImageUrl] = useState("");
//   const [draggedImage, setDraggedImage] = useState(null);
//   const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
//   const [selectedPreviewImage, setSelectedPreviewImage] = useState(0);
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const fileInputRef = useRef(null);

//   // 🚀 REAL-TIME FIREBASE CONNECTION
//   useEffect(() => {
//     if (!user) return;
//     const q = query(collection(db, "products"), where("vendorId", "==", user.uid));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const myProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setProducts(myProducts);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, [user]);

//   const showToast = (message, type = "success") => {
//     setToast({ show: true, message, type });
//     setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
//   };

//   // Enhanced filtering and sorting
//   const filteredProducts = products
//     .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
//     .filter(p => filterCategory === "All" ? true : p.category === filterCategory)
//     .sort((a, b) => {
//       switch(sortBy) {
//         case "price-asc": return (a.price || 0) - (b.price || 0);
//         case "price-desc": return (b.price || 0) - (a.price || 0);
//         case "name": return (a.name || "").localeCompare(b.name || "");
//         case "stock-low": return (a.stock || 0) - (b.stock || 0);
//         case "stock-high": return (b.stock || 0) - (a.stock || 0);
//         default: return 0;
//       }
//     });

//   const existingCategories = [...new Set([...NAVBAR_CATEGORIES, ...products.map(p => p.category).filter(Boolean)])];

//   // DELETE LOGIC
//   const confirmDelete = async () => {
//     try {
//       await deleteDoc(doc(db, "products", deleteModal.productId));
//       showToast("Product deleted successfully");
//       setSelectedProducts(prev => prev.filter(id => id !== deleteModal.productId));
//     } catch (error) {
//       showToast("Failed to delete product", "error");
//     } finally {
//       setDeleteModal({ isOpen: false, productId: null });
//     }
//   };

//   // BULK DELETE
//   const handleBulkDelete = async () => {
//     try {
//       await Promise.all(selectedProducts.map(id => deleteDoc(doc(db, "products", id))));
//       showToast(`${selectedProducts.length} products deleted`);
//       setSelectedProducts([]);
//       setBulkActionModal(false);
//     } catch (error) {
//       showToast("Bulk delete failed", "error");
//     }
//   };

//   // EDIT LOGIC
//   const openEditModal = (product) => {
//     let normalizedImages = [];
    
//     if (product.images && Array.isArray(product.images) && product.images.length > 0) {
//       normalizedImages = product.images.filter(img => img && typeof img === 'string');
//     } else if (product.image && typeof product.image === 'string') {
//       normalizedImages = [product.image];
//     }

//     setEditModal({ 
//       isOpen: true, 
//       productData: { 
//         ...product, 
//         images: normalizedImages,
//         description: product.description || "",
//         category: product.category || "",
//         tags: product.tags || [],
//         discount: product.discount || 0,
//         featured: product.featured || false,
//         status: product.status || "active"
//       } 
//     });
//     setImagePreviewIndex(0);
//     setNewImageUrl("");
//   };

//   // 🖼️ Open Full Product Details Page
//   const openProductDetails = (product) => {
//     // Navigate to product details page
//     navigate(`/vendor/product/${product.id}`, { state: { product } });
//   };

//   // 🖼️ Open Preview Modal with selected image
//   const openPreviewModal = (product) => {
//     setSelectedPreviewImage(0);
//     setPreviewModal({ isOpen: true, product });
//   };

//   // Preview image navigation
//   const nextPreviewImage = () => {
//     if (previewModal.product?.images?.length > 0) {
//       setSelectedPreviewImage(prev => 
//         prev < previewModal.product.images.length - 1 ? prev + 1 : 0
//       );
//     }
//   };

//   const prevPreviewImage = () => {
//     if (previewModal.product?.images?.length > 0) {
//       setSelectedPreviewImage(prev => 
//         prev > 0 ? prev - 1 : previewModal.product.images.length - 1
//       );
//     }
//   };

//   const selectPreviewImage = (index) => {
//     setSelectedPreviewImage(index);
//   };

//   const handleEditChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setEditModal(prev => ({
//       ...prev,
//       productData: { 
//         ...prev.productData, 
//         [name]: type === "checkbox" ? checked : 
//                 (name === "price" || name === "stock" || name === "discount" ? Number(value) : value) 
//       }
//     }));
//   };

//   // Handle tags
//   const handleTagAdd = (e) => {
//     if (e.key === 'Enter' || e.key === ',') {
//       e.preventDefault();
//       const tag = e.target.value.replace(',', '').trim();
//       if (tag && !editModal.productData.tags.includes(tag)) {
//         setEditModal(prev => ({
//           ...prev,
//           productData: {
//             ...prev.productData,
//             tags: [...prev.productData.tags, tag]
//           }
//         }));
//       }
//       e.target.value = '';
//     }
//   };

//   const removeTag = (tagToRemove) => {
//     setEditModal(prev => ({
//       ...prev,
//       productData: {
//         ...prev.productData,
//         tags: prev.productData.tags.filter(tag => tag !== tagToRemove)
//       }
//     }));
//   };

//   // ☁️ CLOUDINARY FILE UPLOAD LOGIC
//   const handleImageUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (!files.length) return;

//     const maxSize = 10 * 1024 * 1024;
//     for (const file of files) {
//       if (file.size > maxSize) {
//         showToast(`File ${file.name} is too large. Max 10MB allowed.`, "error");
//         return;
//       }
//     }

//     const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME; 
//     const UPLOAD_PRESET = import.meta.env.VITE_API_KEY; 

//     if (!CLOUD_NAME || !UPLOAD_PRESET) {
//       showToast("Cloudinary not configured. Using local preview.", "error");
//       handleLocalImagePreview(files);
//       return;
//     }

//     setUploadingImage(true);
//     try {
//       const uploadedUrls = [];
      
//       for (const file of files) {
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("upload_preset", UPLOAD_PRESET);
//         formData.append("cloud_name", CLOUD_NAME);

//         const response = await fetch(
//           `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
//           {
//             method: "POST",
//             body: formData,
//           }
//         );
        
//         if (!response.ok) {
//           throw new Error(`Upload failed with status: ${response.status}`);
//         }
        
//         const data = await response.json();
        
//         if (data.secure_url) {
//           uploadedUrls.push(data.secure_url);
//         } else {
//           console.error("Cloudinary Error:", data);
//           throw new Error(data.error?.message || "Upload failed");
//         }
//       }

//       if (uploadedUrls.length > 0) {
//         setEditModal(prev => {
//           const currentImages = [...(prev.productData.images || [])];
//           return {
//             ...prev,
//             productData: { 
//               ...prev.productData, 
//               images: [...currentImages, ...uploadedUrls] 
//             }
//           };
//         });
//         showToast(`${uploadedUrls.length} images uploaded successfully!`);
//       }
//     } catch (error) {
//       console.error("Cloudinary Upload Error:", error);
//       showToast(`Upload failed: ${error.message}`, "error");
//       handleLocalImagePreview(files);
//     } finally {
//       setUploadingImage(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = ''; 
//       }
//     }
//   };

//   // Local image preview fallback
//   const handleLocalImagePreview = (files) => {
//     const readers = files.map(file => {
//       return new Promise((resolve) => {
//         const reader = new FileReader();
//         reader.onloadend = () => resolve(reader.result);
//         reader.readAsDataURL(file);
//       });
//     });

//     Promise.all(readers).then(base64Images => {
//       setEditModal(prev => {
//         const currentImages = [...(prev.productData.images || [])];
//         return {
//           ...prev,
//           productData: { 
//             ...prev.productData, 
//             images: [...currentImages, ...base64Images] 
//           }
//         };
//       });
//       showToast(`${files.length} images added locally (Cloudinary not configured)`);
//     });
//   };

//   // Image drag & drop reordering
//   const handleDragStart = (index) => {
//     setDraggedImage(index);
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     if (draggedImage === null || draggedImage === index) return;
    
//     setEditModal(prev => {
//       const images = [...prev.productData.images];
//       const draggedItem = images[draggedImage];
//       images.splice(draggedImage, 1);
//       images.splice(index, 0, draggedItem);
//       return {
//         ...prev,
//         productData: { ...prev.productData, images }
//       };
//     });
//     setDraggedImage(index);
//   };

//   const handleDragEnd = () => {
//     setDraggedImage(null);
//   };

//   // ADD IMAGE BY URL
//   const handleAddImageUrl = () => {
//     const url = newImageUrl.trim();
//     if (!url) return;
    
//     if (!url.match(/^https?:\/\/.+/i)) {
//       showToast("Please enter a valid URL starting with http:// or https://", "error");
//       return;
//     }

//     setEditModal(prev => {
//       const currentImages = [...(prev.productData.images || [])];
//       if (currentImages.includes(url)) {
//         showToast("This image URL already exists", "error");
//         return prev;
//       }
//       return {
//         ...prev,
//         productData: { 
//           ...prev.productData, 
//           images: [...currentImages, url] 
//         }
//       };
//     });
//     setNewImageUrl("");
//     showToast("Image URL added successfully!");
//   };

//   const handleRemoveImage = (indexToRemove) => {
//     setEditModal(prev => {
//       const newImages = prev.productData.images.filter((_, idx) => idx !== indexToRemove);
//       const newPreviewIndex = Math.min(imagePreviewIndex, newImages.length - 1);
//       setImagePreviewIndex(Math.max(0, newPreviewIndex));
//       return {
//         ...prev,
//         productData: {
//           ...prev.productData,
//           images: newImages
//         }
//       };
//     });
//   };

//   const handleUpdateProduct = async (e) => {
//     e.preventDefault();
//     const { id, name, price, stock, category, description, images, tags, discount, featured, status } = editModal.productData;
    
//     try {
//       const cleanImages = (images || []).filter(img => img && typeof img === 'string');
      
//       await updateDoc(doc(db, "products", id), { 
//         name, 
//         price: Number(price) || 0, 
//         stock: Number(stock) || 0, 
//         category: category || "", 
//         description: description || "", 
//         images: cleanImages,
//         image: cleanImages.length > 0 ? cleanImages[0] : "",
//         tags: tags || [],
//         discount: Number(discount) || 0,
//         featured: featured || false,
//         status: status || "active",
//         updatedAt: new Date().toISOString()
//       });
//       showToast("Product updated successfully! ✅");
//       setEditModal({ isOpen: false, productData: null });
//     } catch (error) {
//       console.error("Update error:", error);
//       showToast(`Failed to update product: ${error.message}`, "error");
//     }
//   };

//   // Copy product link
//   const copyProductLink = (productId) => {
//     const link = `${window.location.origin}/product/${productId}`;
//     navigator.clipboard.writeText(link);
//     showToast("Product link copied! 📋");
//   };

//   // Toggle select all
//   const toggleSelectAll = () => {
//     if (selectedProducts.length === filteredProducts.length) {
//       setSelectedProducts([]);
//     } else {
//       setSelectedProducts(filteredProducts.map(p => p.id));
//     }
//   };

//   const toggleProductSelection = (productId) => {
//     setSelectedProducts(prev => 
//       prev.includes(productId) 
//         ? prev.filter(id => id !== productId)
//         : [...prev, productId]
//     );
//   };

//   // Stats calculation
//   const stats = {
//     totalProducts: products.length,
//     activeProducts: products.filter(p => p.status === 'active' || !p.status).length,
//     outOfStock: products.filter(p => p.stock === 0).length,
//     totalValue: products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0),
//     featuredCount: products.filter(p => p.featured).length
//   };

//   // 🌀 MODAL OVERLAYS
//   const modalOverlays = (
//     <>
//       {/* TOAST */}
//       {toast.show && (
//         <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[999999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-down border ${
//           toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-[#f8f5f2] border-[#e8dfd8] text-[#5a3d28]'
//         }`}>
//           {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} className="text-[#6e4b31]" />}
//           <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
//         </div>
//       )}

//       {/* DELETE MODAL */}
//       {deleteModal.isOpen && (
//         <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 transition-all">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-stone-100 animate-scale-in">
//             <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
//               <Trash2 size={36} strokeWidth={1.5} />
//             </div>
//             <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Delete Product</h3>
//             <p className="text-stone-500 text-sm mb-8">This action is permanent. Are you sure you want to remove this item?</p>
//             <div className="flex gap-4">
//               <button onClick={() => setDeleteModal({ isOpen: false, productId: null })} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3.5 rounded-xl font-bold transition-all">Cancel</button>
//               <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20">Delete Item</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🖼️ ENHANCED PRODUCT PREVIEW MODAL WITH IMAGE SWITCHING */}
//       {previewModal.isOpen && previewModal.product && (
//         <div className="fixed inset-0 bg-stone-900/95 backdrop-blur-sm z-[99999] flex items-center justify-center p-0 md:p-4">
//           <div className="bg-white md:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto animate-scale-in">
//             {/* Close Button */}
//             <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-100 p-4 md:p-6 flex justify-between items-center z-10 rounded-t-3xl">
//               <div>
//                 <h3 className="font-serif font-bold text-xl md:text-2xl">Product Preview</h3>
//                 <p className="text-xs text-stone-400 mt-0.5">See how customers view this product</p>
//               </div>
//               <button 
//                 onClick={() => setPreviewModal({ isOpen: false, product: null })} 
//                 className="p-2 hover:bg-stone-100 rounded-full transition-all"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
//               {/* LEFT: Image Gallery */}
//               <div className="space-y-4">
//                 {/* Main Display Image */}
//                 <div className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 group">
//                   <img 
//                     src={previewModal.product.images?.[selectedPreviewImage] || previewModal.product.image || "/placeholder.png"} 
//                     alt={`${previewModal.product.name} - Image ${selectedPreviewImage + 1}`}
//                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                     onError={(e) => { e.target.src = "/placeholder.png"; }}
//                   />
                  
//                   {/* Image Navigation Arrows */}
//                   {previewModal.product.images?.length > 1 && (
//                     <>
//                       <button 
//                         onClick={prevPreviewImage}
//                         className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
//                       >
//                         <ChevronLeft size={20} className="text-stone-700" />
//                       </button>
//                       <button 
//                         onClick={nextPreviewImage}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
//                       >
//                         <ChevronRight size={20} className="text-stone-700" />
//                       </button>
//                     </>
//                   )}

//                   {/* Image Counter */}
//                   {previewModal.product.images?.length > 1 && (
//                     <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
//                       {selectedPreviewImage + 1} / {previewModal.product.images.length}
//                     </div>
//                   )}

//                   {/* Zoom Button */}
//                   <button 
//                     onClick={() => setLightboxOpen(true)}
//                     className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
//                     title="View full size"
//                   >
//                     <ZoomIn size={18} className="text-stone-700" />
//                   </button>
//                 </div>

//                 {/* Thumbnail Gallery - CLICKABLE */}
//                 {previewModal.product.images?.length > 1 && (
//                   <div className="grid grid-cols-5 md:grid-cols-6 gap-2 md:gap-3">
//                     {previewModal.product.images.map((img, idx) => (
//                       <button
//                         key={`thumb-${idx}`}
//                         onClick={() => selectPreviewImage(idx)}
//                         className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
//                           selectedPreviewImage === idx 
//                             ? 'border-[#6e4b31] ring-2 ring-[#6e4b31]/30' 
//                             : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
//                         }`}
//                       >
//                         <img 
//                           src={img} 
//                           alt={`Thumbnail ${idx + 1}`} 
//                           className="w-full h-full object-cover"
//                           onError={(e) => { e.target.style.display = 'none'; }}
//                         />
//                         {selectedPreviewImage === idx && (
//                           <div className="absolute inset-0 bg-[#6e4b31]/10"></div>
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* RIGHT: Product Details */}
//               <div className="space-y-6">
//                 {/* Breadcrumb */}
//                 <div className="flex items-center gap-2 text-xs text-stone-400">
//                   <span>Home</span>
//                   <ChevronRight size={12} />
//                   <span>{previewModal.product.category || "Category"}</span>
//                   <ChevronRight size={12} />
//                   <span className="text-stone-600 truncate">{previewModal.product.name}</span>
//                 </div>

//                 {/* Category Badge */}
//                 <span className="inline-block text-xs font-bold text-[#6e4b31] bg-[#6e4b31]/5 px-3 py-1.5 rounded-full uppercase tracking-wider">
//                   {previewModal.product.category || "Uncategorized"}
//                 </span>

//                 {/* Product Name */}
//                 <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight">
//                   {previewModal.product.name}
//                 </h2>

//                 {/* Price Section */}
//                 <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
//                   <div className="flex items-baseline gap-3">
//                     <span className="text-3xl md:text-4xl font-black text-[#6e4b31]">
//                       ₹{((previewModal.product.price || 0) * (1 - (previewModal.product.discount || 0) / 100)).toLocaleString('en-IN')}
//                     </span>
//                     {previewModal.product.discount > 0 && (
//                       <>
//                         <span className="text-lg text-stone-400 line-through">
//                           ₹{previewModal.product.price?.toLocaleString('en-IN')}
//                         </span>
//                         <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
//                           {previewModal.product.discount}% OFF
//                         </span>
//                       </>
//                     )}
//                   </div>
//                   <p className="text-xs text-stone-400 mt-2">Inclusive of all taxes</p>
//                 </div>

//                 {/* Stock Status */}
//                 <div className="flex items-center gap-4">
//                   <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
//                     previewModal.product.stock > 0 
//                       ? 'bg-emerald-50 text-emerald-700' 
//                       : 'bg-red-50 text-red-700'
//                   }`}>
//                     <span className={`w-2.5 h-2.5 rounded-full ${
//                       previewModal.product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
//                     }`}></span>
//                     {previewModal.product.stock > 0 
//                       ? `${previewModal.product.stock} Units Available` 
//                       : 'Out of Stock'}
//                   </div>
//                   {previewModal.product.featured && (
//                     <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
//                       <Star size={12} fill="currentColor" /> Featured
//                     </span>
//                   )}
//                 </div>

//                 {/* Description */}
//                 <div>
//                   <h4 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
//                     <FileText size={16} className="text-stone-400" /> Description
//                   </h4>
//                   <p className="text-stone-600 leading-relaxed text-sm md:text-base">
//                     {previewModal.product.description || "No description provided."}
//                   </p>
//                 </div>

//                 {/* Product Details Grid */}
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
//                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Product ID</span>
//                     <p className="text-sm font-mono font-bold text-stone-700 mt-1">{previewModal.product.id?.slice(0, 12)}...</p>
//                   </div>
//                   <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
//                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Category</span>
//                     <p className="text-sm font-bold text-stone-700 mt-1">{previewModal.product.category || "N/A"}</p>
//                   </div>
//                   <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
//                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Original Price</span>
//                     <p className="text-sm font-bold text-stone-700 mt-1">₹{previewModal.product.price?.toLocaleString('en-IN')}</p>
//                   </div>
//                   <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
//                     <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status</span>
//                     <p className="text-sm font-bold text-emerald-600 mt-1">{previewModal.product.status || 'Active'}</p>
//                   </div>
//                 </div>

//                 {/* Tags */}
//                 {previewModal.product.tags?.length > 0 && (
//                   <div>
//                     <h4 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
//                       <Hash size={16} className="text-stone-400" /> Tags
//                     </h4>
//                     <div className="flex flex-wrap gap-2">
//                       {previewModal.product.tags.map((tag, idx) => (
//                         <span key={idx} className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-stone-200 transition-colors cursor-pointer">
//                           #{tag}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Features Icons */}
//                 <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
//                   <div className="text-center">
//                     <Truck size={20} className="mx-auto text-stone-400 mb-1" />
//                     <span className="text-[10px] font-medium text-stone-500">Free Shipping</span>
//                   </div>
//                   <div className="text-center">
//                     <Shield size={20} className="mx-auto text-stone-400 mb-1" />
//                     <span className="text-[10px] font-medium text-stone-500">Secure Payment</span>
//                   </div>
//                   <div className="text-center">
//                     <RotateCcw size={20} className="mx-auto text-stone-400 mb-1" />
//                     <span className="text-[10px] font-medium text-stone-500">Easy Returns</span>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 <div className="flex gap-3 pt-2">
//                   <button 
//                     onClick={() => copyProductLink(previewModal.product.id)}
//                     className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
//                   >
//                     <Copy size={16} /> Copy Link
//                   </button>
//                   <button 
//                     onClick={() => {
//                       setPreviewModal({ isOpen: false, product: null });
//                       openEditModal(previewModal.product);
//                     }}
//                     className="flex-1 bg-[#6e4b31] hover:bg-[#5a3d28] text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#6e4b31]/20"
//                   >
//                     <Edit size={16} /> Edit Product
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 🔍 LIGHTBOX FOR FULL SCREEN IMAGE */}
//       {lightboxOpen && previewModal.product && (
//         <div 
//           className="fixed inset-0 bg-black z-[999999] flex items-center justify-center cursor-zoom-out"
//           onClick={() => setLightboxOpen(false)}
//         >
//           <button 
//             onClick={() => setLightboxOpen(false)}
//             className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
//           >
//             <X size={32} />
//           </button>
          
//           {previewModal.product.images?.length > 1 && (
//             <>
//               <button 
//                 onClick={(e) => { e.stopPropagation(); prevPreviewImage(); }}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-10"
//               >
//                 <ChevronLeft size={40} />
//               </button>
//               <button 
//                 onClick={(e) => { e.stopPropagation(); nextPreviewImage(); }}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-10"
//               >
//                 <ChevronRight size={40} />
//               </button>
//             </>
//           )}
          
//           <img 
//             src={previewModal.product.images?.[selectedPreviewImage] || previewModal.product.image} 
//             alt="Full size preview"
//             className="max-w-[90vw] max-h-[90vh] object-contain"
//             onClick={(e) => e.stopPropagation()}
//           />
          
//           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
//             {selectedPreviewImage + 1} / {previewModal.product.images?.length || 1}
//           </div>
//         </div>
//       )}

//       {/* BULK ACTION MODAL */}
//       {bulkActionModal && (
//         <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
//           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-stone-100 animate-scale-in">
//             <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
//               <AlertCircle size={36} />
//             </div>
//             <h3 className="text-xl font-serif font-bold mb-2">Bulk Delete</h3>
//             <p className="text-stone-500 mb-6">Delete {selectedProducts.length} selected products? This cannot be undone.</p>
//             <div className="flex gap-4">
//               <button onClick={() => setBulkActionModal(false)} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-bold">Cancel</button>
//               <button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold">Delete All</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* EDIT MODAL */}
//       {editModal.isOpen && editModal.productData && (
//         <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-0 md:p-4">
//           <div className="bg-white md:rounded-3xl shadow-2xl w-full max-w-6xl h-full md:h-[92vh] flex flex-col overflow-hidden animate-scale-in">
            
//             {/* Modal Header */}
//             <div className="px-6 md:px-8 py-5 border-b border-stone-100 flex justify-between items-center bg-white shrink-0">
//               <div>
//                 <h3 className="font-serif font-bold text-xl md:text-2xl text-stone-900">Edit Collection Item</h3>
//                 <p className="text-xs font-medium text-stone-400 mt-1 uppercase tracking-widest">ID: {editModal.productData.id?.slice(0, 12)}</p>
//               </div>
//               <button onClick={() => setEditModal({ isOpen: false, productData: null })} className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-all">
//                 <X size={24} />
//               </button>
//             </div>

//             {/* Modal Body */}
//             <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50/50">
//               <form id="edit-product-form" onSubmit={handleUpdateProduct} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
//                 {/* Left Column: Details */}
//                 <div className="lg:col-span-7 space-y-6">
//                   {/* Status & Featured Toggles */}
//                   <div className="flex flex-wrap gap-4">
//                     <label className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-3 cursor-pointer hover:border-[#6e4b31]/30 transition-all">
//                       <input 
//                         type="checkbox" 
//                         name="featured" 
//                         checked={editModal.productData.featured || false} 
//                         onChange={handleEditChange}
//                         className="w-4 h-4 rounded border-stone-300 text-[#6e4b31] focus:ring-[#6e4b31]"
//                       />
//                       <div>
//                         <span className="font-bold text-sm flex items-center gap-1.5"><Star size={14} className="text-amber-500" /> Featured Product</span>
//                         <span className="text-xs text-stone-400">Show in featured section</span>
//                       </div>
//                     </label>
//                     <label className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-3 cursor-pointer hover:border-[#6e4b31]/30 transition-all">
//                       <input 
//                         type="checkbox" 
//                         name="status" 
//                         checked={editModal.productData.status === 'active'} 
//                         onChange={(e) => setEditModal(prev => ({
//                           ...prev,
//                           productData: { ...prev.productData, status: e.target.checked ? 'active' : 'draft' }
//                         }))}
//                         className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
//                       />
//                       <div>
//                         <span className="font-bold text-sm flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Active</span>
//                         <span className="text-xs text-stone-400">Visible to customers</span>
//                       </div>
//                     </label>
//                   </div>

//                   <div>
//                     <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><Tag size={14}/> Product Name</label>
//                     <input required type="text" name="name" value={editModal.productData.name || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
//                   </div>
                  
//                   <div>
//                     <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><FileText size={14}/> Description</label>
//                     <textarea name="description" rows="5" value={editModal.productData.description || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium resize-none shadow-sm" placeholder="Enter product details..." />
//                   </div>
                  
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><IndianRupee size={14}/> Price</label>
//                       <input required type="number" name="price" value={editModal.productData.price || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
//                     </div>
//                     <div>
//                       <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Discount %</label>
//                       <input type="number" name="discount" value={editModal.productData.discount || 0} onChange={handleEditChange} min="0" max="99" className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
//                     </div>
//                     <div>
//                       <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><Box size={14}/> Stock</label>
//                       <input required type="number" name="stock" value={editModal.productData.stock || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
//                     </div>
//                   </div>

//                   {/* Category Input */}
//                   <div>
//                     <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Category</label>
//                     <div className="relative">
//                       <input 
//                         type="text" 
//                         name="category" 
//                         value={editModal.productData.category || ''} 
//                         onChange={handleEditChange} 
//                         list="category-options"
//                         placeholder="Type or select a category..."
//                         className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" 
//                       />
//                       <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
//                     </div>
//                     <datalist id="category-options">
//                       {existingCategories.map((cat, idx) => (
//                         <option key={idx} value={cat} />
//                       ))}
//                     </datalist>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {NAVBAR_CATEGORIES.slice(0, 5).map(cat => (
//                         <button
//                           key={cat}
//                           type="button"
//                           onClick={() => setEditModal(prev => ({...prev, productData: {...prev.productData, category: cat}}))}
//                           className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
//                             editModal.productData.category === cat 
//                               ? 'bg-[#6e4b31] text-white' 
//                               : 'bg-white border border-stone-200 text-stone-600 hover:border-[#6e4b31]/30'
//                           }`}
//                         >
//                           {cat}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Tags Input */}
//                   <div>
//                     <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Tags</label>
//                     <div className="bg-white border border-stone-200 rounded-xl p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-[#6e4b31]/30 focus-within:border-[#6e4b31] transition-all shadow-sm">
//                       {(editModal.productData.tags || []).map((tag, idx) => (
//                         <span key={idx} className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
//                           {tag}
//                           <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
//                             <X size={12} />
//                           </button>
//                         </span>
//                       ))}
//                       <input 
//                         type="text"
//                         placeholder="Add tags... (press Enter)"
//                         onKeyDown={handleTagAdd}
//                         className="flex-1 min-w-[120px] border-none outline-none text-sm py-1.5 px-1"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Right Column: Images */}
//                 <div className="lg:col-span-5 bg-white rounded-2xl p-5 md:p-6 border border-stone-200 shadow-sm h-fit">
//                   <h4 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
//                     <ImagePlus size={18} className="text-[#6e4b31]" /> Product Media
//                     {(editModal.productData.images?.length > 0) && (
//                       <span className="text-xs text-stone-400 font-normal">({editModal.productData.images.length} images)</span>
//                     )}
//                   </h4>
                  
//                   {/* Main Image Preview */}
//                   {editModal.productData.images?.length > 0 && (
//                     <div className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50 mb-4 group">
//                       <img 
//                         src={editModal.productData.images[imagePreviewIndex] || '/placeholder.png'} 
//                         alt={`Preview ${imagePreviewIndex + 1}`}
//                         className="w-full h-full object-cover"
//                         onError={(e) => { 
//                           e.target.src = '/placeholder.png';
//                           e.target.alt = 'Image not available';
//                         }}
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
//                         <div className="flex gap-2">
//                           <button 
//                             type="button"
//                             onClick={() => setImagePreviewIndex(prev => Math.max(0, prev - 1))}
//                             disabled={imagePreviewIndex === 0}
//                             className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 disabled:opacity-30 transition-all"
//                           >
//                             <ChevronLeft size={16} className="text-white" />
//                           </button>
//                           <button 
//                             type="button"
//                             onClick={() => setImagePreviewIndex(prev => Math.min((editModal.productData.images?.length || 1) - 1, prev + 1))}
//                             disabled={imagePreviewIndex === (editModal.productData.images?.length || 1) - 1}
//                             className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 disabled:opacity-30 transition-all"
//                           >
//                             <ChevronRight size={16} className="text-white" />
//                           </button>
//                         </div>
//                         <span className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
//                           {imagePreviewIndex + 1} / {editModal.productData.images.length}
//                         </span>
//                       </div>
//                       <div className="absolute top-2 left-2 bg-[#6e4b31] text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-md shadow-sm">
//                         {imagePreviewIndex === 0 ? 'Primary' : 'Image'}
//                       </div>
//                     </div>
//                   )}

//                   {/* Image Gallery with Drag & Drop */}
//                   <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 mb-4">
//                     {(editModal.productData.images && editModal.productData.images.length > 0) ? (
//                       editModal.productData.images.map((imgUrl, idx) => (
//                         <div 
//                           key={`img-${idx}-${imgUrl?.slice(0, 20)}`}
//                           draggable
//                           onDragStart={() => handleDragStart(idx)}
//                           onDragOver={(e) => handleDragOver(e, idx)}
//                           onDragEnd={handleDragEnd}
//                           onClick={() => setImagePreviewIndex(idx)}
//                           className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
//                             imagePreviewIndex === idx 
//                               ? 'border-[#6e4b31] ring-2 ring-[#6e4b31]/20' 
//                               : 'border-stone-200 hover:border-stone-300'
//                           } ${draggedImage === idx ? 'opacity-50 scale-95' : ''}`}
//                         >
//                           <img 
//                             src={imgUrl} 
//                             alt={`Product ${idx + 1}`} 
//                             className="w-full h-full object-cover"
//                             onError={(e) => { 
//                               e.target.src = '/placeholder.png';
//                               e.target.alt = 'Invalid image';
//                             }}
//                           />
//                           <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
//                             <button 
//                               type="button" 
//                               onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
//                               className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
//                             >
//                               <Trash2 size={12} />
//                             </button>
//                           </div>
//                           {idx === 0 && <span className="absolute top-1 left-1 bg-[#6e4b31] text-white text-[9px] font-black px-1.5 py-0.5 rounded">Main</span>}
//                         </div>
//                       ))
//                     ) : (
//                       <div className="col-span-full py-8 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
//                         <ImagePlus className="mx-auto text-stone-300 mb-2" size={24} />
//                         <p className="text-xs font-bold text-stone-400">No images added</p>
//                         <p className="text-[10px] text-stone-400 mt-1">Upload or paste URLs below</p>
//                       </div>
//                     )}
//                   </div>

//                   <div className="space-y-4">
//                     {/* File Upload Area */}
//                     <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-5 text-center hover:bg-stone-50 transition-colors bg-stone-50/50 cursor-pointer">
//                       <input 
//                         ref={fileInputRef}
//                         type="file" 
//                         multiple 
//                         accept="image/*" 
//                         onChange={handleImageUpload} 
//                         disabled={uploadingImage}
//                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
//                         onClick={(e) => e.stopPropagation()}
//                       />
//                       {uploadingImage ? (
//                         <div className="flex flex-col items-center pointer-events-none">
//                           <Loader2 className="animate-spin text-[#6e4b31] mb-2" size={24} />
//                           <span className="text-sm font-bold text-stone-600">Uploading images...</span>
//                           <span className="text-xs text-stone-400 mt-1">Please wait</span>
//                         </div>
//                       ) : (
//                         <div className="flex flex-col items-center pointer-events-none text-stone-500">
//                           <UploadCloud size={28} className="mb-2 text-[#6e4b31]/60" />
//                           <span className="text-sm font-medium text-stone-800">Click to Browse Files</span>
//                           <span className="text-[10px] text-stone-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
//                         </div>
//                       )}
//                     </div>
                    
//                     <div className="relative flex items-center py-1">
//                       <div className="flex-grow border-t border-stone-200"></div>
//                       <span className="flex-shrink-0 mx-4 text-xs font-bold text-stone-400 uppercase">OR</span>
//                       <div className="flex-grow border-t border-stone-200"></div>
//                     </div>
                    
//                     {/* URL Input */}
//                     <div className="flex gap-2">
//                       <div className="relative flex-1">
//                         <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
//                         <input 
//                           type="url" 
//                           value={newImageUrl} 
//                           onChange={(e) => setNewImageUrl(e.target.value)} 
//                           onKeyDown={(e) => {
//                             if (e.key === 'Enter') {
//                               e.preventDefault();
//                               handleAddImageUrl();
//                             }
//                           }}
//                           placeholder="Paste image URL (https://...)" 
//                           className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all"
//                         />
//                       </div>
//                       <button 
//                         type="button" 
//                         onClick={handleAddImageUrl} 
//                         className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2.5 rounded-xl font-bold transition-colors text-sm"
//                       >
//                         Add URL
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </div>

//             {/* Modal Footer */}
//             <div className="p-4 md:p-6 border-t border-stone-100 bg-white flex justify-between items-center shrink-0">
//               <button 
//                 type="button" 
//                 onClick={() => openPreviewModal(editModal.productData)}
//                 className="px-4 py-2.5 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors text-sm flex items-center gap-2"
//               >
//                 <Eye size={16} /> Preview
//               </button>
//               <div className="flex gap-3">
//                 <button type="button" onClick={() => setEditModal({ isOpen: false, productData: null })} className="px-5 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors text-sm">
//                   Cancel
//                 </button>
//                 <button form="edit-product-form" type="submit" disabled={uploadingImage} className="bg-[#6e4b31] hover:bg-[#5a3d28] disabled:bg-stone-400 text-white px-6 md:px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#6e4b31]/20 flex items-center gap-2 text-sm">
//                   <CheckCircle size={18} /> {uploadingImage ? "Saving..." : "Save Changes"}
//                 </button>
//               </div>
//             </div>

//           </div>
//         </div>
//       )}
//     </>
//   );

//   return (
//     <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 relative font-sans text-stone-800">
      
//       {createPortal(modalOverlays, document.body)}

//       {/* 👑 HEADER */}
//       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm">
//         <div>
//           <h1 className="text-2xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">Product Portfolio</h1>
//           <p className="text-stone-500 mt-1 md:mt-2 text-sm md:text-base font-medium">Curate and manage your luxury inventory</p>
//         </div>
//         <div className="flex gap-3">
//           <Link to="/vendor/add-product" className="bg-[#6e4b31] hover:bg-[#5a3d28] hover:-translate-y-0.5 text-white px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#6e4b31]/20">
//             <Plus size={20} /> Add New Piece
//           </Link>
//         </div>
//       </div>

//       {/* 📊 STATS CARDS */}
//       <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
//         {[
//           { label: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
//           { label: 'Active', value: stats.activeProducts, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
//           { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
//           { label: 'Featured', value: stats.featuredCount, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
//           { label: 'Inventory Value', value: `₹${(stats.totalValue/1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
//         ].map((stat, idx) => (
//           <div key={idx} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm hover:shadow-md transition-all">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</span>
//               <div className={`${stat.bg} p-2 rounded-lg`}>
//                 <stat.icon size={16} className={stat.color} />
//               </div>
//             </div>
//             <span className="text-xl md:text-2xl font-black text-stone-900">{stat.value}</span>
//           </div>
//         ))}
//       </div>

//       {/* 🔍 SEARCH & FILTERS */}
//       <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm space-y-4">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1 flex items-center bg-stone-50 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#6e4b31]/20 transition-all">
//             <Search size={18} className="text-[#6e4b31] mr-3" />
//             <input 
//               type="text" 
//               placeholder="Search collections..." 
//               value={searchTerm} 
//               onChange={(e) => setSearchTerm(e.target.value)} 
//               className="bg-transparent border-none outline-none w-full py-3 text-sm font-medium text-stone-800 placeholder-stone-400" 
//             />
//           </div>
//           <div className="flex gap-2">
//             <button 
//               onClick={() => setShowFilters(!showFilters)}
//               className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
//                 showFilters ? 'bg-[#6e4b31] text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
//               }`}
//             >
//               <SlidersHorizontal size={16} /> Filters
//             </button>
//             <div className="flex bg-stone-50 rounded-xl p-1">
//               <button 
//                 onClick={() => setViewMode('grid')}
//                 className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#6e4b31]' : 'text-stone-400 hover:text-stone-600'}`}
//               >
//                 <Grid3X3 size={18} />
//               </button>
//               <button 
//                 onClick={() => setViewMode('table')}
//                 className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#6e4b31]' : 'text-stone-400 hover:text-stone-600'}`}
//               >
//                 <List size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Expandable Filters */}
//         {showFilters && (
//           <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3 animate-slide-down">
//             <select 
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value)}
//               className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#6e4b31]/20"
//             >
//               <option value="newest">Newest First</option>
//               <option value="price-asc">Price: Low to High</option>
//               <option value="price-desc">Price: High to Low</option>
//               <option value="name">Name: A-Z</option>
//               <option value="stock-low">Stock: Low to High</option>
//               <option value="stock-high">Stock: High to Low</option>
//             </select>
            
//             <select 
//               value={filterCategory}
//               onChange={(e) => setFilterCategory(e.target.value)}
//               className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#6e4b31]/20"
//             >
//               <option value="All">All Categories</option>
//               {existingCategories.map(cat => (
//                 <option key={cat} value={cat}>{cat}</option>
//               ))}
//             </select>

//             {selectedProducts.length > 0 && (
//               <button 
//                 onClick={() => setBulkActionModal(true)}
//                 className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
//               >
//                 <Trash2 size={16} /> Delete Selected ({selectedProducts.length})
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* 📦 PRODUCTS DISPLAY */}
//       <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="p-16 md:p-24 flex flex-col items-center justify-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-[#6e4b31] mb-4"></div>
//             <p className="text-stone-500 text-sm font-medium">Loading your collection...</p>
//           </div>
//         ) : filteredProducts.length === 0 ? (
//           <div className="p-16 md:p-24 text-center">
//             <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
//               <PackageOpen size={36} className="text-stone-300"/>
//             </div>
//             <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">No Products Found</h3>
//             <p className="text-stone-500 text-sm font-medium mb-6">Your inventory matches no criteria or is currently empty.</p>
//             <Link to="/vendor/add-product" className="inline-flex items-center gap-2 bg-[#6e4b31] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a3d28] transition-all">
//               <Plus size={18} /> Add Your First Product
//             </Link>
//           </div>
//         ) : viewMode === 'grid' ? (
//           /* GRID VIEW */
//           <div>
//             {selectedProducts.length > 0 && (
//               <div className="px-6 py-3 bg-[#6e4b31]/5 border-b border-[#6e4b31]/10 flex justify-between items-center">
//                 <span className="text-sm font-medium text-[#6e4b31]">{selectedProducts.length} selected</span>
//                 <button onClick={() => setSelectedProducts([])} className="text-xs font-bold text-stone-500 hover:text-stone-800">Clear selection</button>
//               </div>
//             )}
//             <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
//               {filteredProducts.map((product) => {
//                 const displayImage = product.images?.length > 0 ? product.images[0] : (product.image || "/placeholder.png");
//                 const isSelected = selectedProducts.includes(product.id);
                
//                 return (
//                   <div 
//                     key={product.id} 
//                     className={`group bg-white rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
//                       isSelected ? 'border-[#6e4b31] ring-2 ring-[#6e4b31]/20' : 'border-stone-200 hover:border-stone-300'
//                     }`}
//                     onClick={(e) => {
//                       // Don't navigate if clicking on action buttons
//                       if (e.target.closest('button')) return;
//                       openProductDetails(product);
//                     }}
//                   >
//                     <div className="relative aspect-square rounded-t-2xl overflow-hidden bg-stone-100">
//                       <img 
//                         src={displayImage} 
//                         alt={product.name} 
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
//                         onError={(e) => { e.target.src = '/placeholder.png'; }}
//                       />
                      
//                       {/* Selection Checkbox */}
//                       <div className="absolute top-3 left-3 z-10">
//                         <button
//                           onClick={(e) => { e.stopPropagation(); toggleProductSelection(product.id); }}
//                           className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
//                             isSelected ? 'bg-[#6e4b31] border-[#6e4b31]' : 'bg-white/80 border-white hover:border-[#6e4b31]'
//                           }`}
//                         >
//                           {isSelected && <Check size={14} className="text-white" />}
//                         </button>
//                       </div>

//                       {/* Status Badges */}
//                       <div className="absolute top-3 right-3 flex flex-col gap-1.5">
//                         {product.featured && (
//                           <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
//                             <Star size={10} /> Featured
//                           </span>
//                         )}
//                         {product.discount > 0 && (
//                           <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
//                             -{product.discount}%
//                           </span>
//                         )}
//                       </div>

//                       {/* Quick Actions */}
//                       <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
//                         <button onClick={(e) => { e.stopPropagation(); openEditModal(product); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all" title="Edit">
//                           <Edit size={14} />
//                         </button>
//                         <button onClick={(e) => { e.stopPropagation(); openPreviewModal(product); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all" title="Preview">
//                           <Eye size={14} />
//                         </button>
//                         <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, productId: product.id }); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 text-red-500 transition-all" title="Delete">
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="p-4">
//                       <span className="text-[10px] font-bold text-[#6e4b31] uppercase tracking-wider">{product.category || "Uncategorized"}</span>
//                       <h3 className="font-bold text-stone-900 mt-1 line-clamp-1">{product.name}</h3>
//                       <div className="flex items-center justify-between mt-2">
//                         <div>
//                           {product.discount > 0 ? (
//                             <div className="flex items-center gap-2">
//                               <span className="text-lg font-black text-[#6e4b31]">
//                                 ₹{(product.price * (1 - product.discount / 100)).toLocaleString('en-IN')}
//                               </span>
//                               <span className="text-xs text-stone-400 line-through">
//                                 ₹{product.price?.toLocaleString('en-IN')}
//                               </span>
//                             </div>
//                           ) : (
//                             <span className="text-lg font-black text-[#6e4b31]">₹{product.price?.toLocaleString('en-IN')}</span>
//                           )}
//                         </div>
//                         <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                           product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 
//                           product.stock > 0 ? 'bg-amber-50 text-amber-700' : 
//                           'bg-red-50 text-red-700'
//                         }`}>
//                           {product.stock > 0 ? `${product.stock} left` : 'Sold Out'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ) : (
//           /* TABLE VIEW */
//           <div>
//             <div className="overflow-x-auto custom-scrollbar">
//               <table className="w-full text-left border-collapse min-w-[800px]">
//                 <thead>
//                   <tr className="bg-stone-50/50 border-b border-stone-100 text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-black">
//                     <th className="p-4 pl-6 w-10">
//                       <button onClick={toggleSelectAll} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
//                         selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? 'bg-[#6e4b31] border-[#6e4b31]' : 'border-stone-300'
//                       }`}>
//                         {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 && <Check size={12} className="text-white" />}
//                       </button>
//                     </th>
//                     <th className="p-4">Item Details</th>
//                     <th className="p-4">Category</th>
//                     <th className="p-4">Price</th>
//                     <th className="p-4">Stock</th>
//                     <th className="p-4">Status</th>
//                     <th className="p-4 pr-6 text-right">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-stone-50">
//                   {filteredProducts.map((product) => {
//                     const displayImage = product.images?.length > 0 ? product.images[0] : (product.image || "/placeholder.png");
//                     const isSelected = selectedProducts.includes(product.id);
                    
//                     return (
//                       <tr 
//                         key={product.id} 
//                         className={`hover:bg-stone-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-[#6e4b31]/5' : ''}`}
//                         onClick={() => openProductDetails(product)}
//                       >
//                         <td className="p-4 pl-6" onClick={(e) => e.stopPropagation()}>
//                           <button
//                             onClick={() => toggleProductSelection(product.id)}
//                             className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
//                               isSelected ? 'bg-[#6e4b31] border-[#6e4b31]' : 'border-stone-300'
//                             }`}
//                           >
//                             {isSelected && <Check size={12} className="text-white" />}
//                           </button>
//                         </td>
//                         <td className="p-4 flex items-center gap-4">
//                           <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-stone-200 bg-white shrink-0">
//                             <img 
//                               src={displayImage} 
//                               alt={product.name} 
//                               className="w-full h-full object-cover"
//                               onError={(e) => { e.target.src = '/placeholder.png'; }}
//                             />
//                           </div>
//                           <div>
//                             <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{product.name}</h4>
//                             <p className="text-[10px] font-medium text-stone-400 mt-1 uppercase">ID: {product.id?.slice(0, 8)}</p>
//                           </div>
//                         </td>
//                         <td className="p-4">
//                           <span className="bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg font-bold text-stone-600 text-xs whitespace-nowrap">
//                             {product.category || "Uncategorized"}
//                           </span>
//                         </td>
//                         <td className="p-4 text-sm font-black text-[#6e4b31]">₹{product.price?.toLocaleString('en-IN')}</td>
//                         <td className="p-4">
//                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
//                             product.stock > 10 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
//                             product.stock > 0 ? 'bg-amber-50 border-amber-100 text-amber-700' : 
//                             'bg-red-50 border-red-100 text-red-700'
//                           }`}>
//                             <span className={`w-1.5 h-1.5 rounded-full ${
//                               product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
//                             }`}></span>
//                             {product.stock > 0 ? `${product.stock} Units` : "Sold Out"}
//                           </span>
//                         </td>
//                         <td className="p-4">
//                           {product.featured && (
//                             <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
//                               <Star size={10} /> Featured
//                             </span>
//                           )}
//                         </td>
//                         <td className="p-4 pr-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
//                           <button onClick={() => openEditModal(product)} className="p-2 text-stone-400 hover:text-[#6e4b31] hover:bg-[#6e4b31]/10 rounded-lg transition-all" title="Edit"><Edit size={16} /></button>
//                           <button onClick={() => openPreviewModal(product)} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Preview"><Eye size={16} /></button>
//                           <button onClick={() => setDeleteModal({ isOpen: true, productId: product.id })} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
      
//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
//         @media (min-width: 768px) {
//           .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
//         }
//         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
//         .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d6d3d1; border-radius: 20px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #a8a29e; }
//         .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); }
        
//         @keyframes slide-down {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes scale-in {
//           from { opacity: 0; transform: scale(0.95); }
//           to { opacity: 1; transform: scale(1); }
//         }
//         @keyframes fade-in-up {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-slide-down { animation: slide-down 0.2s ease-out; }
//         .animate-scale-in { animation: scale-in 0.2s ease-out; }
//         .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
//       `}</style>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; 
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { 
  Edit, Trash2, Plus, Search, PackageOpen, AlertCircle, 
  CheckCircle, X, ImagePlus, Tag, Box, IndianRupee, FileText, 
  UploadCloud, RefreshCw, Link as LinkIcon, ChevronDown, 
  ChevronUp, Eye, Download, Filter, SlidersHorizontal, 
  ArrowUpDown, Grid3X3, List, MoreVertical, Copy, 
  ExternalLink, ShoppingBag, Star, TrendingUp, Clock,
  Check, ChevronLeft, ChevronRight, ZoomIn, Move, Loader2,
  Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw,
  Minus, Info, MapPin, Calendar, User, Hash, Percent
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// 🌟 YARNIVERSE NAVBAR CATEGORIES
const NAVBAR_CATEGORIES = [
  "All Handcraft",
  "State",
  "Collection",
  "Design",
  "Craft",
  "Sale",
  "Home Decor",
  "Clothing",
  "Accessories",
  "Art & Collectibles"
];

export default function VendorProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Premium UI States
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });
  const [editModal, setEditModal] = useState({ isOpen: false, productData: null });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, product: null });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkActionModal, setBulkActionModal] = useState(false);
  
  // Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [draggedImage, setDraggedImage] = useState(null);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileInputRef = useRef(null);

  // 🚀 REAL-TIME FIREBASE CONNECTION
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "products"), where("vendorId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const myProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(myProducts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  // Enhanced filtering and sorting
  const filteredProducts = products
    .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => filterCategory === "All" ? true : p.category === filterCategory)
    .sort((a, b) => {
      switch(sortBy) {
        case "price-asc": return (a.price || 0) - (b.price || 0);
        case "price-desc": return (b.price || 0) - (a.price || 0);
        case "name": return (a.name || "").localeCompare(b.name || "");
        case "stock-low": return (a.stock || 0) - (b.stock || 0);
        case "stock-high": return (b.stock || 0) - (a.stock || 0);
        default: return 0;
      }
    });

  const existingCategories = [...new Set([...NAVBAR_CATEGORIES, ...products.map(p => p.category).filter(Boolean)])];

  // DELETE LOGIC
  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", deleteModal.productId));
      showToast("Product deleted successfully");
      setSelectedProducts(prev => prev.filter(id => id !== deleteModal.productId));
    } catch (error) {
      showToast("Failed to delete product", "error");
    } finally {
      setDeleteModal({ isOpen: false, productId: null });
    }
  };

  // BULK DELETE
  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedProducts.map(id => deleteDoc(doc(db, "products", id))));
      showToast(`${selectedProducts.length} products deleted`);
      setSelectedProducts([]);
      setBulkActionModal(false);
    } catch (error) {
      showToast("Bulk delete failed", "error");
    }
  };

  // EDIT LOGIC
  const openEditModal = (product) => {
    let normalizedImages = [];
    
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      normalizedImages = product.images.filter(img => img && typeof img === 'string');
    } else if (product.image && typeof product.image === 'string') {
      normalizedImages = [product.image];
    }

    setEditModal({ 
      isOpen: true, 
      productData: { 
        ...product, 
        images: normalizedImages,
        description: product.description || "",
        category: product.category || "",
        tags: product.tags || [],
        discount: product.discount || 0,
        featured: product.featured || false,
        status: product.status || "active"
      } 
    });
    setImagePreviewIndex(0);
    setNewImageUrl("");
  };

  // 🖼️ Open Full Product Details Page
  const openProductDetails = (product) => {
    // Navigate to product details page
    navigate(`/vendor/product/${product.id}`, { state: { product } });
  };

  // 🖼️ Open Preview Modal with selected image
  const openPreviewModal = (product) => {
    setSelectedPreviewImage(0);
    setPreviewModal({ isOpen: true, product });
  };

  // Preview image navigation
  const nextPreviewImage = () => {
    if (previewModal.product?.images?.length > 0) {
      setSelectedPreviewImage(prev => 
        prev < previewModal.product.images.length - 1 ? prev + 1 : 0
      );
    }
  };

  const prevPreviewImage = () => {
    if (previewModal.product?.images?.length > 0) {
      setSelectedPreviewImage(prev => 
        prev > 0 ? prev - 1 : previewModal.product.images.length - 1
      );
    }
  };

  const selectPreviewImage = (index) => {
    setSelectedPreviewImage(index);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditModal(prev => ({
      ...prev,
      productData: { 
        ...prev.productData, 
        [name]: type === "checkbox" ? checked : 
                (name === "price" || name === "stock" || name === "discount" ? Number(value) : value) 
      }
    }));
  };

  // Handle tags
  const handleTagAdd = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = e.target.value.replace(',', '').trim();
      if (tag && !editModal.productData.tags.includes(tag)) {
        setEditModal(prev => ({
          ...prev,
          productData: {
            ...prev.productData,
            tags: [...prev.productData.tags, tag]
          }
        }));
      }
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setEditModal(prev => ({
      ...prev,
      productData: {
        ...prev.productData,
        tags: prev.productData.tags.filter(tag => tag !== tagToRemove)
      }
    }));
  };

  // ☁️ CLOUDINARY FILE UPLOAD LOGIC
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const maxSize = 10 * 1024 * 1024;
    for (const file of files) {
      if (file.size > maxSize) {
        showToast(`File ${file.name} is too large. Max 10MB allowed.`, "error");
        return;
      }
    }

    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME; 
    const UPLOAD_PRESET = import.meta.env.VITE_API_KEY; 

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      showToast("Cloudinary not configured. Using local preview.", "error");
      handleLocalImagePreview(files);
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("cloud_name", CLOUD_NAME);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        
        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        } else {
          console.error("Cloudinary Error:", data);
          throw new Error(data.error?.message || "Upload failed");
        }
      }

      if (uploadedUrls.length > 0) {
        setEditModal(prev => {
          const currentImages = [...(prev.productData.images || [])];
          return {
            ...prev,
            productData: { 
              ...prev.productData, 
              images: [...currentImages, ...uploadedUrls] 
            }
          };
        });
        showToast(`${uploadedUrls.length} images uploaded successfully!`);
      }
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      showToast(`Upload failed: ${error.message}`, "error");
      handleLocalImagePreview(files);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
      }
    }
  };

  // Local image preview fallback
  const handleLocalImagePreview = (files) => {
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(base64Images => {
      setEditModal(prev => {
        const currentImages = [...(prev.productData.images || [])];
        return {
          ...prev,
          productData: { 
            ...prev.productData, 
            images: [...currentImages, ...base64Images] 
          }
        };
      });
      showToast(`${files.length} images added locally (Cloudinary not configured)`);
    });
  };

  // Image drag & drop reordering
  const handleDragStart = (index) => {
    setDraggedImage(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedImage === null || draggedImage === index) return;
    
    setEditModal(prev => {
      const images = [...prev.productData.images];
      const draggedItem = images[draggedImage];
      images.splice(draggedImage, 1);
      images.splice(index, 0, draggedItem);
      return {
        ...prev,
        productData: { ...prev.productData, images }
      };
    });
    setDraggedImage(index);
  };

  const handleDragEnd = () => {
    setDraggedImage(null);
  };

  // ADD IMAGE BY URL
  const handleAddImageUrl = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    
    if (!url.match(/^https?:\/\/.+/i)) {
      showToast("Please enter a valid URL starting with http:// or https://", "error");
      return;
    }

    setEditModal(prev => {
      const currentImages = [...(prev.productData.images || [])];
      if (currentImages.includes(url)) {
        showToast("This image URL already exists", "error");
        return prev;
      }
      return {
        ...prev,
        productData: { 
          ...prev.productData, 
          images: [...currentImages, url] 
        }
      };
    });
    setNewImageUrl("");
    showToast("Image URL added successfully!");
  };

  const handleRemoveImage = (indexToRemove) => {
    setEditModal(prev => {
      const newImages = prev.productData.images.filter((_, idx) => idx !== indexToRemove);
      const newPreviewIndex = Math.min(imagePreviewIndex, newImages.length - 1);
      setImagePreviewIndex(Math.max(0, newPreviewIndex));
      return {
        ...prev,
        productData: {
          ...prev.productData,
          images: newImages
        }
      };
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    const { id, name, price, stock, category, description, images, tags, discount, featured, status } = editModal.productData;
    
    try {
      const cleanImages = (images || []).filter(img => img && typeof img === 'string');
      
      await updateDoc(doc(db, "products", id), { 
        name, 
        price: Number(price) || 0, 
        stock: Number(stock) || 0, 
        category: category || "", 
        description: description || "", 
        images: cleanImages,
        image: cleanImages.length > 0 ? cleanImages[0] : "",
        tags: tags || [],
        discount: Number(discount) || 0,
        featured: featured || false,
        status: status || "active",
        updatedAt: new Date().toISOString()
      });
      showToast("Product updated successfully! ✅");
      setEditModal({ isOpen: false, productData: null });
    } catch (error) {
      console.error("Update error:", error);
      showToast(`Failed to update product: ${error.message}`, "error");
    }
  };

  // Copy product link
  const copyProductLink = (productId) => {
    const link = `${window.location.origin}/product/${productId}`;
    navigator.clipboard.writeText(link);
    showToast("Product link copied! 📋");
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Stats calculation
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active' || !p.status).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock || 0), 0),
    featuredCount: products.filter(p => p.featured).length
  };

  // 🌀 MODAL OVERLAYS
  const modalOverlays = (
    <>
      {/* TOAST */}
      {toast.show && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[999999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-down border ${
          toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-[#f8f5f2] border-[#e8dfd8] text-[#5a3d28]'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} className="text-[#6e4b31]" />}
          <span className="font-semibold text-sm tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-stone-100 animate-scale-in">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">Delete Product</h3>
            <p className="text-stone-500 text-sm mb-8">This action is permanent. Are you sure you want to remove this item?</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ isOpen: false, productId: null })} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3.5 rounded-xl font-bold transition-all">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20">Delete Item</button>
            </div>
          </div>
        </div>
      )}

      {/* 🖼️ ENHANCED PRODUCT PREVIEW MODAL WITH IMAGE SWITCHING */}
      {previewModal.isOpen && previewModal.product && (
        <div className="fixed inset-0 bg-stone-900/95 backdrop-blur-sm z-[99999] flex items-center justify-center p-0 md:p-4">
          <div className="bg-white md:rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto animate-scale-in">
            {/* Close Button */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-stone-100 p-4 md:p-6 flex justify-between items-center z-10 rounded-t-3xl">
              <div>
                <h3 className="font-serif font-bold text-xl md:text-2xl">Product Preview</h3>
                <p className="text-xs text-stone-400 mt-0.5">See how customers view this product</p>
              </div>
              <button 
                onClick={() => setPreviewModal({ isOpen: false, product: null })} 
                className="p-2 hover:bg-stone-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* LEFT: Image Gallery */}
              <div className="space-y-4">
                {/* Main Display Image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 group">
                  <img 
                    src={previewModal.product.images?.[selectedPreviewImage] || previewModal.product.image || "/placeholder.png"} 
                    alt={`${previewModal.product.name} - Image ${selectedPreviewImage + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.target.src = "/placeholder.png"; }}
                  />
                  
                  {/* Image Navigation Arrows */}
                  {previewModal.product.images?.length > 1 && (
                    <>
                      <button 
                        onClick={prevPreviewImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronLeft size={20} className="text-stone-700" />
                      </button>
                      <button 
                        onClick={nextPreviewImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ChevronRight size={20} className="text-stone-700" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {previewModal.product.images?.length > 1 && (
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {selectedPreviewImage + 1} / {previewModal.product.images.length}
                    </div>
                  )}

                  {/* Zoom Button */}
                  <button 
                    onClick={() => setLightboxOpen(true)}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white backdrop-blur-sm p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    title="View full size"
                  >
                    <ZoomIn size={18} className="text-stone-700" />
                  </button>
                </div>

                {/* Thumbnail Gallery - CLICKABLE */}
                {previewModal.product.images?.length > 1 && (
                  <div className="grid grid-cols-5 md:grid-cols-6 gap-2 md:gap-3">
                    {previewModal.product.images.map((img, idx) => (
                      <button
                        key={`thumb-${idx}`}
                        onClick={() => selectPreviewImage(idx)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPreviewImage === idx 
                            ? 'border-[#6e4b31] ring-2 ring-[#6e4b31]/30' 
                            : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${idx + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        {selectedPreviewImage === idx && (
                          <div className="absolute inset-0 bg-[#6e4b31]/10"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Product Details */}
              <div className="space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <span>Home</span>
                  <ChevronRight size={12} />
                  <span>{previewModal.product.category || "Category"}</span>
                  <ChevronRight size={12} />
                  <span className="text-stone-600 truncate">{previewModal.product.name}</span>
                </div>

                {/* Category Badge */}
                <span className="inline-block text-xs font-bold text-[#6e4b31] bg-[#6e4b31]/5 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {previewModal.product.category || "Uncategorized"}
                </span>

                {/* Product Name */}
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-tight">
                  {previewModal.product.name}
                </h2>

                {/* Price Section */}
                <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl md:text-4xl font-black text-[#6e4b31]">
                      ₹{((previewModal.product.price || 0) * (1 - (previewModal.product.discount || 0) / 100)).toLocaleString('en-IN')}
                    </span>
                    {previewModal.product.discount > 0 && (
                      <>
                        <span className="text-lg text-stone-400 line-through">
                          ₹{previewModal.product.price?.toLocaleString('en-IN')}
                        </span>
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">
                          {previewModal.product.discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Inclusive of all taxes</p>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                    previewModal.product.stock > 0 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      previewModal.product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}></span>
                    {previewModal.product.stock > 0 
                      ? `${previewModal.product.stock} Units Available` 
                      : 'Out of Stock'}
                  </div>
                  {previewModal.product.featured && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                      <Star size={12} fill="currentColor" /> Featured
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-stone-400" /> Description
                  </h4>
                  <p className="text-stone-600 leading-relaxed text-sm md:text-base">
                    {previewModal.product.description || "No description provided."}
                  </p>
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Product ID</span>
                    <p className="text-sm font-mono font-bold text-stone-700 mt-1">{previewModal.product.id?.slice(0, 12)}...</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Category</span>
                    <p className="text-sm font-bold text-stone-700 mt-1">{previewModal.product.category || "N/A"}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Original Price</span>
                    <p className="text-sm font-bold text-stone-700 mt-1">₹{previewModal.product.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Status</span>
                    <p className="text-sm font-bold text-emerald-600 mt-1">{previewModal.product.status || 'Active'}</p>
                  </div>
                </div>

                {/* Tags */}
                {previewModal.product.tags?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-2">
                      <Hash size={16} className="text-stone-400" /> Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {previewModal.product.tags.map((tag, idx) => (
                        <span key={idx} className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-stone-200 transition-colors cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features Icons */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100">
                  <div className="text-center">
                    <Truck size={20} className="mx-auto text-stone-400 mb-1" />
                    <span className="text-[10px] font-medium text-stone-500">Free Shipping</span>
                  </div>
                  <div className="text-center">
                    <Shield size={20} className="mx-auto text-stone-400 mb-1" />
                    <span className="text-[10px] font-medium text-stone-500">Secure Payment</span>
                  </div>
                  <div className="text-center">
                    <RotateCcw size={20} className="mx-auto text-stone-400 mb-1" />
                    <span className="text-[10px] font-medium text-stone-500">Easy Returns</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => copyProductLink(previewModal.product.id)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Copy size={16} /> Copy Link
                  </button>
                  <button 
                    onClick={() => {
                      setPreviewModal({ isOpen: false, product: null });
                      openEditModal(previewModal.product);
                    }}
                    className="flex-1 bg-[#6e4b31] hover:bg-[#5a3d28] text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#6e4b31]/20"
                  >
                    <Edit size={16} /> Edit Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 LIGHTBOX FOR FULL SCREEN IMAGE */}
      {lightboxOpen && previewModal.product && (
        <div 
          className="fixed inset-0 bg-black z-[999999] flex items-center justify-center cursor-zoom-out"
          onClick={() => setLightboxOpen(false)}
        >
          <button 
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
          >
            <X size={32} />
          </button>
          
          {previewModal.product.images?.length > 1 && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); prevPreviewImage(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-10"
              >
                <ChevronLeft size={40} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); nextPreviewImage(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 z-10"
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}
          
          <img 
            src={previewModal.product.images?.[selectedPreviewImage] || previewModal.product.image} 
            alt="Full size preview"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            {selectedPreviewImage + 1} / {previewModal.product.images?.length || 1}
          </div>
        </div>
      )}

      {/* BULK ACTION MODAL */}
      {bulkActionModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center border border-stone-100 animate-scale-in">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={36} />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Bulk Delete</h3>
            <p className="text-stone-500 mb-6">Delete {selectedProducts.length} selected products? This cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setBulkActionModal(false)} className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 py-3 rounded-xl font-bold">Cancel</button>
              <button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal.isOpen && editModal.productData && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-0 md:p-4">
          <div className="bg-white md:rounded-3xl shadow-2xl w-full max-w-6xl h-full md:h-[92vh] flex flex-col overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 md:px-8 py-5 border-b border-stone-100 flex justify-between items-center bg-white shrink-0">
              <div>
                <h3 className="font-serif font-bold text-xl md:text-2xl text-stone-900">Edit Collection Item</h3>
                <p className="text-xs font-medium text-stone-400 mt-1 uppercase tracking-widest">ID: {editModal.productData.id?.slice(0, 12)}</p>
              </div>
              <button onClick={() => setEditModal({ isOpen: false, productData: null })} className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-stone-50/50">
              <form id="edit-product-form" onSubmit={handleUpdateProduct} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Details */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Status & Featured Toggles */}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-3 cursor-pointer hover:border-[#6e4b31]/30 transition-all">
                      <input 
                        type="checkbox" 
                        name="featured" 
                        checked={editModal.productData.featured || false} 
                        onChange={handleEditChange}
                        className="w-4 h-4 rounded border-stone-300 text-[#6e4b31] focus:ring-[#6e4b31]"
                      />
                      <div>
                        <span className="font-bold text-sm flex items-center gap-1.5"><Star size={14} className="text-amber-500" /> Featured Product</span>
                        <span className="text-xs text-stone-400">Show in featured section</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-3 cursor-pointer hover:border-[#6e4b31]/30 transition-all">
                      <input 
                        type="checkbox" 
                        name="status" 
                        checked={editModal.productData.status === 'active'} 
                        onChange={(e) => setEditModal(prev => ({
                          ...prev,
                          productData: { ...prev.productData, status: e.target.checked ? 'active' : 'draft' }
                        }))}
                        className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-sm flex items-center gap-1.5"><CheckCircle size={14} className="text-emerald-500" /> Active</span>
                        <span className="text-xs text-stone-400">Visible to customers</span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><Tag size={14}/> Product Name</label>
                    <input required type="text" name="name" value={editModal.productData.name || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><FileText size={14}/> Description</label>
                    <textarea name="description" rows="5" value={editModal.productData.description || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium resize-none shadow-sm" placeholder="Enter product details..." />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><IndianRupee size={14}/> Price</label>
                      <input required type="number" name="price" value={editModal.productData.price || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Discount %</label>
                      <input type="number" name="discount" value={editModal.productData.discount || 0} onChange={handleEditChange} min="0" max="99" className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider mb-2"><Box size={14}/> Stock</label>
                      <input required type="number" name="stock" value={editModal.productData.stock || ''} onChange={handleEditChange} className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" />
                    </div>
                  </div>

                  {/* Category Input */}
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Category</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        name="category" 
                        value={editModal.productData.category || ''} 
                        onChange={handleEditChange} 
                        list="category-options"
                        placeholder="Type or select a category..."
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium shadow-sm" 
                      />
                      <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                    <datalist id="category-options">
                      {existingCategories.map((cat, idx) => (
                        <option key={idx} value={cat} />
                      ))}
                    </datalist>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {NAVBAR_CATEGORIES.slice(0, 5).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditModal(prev => ({...prev, productData: {...prev.productData, category: cat}}))}
                          className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                            editModal.productData.category === cat 
                              ? 'bg-[#6e4b31] text-white' 
                              : 'bg-white border border-stone-200 text-stone-600 hover:border-[#6e4b31]/30'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags Input */}
                  <div>
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 block">Tags</label>
                    <div className="bg-white border border-stone-200 rounded-xl p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-[#6e4b31]/30 focus-within:border-[#6e4b31] transition-all shadow-sm">
                      {(editModal.productData.tags || []).map((tag, idx) => (
                        <span key={idx} className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text"
                        placeholder="Add tags... (press Enter)"
                        onKeyDown={handleTagAdd}
                        className="flex-1 min-w-[120px] border-none outline-none text-sm py-1.5 px-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Images */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-5 md:p-6 border border-stone-200 shadow-sm h-fit">
                  <h4 className="text-sm font-bold text-stone-800 mb-4 flex items-center gap-2">
                    <ImagePlus size={18} className="text-[#6e4b31]" /> Product Media
                    {(editModal.productData.images?.length > 0) && (
                      <span className="text-xs text-stone-400 font-normal">({editModal.productData.images.length} images)</span>
                    )}
                  </h4>
                  
                  {/* Main Image Preview */}
                  {editModal.productData.images?.length > 0 && (
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-50 mb-4 group">
                      <img 
                        src={editModal.productData.images[imagePreviewIndex] || '/placeholder.png'} 
                        alt={`Preview ${imagePreviewIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { 
                          e.target.src = '/placeholder.png';
                          e.target.alt = 'Image not available';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                        <div className="flex gap-2">
                          <button 
                            type="button"
                            onClick={() => setImagePreviewIndex(prev => Math.max(0, prev - 1))}
                            disabled={imagePreviewIndex === 0}
                            className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 disabled:opacity-30 transition-all"
                          >
                            <ChevronLeft size={16} className="text-white" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => setImagePreviewIndex(prev => Math.min((editModal.productData.images?.length || 1) - 1, prev + 1))}
                            disabled={imagePreviewIndex === (editModal.productData.images?.length || 1) - 1}
                            className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 disabled:opacity-30 transition-all"
                          >
                            <ChevronRight size={16} className="text-white" />
                          </button>
                        </div>
                        <span className="text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                          {imagePreviewIndex + 1} / {editModal.productData.images.length}
                        </span>
                      </div>
                      <div className="absolute top-2 left-2 bg-[#6e4b31] text-white text-[10px] uppercase font-black px-2 py-0.5 rounded-md shadow-sm">
                        {imagePreviewIndex === 0 ? 'Primary' : 'Image'}
                      </div>
                    </div>
                  )}

                  {/* Image Gallery with Drag & Drop */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-3 mb-4">
                    {(editModal.productData.images && editModal.productData.images.length > 0) ? (
                      editModal.productData.images.map((imgUrl, idx) => (
                        <div 
                          key={`img-${idx}-${imgUrl?.slice(0, 20)}`}
                          draggable
                          onDragStart={() => handleDragStart(idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setImagePreviewIndex(idx)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                            imagePreviewIndex === idx 
                              ? 'border-[#6e4b31] ring-2 ring-[#6e4b31]/20' 
                              : 'border-stone-200 hover:border-stone-300'
                          } ${draggedImage === idx ? 'opacity-50 scale-95' : ''}`}
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Product ${idx + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              e.target.src = '/placeholder.png';
                              e.target.alt = 'Invalid image';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                            <button 
                              type="button" 
                              onClick={(e) => { e.stopPropagation(); handleRemoveImage(idx); }}
                              className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          {idx === 0 && <span className="absolute top-1 left-1 bg-[#6e4b31] text-white text-[9px] font-black px-1.5 py-0.5 rounded">Main</span>}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
                        <ImagePlus className="mx-auto text-stone-300 mb-2" size={24} />
                        <p className="text-xs font-bold text-stone-400">No images added</p>
                        <p className="text-[10px] text-stone-400 mt-1">Upload or paste URLs below</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* File Upload Area */}
                    <div className="relative border-2 border-dashed border-stone-300 rounded-xl p-5 text-center hover:bg-stone-50 transition-colors bg-stone-50/50 cursor-pointer">
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        disabled={uploadingImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center pointer-events-none">
                          <Loader2 className="animate-spin text-[#6e4b31] mb-2" size={24} />
                          <span className="text-sm font-bold text-stone-600">Uploading images...</span>
                          <span className="text-xs text-stone-400 mt-1">Please wait</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center pointer-events-none text-stone-500">
                          <UploadCloud size={28} className="mb-2 text-[#6e4b31]/60" />
                          <span className="text-sm font-medium text-stone-800">Click to Browse Files</span>
                          <span className="text-[10px] text-stone-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative flex items-center py-1">
                      <div className="flex-grow border-t border-stone-200"></div>
                      <span className="flex-shrink-0 mx-4 text-xs font-bold text-stone-400 uppercase">OR</span>
                      <div className="flex-grow border-t border-stone-200"></div>
                    </div>
                    
                    {/* URL Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input 
                          type="url" 
                          value={newImageUrl} 
                          onChange={(e) => setNewImageUrl(e.target.value)} 
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                          placeholder="Paste image URL (https://...)" 
                          className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-3 text-sm text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all"
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={handleAddImageUrl} 
                        className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2.5 rounded-xl font-bold transition-colors text-sm"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-stone-100 bg-white flex justify-between items-center shrink-0">
              <button 
                type="button" 
                onClick={() => openPreviewModal(editModal.productData)}
                className="px-4 py-2.5 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors text-sm flex items-center gap-2"
              >
                <Eye size={16} /> Preview
              </button>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditModal({ isOpen: false, productData: null })} className="px-5 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-100 transition-colors text-sm">
                  Cancel
                </button>
                <button form="edit-product-form" type="submit" disabled={uploadingImage} className="bg-[#6e4b31] hover:bg-[#5a3d28] disabled:bg-stone-400 text-white px-6 md:px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#6e4b31]/20 flex items-center gap-2 text-sm">
                  <CheckCircle size={18} /> {uploadingImage ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 relative font-sans text-stone-800">
      
      {createPortal(modalOverlays, document.body)}

      {/* 👑 HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 bg-white p-6 md:p-8 rounded-3xl border border-stone-100 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">Product Portfolio</h1>
          <p className="text-stone-500 mt-1 md:mt-2 text-sm md:text-base font-medium">Curate and manage your luxury inventory</p>
        </div>
        <div className="flex gap-3">
          <Link to="/vendor/add-product" className="bg-[#6e4b31] hover:bg-[#5a3d28] hover:-translate-y-0.5 text-white px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#6e4b31]/20">
            <Plus size={20} /> Add New Piece
          </Link>
        </div>
      </div>

      {/* 📊 STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: 'Total Products', value: stats.totalProducts, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active', value: stats.activeProducts, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Featured', value: stats.featuredCount, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Inventory Value', value: `₹${(stats.totalValue/1000).toFixed(1)}k`, icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <span className="text-xl md:text-2xl font-black text-stone-900">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* 🔍 SEARCH & FILTERS */}
      <div className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center bg-stone-50 rounded-xl px-4 focus-within:ring-2 focus-within:ring-[#6e4b31]/20 transition-all">
            <Search size={18} className="text-[#6e4b31] mr-3" />
            <input 
              type="text" 
              placeholder="Search collections..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="bg-transparent border-none outline-none w-full py-3 text-sm font-medium text-stone-800 placeholder-stone-400" 
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                showFilters ? 'bg-[#6e4b31] text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <div className="flex bg-stone-50 rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#6e4b31]' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#6e4b31]' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-stone-100 flex flex-wrap gap-3 animate-slide-down">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#6e4b31]/20"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
              <option value="stock-low">Stock: Low to High</option>
              <option value="stock-high">Stock: High to Low</option>
            </select>
            
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium text-stone-700 outline-none focus:ring-2 focus:ring-[#6e4b31]/20"
            >
              <option value="All">All Categories</option>
              {existingCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {selectedProducts.length > 0 && (
              <button 
                onClick={() => setBulkActionModal(true)}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
              >
                <Trash2 size={16} /> Delete Selected ({selectedProducts.length})
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📦 PRODUCTS DISPLAY */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 md:p-24 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-[#6e4b31] mb-4"></div>
            <p className="text-stone-500 text-sm font-medium">Loading your collection...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 md:p-24 text-center">
            <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageOpen size={36} className="text-stone-300"/>
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">No Products Found</h3>
            <p className="text-stone-500 text-sm font-medium mb-6">Your inventory matches no criteria or is currently empty.</p>
            <Link to="/vendor/add-product" className="inline-flex items-center gap-2 bg-[#6e4b31] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a3d28] transition-all">
              <Plus size={18} /> Add Your First Product
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div>
            {selectedProducts.length > 0 && (
              <div className="px-6 py-3 bg-[#6e4b31]/5 border-b border-[#6e4b31]/10 flex justify-between items-center">
                <span className="text-sm font-medium text-[#6e4b31]">{selectedProducts.length} selected</span>
                <button onClick={() => setSelectedProducts([])} className="text-xs font-bold text-stone-500 hover:text-stone-800">Clear selection</button>
              </div>
            )}
            <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => {
                const displayImage = product.images?.length > 0 ? product.images[0] : (product.image || "/placeholder.png");
                const isSelected = selectedProducts.includes(product.id);
                
                return (
                  <div 
                    key={product.id} 
                    className={`group bg-white rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                      isSelected ? 'border-[#6e4b31] ring-2 ring-[#6e4b31]/20' : 'border-stone-200 hover:border-stone-300'
                    }`}
                    onClick={(e) => {
                      // Don't navigate if clicking on action buttons
                      if (e.target.closest('button')) return;
                      openProductDetails(product);
                    }}
                  >
                    <div className="relative aspect-square rounded-t-2xl overflow-hidden bg-stone-100">
                      <img 
                        src={displayImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                      />
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-3 left-3 z-10">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleProductSelection(product.id); }}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-[#6e4b31] border-[#6e4b31]' : 'bg-white/80 border-white hover:border-[#6e4b31]'
                          }`}
                        >
                          {isSelected && <Check size={14} className="text-white" />}
                        </button>
                      </div>

                      {/* Status Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                        {product.featured && (
                          <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star size={10} /> Featured
                          </span>
                        )}
                        {product.discount > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(product); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openPreviewModal(product); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all" title="Preview">
                          <Eye size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteModal({ isOpen: true, productId: product.id }); }} className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-50 text-red-500 transition-all" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="p-4">
                      <span className="text-[10px] font-bold text-[#6e4b31] uppercase tracking-wider">{product.category || "Uncategorized"}</span>
                      <h3 className="font-bold text-stone-900 mt-1 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          {product.discount > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-[#6e4b31]">
                                ₹{(product.price * (1 - product.discount / 100)).toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs text-stone-400 line-through">
                                ₹{product.price?.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-black text-[#6e4b31]">₹{product.price?.toLocaleString('en-IN')}</span>
                          )}
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 
                          product.stock > 0 ? 'bg-amber-50 text-amber-700' : 
                          'bg-red-50 text-red-700'
                        }`}>
                          {product.stock > 0 ? `${product.stock} left` : 'Sold Out'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* TABLE VIEW */
          <div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-stone-50/50 border-b border-stone-100 text-[10px] md:text-xs uppercase tracking-widest text-stone-500 font-black">
                    <th className="p-4 pl-6 w-10">
                      <button onClick={toggleSelectAll} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? 'bg-[#6e4b31] border-[#6e4b31]' : 'border-stone-300'
                      }`}>
                        {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 && <Check size={12} className="text-white" />}
                      </button>
                    </th>
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredProducts.map((product) => {
                    const displayImage = product.images?.length > 0 ? product.images[0] : (product.image || "/placeholder.png");
                    const isSelected = selectedProducts.includes(product.id);
                    
                    return (
                      <tr 
                        key={product.id} 
                        className={`hover:bg-stone-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-[#6e4b31]/5' : ''}`}
                        onClick={() => openProductDetails(product)}
                      >
                        <td className="p-4 pl-6" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleProductSelection(product.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-[#6e4b31] border-[#6e4b31]' : 'border-stone-300'
                            }`}
                          >
                            {isSelected && <Check size={12} className="text-white" />}
                          </button>
                        </td>
                        <td className="p-4 flex items-center gap-4">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden border border-stone-200 bg-white shrink-0">
                            <img 
                              src={displayImage} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/placeholder.png'; }}
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm line-clamp-1">{product.name}</h4>
                            <p className="text-[10px] font-medium text-stone-400 mt-1 uppercase">ID: {product.id?.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-lg font-bold text-stone-600 text-xs whitespace-nowrap">
                            {product.category || "Uncategorized"}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-black text-[#6e4b31]">₹{product.price?.toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${
                            product.stock > 10 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 
                            product.stock > 0 ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                            'bg-red-50 border-red-100 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              product.stock > 10 ? 'bg-emerald-500' : product.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                            }`}></span>
                            {product.stock > 0 ? `${product.stock} Units` : "Sold Out"}
                          </span>
                        </td>
                        <td className="p-4">
                          {product.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                              <Star size={10} /> Featured
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditModal(product)} className="p-2 text-stone-400 hover:text-[#6e4b31] hover:bg-[#6e4b31]/10 rounded-lg transition-all" title="Edit"><Edit size={16} /></button>
                          <button onClick={() => openPreviewModal(product)} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Preview"><Eye size={16} /></button>
                          <button onClick={() => setDeleteModal({ isOpen: true, productId: product.id })} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        @media (min-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d6d3d1; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #a8a29e; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 24px); }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down { animation: slide-down 0.2s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}