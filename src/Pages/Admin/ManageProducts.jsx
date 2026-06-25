import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Trash2, Edit2, X, Save, Eye, Package, FolderTree, ChevronRight } from "lucide-react";

export default function ManageProducts() {
  const [activeTab, setActiveTab] = useState("products"); // 'products' or 'categories'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Side Drawer States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState("view"); // 'view' or 'edit'
  const [drawerType, setDrawerType] = useState("product"); // 'product' or 'category'
  
  // Active Item States
  const [activeItem, setActiveItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  // 1. Fetch Both Products and Categories from Firebase
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Products
      const prodSnap = await getDocs(collection(db, "products"));
      setProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Fetch Categories
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Delete Handler for Both
  const handleDelete = async (id, type) => {
    const collectionName = type === "product" ? "products" : "categories";
    if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    try {
      await deleteDoc(doc(db, collectionName, id));
      fetchData(); // Refresh UI
    } catch (err) {
      console.error(err);
      alert("Delete operation failed.");
    }
  };

  // 3. Open Side Drawer logic
  const openDrawer = (item, type, mode) => {
    setActiveItem(item);
    setDrawerType(type);
    setDrawerMode(mode);
    
    if (mode === "edit") {
      if (type === "product") {
        setEditForm({
          name: item.name || "",
          price: item.price || "",
          category: item.category || "",
          parentMenu: item.parentMenu || "",
          stock: item.stock || "",
          description: item.description || ""
        });
      } else {
        setEditForm({
          name: item.name || "",
          menu: item.menu || ""
        });
      }
    }
    setIsDrawerOpen(true);
  };

  // 4. Update Document Handler
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (drawerType === "product") {
        await updateDoc(doc(db, "products", activeItem.id), {
          name: editForm.name,
          price: Number(editForm.price),
          category: editForm.category,
          stock: Number(editForm.stock),
          description: editForm.description
        });
      } else {
        await updateDoc(doc(db, "categories", activeItem.id), {
          name: editForm.name,
          menu: editForm.menu
        });
      }
      
      setIsDrawerOpen(false);
      setActiveItem(null);
      fetchData();
      alert(`✅ ${drawerType === "product" ? "Product" : "Category"} Updated Successfully!`);
    } catch (err) {
      console.error(err);
      alert("Update operation failed.");
    }
  };

  // ================= MAIN UI RENDER =================
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[80vh] w-full">
      
      {/* 🌟 LUXURY HEADER & TABS */}
      <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-4 sm:mb-6 tracking-wide">
          Command Center
        </h2>
        
        {/* Made tabs stack on mobile, inline on larger screens */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <button 
            onClick={() => setActiveTab("products")}
            className={`flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer w-full sm:w-auto ${activeTab === "products" ? "bg-[#6e4b31] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
          >
            <Package size={18}/> Manage Products
          </button>
          <button 
            onClick={() => setActiveTab("categories")}
            className={`flex justify-center items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer w-full sm:w-auto ${activeTab === "categories" ? "bg-[#6e4b31] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
          >
            <FolderTree size={18}/> Manage Categories
          </button>
        </div>
      </div>

      {/* 🌟 CONTENT TABLES */}
      {/* Added fully responsive table container */}
      <div className="p-4 sm:p-6 overflow-hidden">
        <div className="w-full overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="text-center py-20 text-[#6e4b31] font-mono animate-pulse">Syncing Database...</div>
          ) : (
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  {activeTab === "products" ? (
                    <>
                      <th className="p-4 pb-6 whitespace-nowrap">Product Details</th>
                      <th className="p-4 pb-6 whitespace-nowrap">Price</th>
                      <th className="p-4 pb-6 whitespace-nowrap">Placement Node</th>
                      <th className="p-4 pb-6 whitespace-nowrap">Stock</th>
                      <th className="p-4 pb-6 text-right whitespace-nowrap">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="p-4 pb-6 whitespace-nowrap">Category Name</th>
                      <th className="p-4 pb-6 whitespace-nowrap">Mapped Main Menu</th>
                      <th className="p-4 pb-6 whitespace-nowrap">System ID</th>
                      <th className="p-4 pb-6 text-right whitespace-nowrap">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50 text-gray-700">
                
                {/* --- PRODUCTS RENDER --- */}
                {activeTab === "products" && products.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="p-4 flex items-center gap-4 min-w-[250px]">
                      <img src={item.image} className="w-12 h-12 shrink-0 object-cover rounded-xl border border-gray-100 shadow-xs" alt="" />
                      <span className="font-semibold text-gray-800 line-clamp-2 max-w-[200px]">{item.name}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-gray-900 whitespace-nowrap">₹{item.price?.toLocaleString('en-IN')}</td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[10px] font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-md w-max uppercase tracking-wider">
                        {item.parentMenu} <ChevronRight size={10}/> {item.category}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-600 whitespace-nowrap">{item.stock} Units</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2 md:gap-3 opacity-100 md:opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDrawer(item, "product", "view")} className="p-2 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105"><Eye size={16}/></button>
                        <button onClick={() => openDrawer(item, "product", "edit")} className="p-2 text-blue-500 hover:text-white hover:bg-blue-500 bg-white border border-blue-100 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id, "product")} className="p-2 text-red-500 hover:text-white hover:bg-red-500 bg-white border border-red-100 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* --- CATEGORIES RENDER --- */}
                {activeTab === "categories" && categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4 whitespace-nowrap">
                      <span className="font-bold text-gray-800 text-base">{cat.name}</span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-xs bg-blue-50 border border-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                        {cat.menu}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-400 whitespace-nowrap">{cat.id}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2 md:gap-3 opacity-100 md:opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDrawer(cat, "category", "view")} className="p-2 text-gray-400 hover:text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105"><Eye size={16}/></button>
                        <button onClick={() => openDrawer(cat, "category", "edit")} className="p-2 text-blue-500 hover:text-white hover:bg-blue-500 bg-white border border-blue-100 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(cat.id, "category")} className="p-2 text-red-500 hover:text-white hover:bg-red-500 bg-white border border-red-100 rounded-lg shadow-sm cursor-pointer transition-all hover:scale-105"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 LUXURY SIDE DRAWER */}
      {/* ========================================================================= */}
      
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Fully responsive drawer (full width on mobile, 500px on desktop) */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-[90vw] md:w-[500px] bg-white z-[9999] shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900 uppercase tracking-widest">
              {drawerMode === "view" ? "Review Details" : "Edit Details"}
            </h3>
            <p className="text-[10px] sm:text-xs font-mono text-gray-400 mt-1 uppercase">Target: {drawerType}</p>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 rounded-full shadow-sm cursor-pointer transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scrollbar-thin">
          
          {/* ----- REVIEW MODE UI ----- */}
          {drawerMode === "view" && activeItem && (
            <div className="space-y-6">
              {drawerType === "product" && (
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                  <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-3xl overflow-hidden shadow-lg border border-gray-100 mb-4 sm:mb-6">
                    <img src={activeItem.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">{activeItem.name}</h4>
                  <p className="text-xl sm:text-2xl font-serif font-bold text-[#6e4b31] mt-2">₹{activeItem.price?.toLocaleString('en-IN')}</p>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100 space-y-4">
                {drawerType === "product" ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3 gap-1">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Category Node</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-800">{activeItem.parentMenu} ➔ {activeItem.category}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3 gap-1">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Current Stock</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-600">{activeItem.stock} Units</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3 gap-1">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Created Timestamp</span>
                      <span className="text-xs sm:text-sm font-mono text-gray-600">{new Date(activeItem.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase block mb-2">Description</span>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-white p-3 sm:p-4 rounded-xl border border-gray-100 break-words">{activeItem.description}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3 gap-1">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Category Name</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-800">{activeItem.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3 gap-1">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Mapped Main Menu</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-800">{activeItem.menu}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase">Database ID</span>
                      <span className="text-[10px] sm:text-xs font-mono text-gray-400 break-all">{activeItem.id}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ----- EDIT MODE FORM ----- */}
          {drawerMode === "edit" && activeItem && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4 sm:space-y-6">
              
              {drawerType === "product" ? (
                <>
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1.5 sm:mb-2 tracking-wider">PRODUCT NAME</label>
                    <input type="text" required className="w-full text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  </div>

                  {/* Responsive grid: stacks on smallest screens, side-by-side on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1.5 sm:mb-2 tracking-wider">PRICE (INR)</label>
                      <input type="number" required className="w-full text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1.5 sm:mb-2 tracking-wider">STOCK UNITS</label>
                      <input type="number" required className="w-full text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: e.target.value})} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1.5 sm:mb-2 tracking-wider">ASSIGNED CATEGORY</label>
                    <select required className="w-full text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-[#6e4b31] transition-colors" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})}>
                      <option value="">Select Category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name} — [{cat.menu}]</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1.5 sm:mb-2 tracking-wider">DESCRIPTION</label>
                    <textarea rows="4" required className="w-full text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1.5 sm:mb-2 tracking-wider">CATEGORY NAME</label>
                    <input type="text" required className="w-full text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-[#6e4b31] bg-gray-50 focus:bg-white transition-colors" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-bold text-gray-500 block mb-1.5 sm:mb-2 tracking-wider">MAPPED MAIN MENU</label>
                    <select required className="w-full text-sm px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-[#6e4b31] transition-colors" value={editForm.menu} onChange={(e) => setEditForm({...editForm, menu: e.target.value})}>
                      <option value="HOME">HOME</option>
                      <option value="ALL HANDICRAFT">ALL HANDICRAFT</option>
                      <option value="COLLECTION">COLLECTION</option>
                      <option value="DESIGN">DESIGN</option>
                      <option value="CRAFT">CRAFT</option>
                      <option value="SALE">SALE</option>
                    </select>
                  </div>
                </>
              )}

            </form>
          )}

        </div>

        {/* Drawer Footer / Actions */}
        {drawerMode === "edit" && (
          <div className="p-4 sm:p-6 border-t border-gray-100 bg-white shrink-0">
            <button 
              onClick={handleUpdateSubmit} 
              className="w-full bg-[#1a1a1a] hover:bg-black text-white py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-black/10 hover:shadow-black/20"
            >
              <Save size={18}/> Commit Database Changes
            </button>
          </div>
        )}
      </div>

    </div>
  );
}