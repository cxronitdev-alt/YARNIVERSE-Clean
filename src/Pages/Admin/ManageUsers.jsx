import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 🌟 ADDED FOR NAVIGATION
import { db } from "../../firebase/firebase"; 
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { 
  Search, Eye, Mail, Ban, CheckCircle, Phone, ShoppingBag, 
  AlertTriangle, X, Store, Package, TrendingUp, ShieldCheck, ExternalLink, ChevronRight
} from "lucide-react";

export default function ManageUsers() {
  const navigate = useNavigate(); // 🌟 INITIALIZE NAVIGATE

  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Toggles & Filters
  const [activeTab, setActiveTab] = useState("CUSTOMERS"); // "CUSTOMERS" or "VENDORS"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); 
  const [viewUser, setViewUser] = useState(null);

  // Modals & Notifications
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState({ visible: false, user: null, newStatus: null });
  const [vendorProductsModal, setVendorProductsModal] = useState({ visible: false, vendorName: "", products: [] });

  // --- TOAST HELPER ---
  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 3000);
  };

  // --- REAL-TIME DATA FETCHING ---
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
      setLoading(false);
    }, () => showToast("Warning: Could not fetch users.", "error"));

    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orderList);
    });

    const unsubscribeProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  // --- DATA PROCESSING: CUSTOMERS VS VENDORS ---
  
  const customersList = users
    .filter(u => u.role !== "vendor")
    .map(user => {
      const userOrders = orders.filter(o => o.userId === user.id || (o.customerInfo && o.customerInfo.email === user.email));
      const totalSpent = userOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
      return { ...user, totalOrders: userOrders.length, totalSpent, isVIP: userOrders.length >= 3 || totalSpent >= 5000, type: 'customer' };
    });

  const vendorsList = users
    .filter(u => u.role === "vendor")
    .map(vendor => {
      const vendorProducts = products.filter(p => p.vendorId === vendor.id);
      const vendorOrders = orders.filter(o => o.vendorId === vendor.id); 
      const totalRevenue = vendorOrders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
      return { 
        ...vendor, 
        totalListedProducts: vendorProducts.length, 
        productsList: vendorProducts, 
        totalSales: vendorOrders.length, 
        totalRevenue, 
        type: 'vendor' 
      };
    });

  const activeData = activeTab === "CUSTOMERS" ? customersList : vendorsList;

  // --- METRICS CALCULATION ---
  const totalCount = activeData.length;
  const activeCount = activeData.filter(u => !(u.isBanned ?? false)).length;
  const blockedCount = activeData.filter(u => (u.isBanned ?? false)).length;
  const vipCustomers = customersList.filter(u => u.isVIP && !(u.isBanned ?? false)).length;
  const totalProductsListed = vendorsList.reduce((sum, v) => sum + v.totalListedProducts, 0);

  // --- FILTERING & SEARCH ---
  const filteredRecords = activeData.filter(record => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (record.name || "").toLowerCase().includes(query) || 
                          (record.email || "").toLowerCase().includes(query) ||
                          (record.phone || "").toLowerCase().includes(query);
    
    let matchesStatus = true;
    if (statusFilter === "ACTIVE") matchesStatus = !(record.isBanned ?? false);
    if (statusFilter === "BLOCKED") matchesStatus = (record.isBanned ?? false);
    if (statusFilter === "VIP" && activeTab === "CUSTOMERS") matchesStatus = record.isVIP && !(record.isBanned ?? false);

    return matchesSearch && matchesStatus;
  });

  // --- ACTIONS ---
  const handleToggleBanClick = (user) => {
    setConfirmModal({ visible: true, user, newStatus: !(user.isBanned ?? false) });
  };

  const confirmToggleBan = async () => {
    const { user, newStatus } = confirmModal;
    setConfirmModal({ visible: false, user: null, newStatus: null });

    try {
      await updateDoc(doc(db, "users", user.id), { isBanned: newStatus });
      if (viewUser && viewUser.id === user.id) setViewUser({...viewUser, isBanned: newStatus});
      showToast(`${user.name || user.email} has been ${newStatus ? 'blocked' : 'unblocked'} successfully.`, "success");
    } catch (error) {
      showToast("Action failed: " + error.message, "error");
    }
  };

  const openVendorProducts = (vendor) => {
    if (vendor.type === 'vendor') {
      setVendorProductsModal({
        visible: true,
        vendorName: vendor.name || "Vendor",
        products: vendor.productsList || []
      });
    }
  };

  // 🌟 NEW: FUNCTION TO NAVIGATE TO PRODUCT DETAILS PAGE
  const handleProductClick = (productId) => {
    // Replace '/product/' with whatever route your app uses for product details
    navigate(`/product/${productId}`); 
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : "U";

  // Helper to extract product image correctly
  const getProductImage = (product) => {
    if (product.imageUrl) return product.imageUrl;
    if (product.image) return product.image;
    if (product.images && product.images.length > 0) return product.images[0];
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-4 md:p-8 font-sans w-full max-w-[100vw] overflow-x-hidden space-y-8 text-gray-900 selection:bg-amber-100">
      
      {/* 🌟 LUXURY HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black mb-2 uppercase">User Management</h1>
          <p className="text-sm font-medium text-gray-500 tracking-wide flex items-center gap-2">
            <span>ADMIN DASHBOARD</span> <span className="w-1 h-1 rounded-full bg-amber-500"></span> <span>{activeTab}</span>
          </p>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner w-full md:w-auto">
          <button 
            onClick={() => { setActiveTab("CUSTOMERS"); setStatusFilter("ALL"); }}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "CUSTOMERS" ? "bg-black text-white shadow-lg" : "text-gray-500 hover:text-black"}`}
          >
            <ShoppingBag size={14} /> Customers
          </button>
          <button 
            onClick={() => { setActiveTab("VENDORS"); setStatusFilter("ALL"); }}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === "VENDORS" ? "bg-black text-white shadow-lg" : "text-gray-500 hover:text-black"}`}
          >
            <Store size={14} /> Vendors
          </button>
        </div>
      </div>

      {/* 🌟 PREMIUM METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={64}/></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total {activeTab}</p>
          <h3 className="text-5xl font-black text-black">{totalCount}</h3>
        </div>
        
        {activeTab === "CUSTOMERS" ? (
          <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">VIP Members</p>
              <h3 className="text-5xl font-black text-amber-500">{vipCustomers}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active</p>
              <h3 className="text-5xl font-black text-black">{activeCount}</h3>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Products</p>
              <h3 className="text-5xl font-black text-amber-500">{totalProductsListed}</h3>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Vendors</p>
              <h3 className="text-5xl font-black text-black">{activeCount}</h3>
            </div>
          </>
        )}

        <div className="bg-black p-6 rounded-3xl shadow-xl border border-gray-800 text-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Blocked / Restricted</p>
          <h3 className="text-5xl font-black text-red-500">{blockedCount}</h3>
        </div>
      </div>

      {/* 🌟 FILTER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar">
          {["ALL", "ACTIVE", "BLOCKED", ...(activeTab === "CUSTOMERS" ? ["VIP"] : [])].map(filter => (
            <button 
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap ${statusFilter === filter ? "bg-amber-100 text-amber-800" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 text-sm font-semibold text-black rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 border border-transparent transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* 🌟 DATA TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="w-full overflow-x-auto">
          {loading ? (
            <div className="py-32 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
              Loading Directory...
            </div>
          ) : (
            <table className="w-full min-w-[1000px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Profile</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact</th>
                  {activeTab === "CUSTOMERS" ? (
                    <>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Spent</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Products Listed</th>
                      <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Revenue</th>
                    </>
                  )}
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => {
                    const isBanned = record.isBanned ?? false;
                    const displayName = record.name || "Unknown";
                    
                    return (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {getInitials(displayName)}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{displayName}</p>
                              <p className="text-xs font-medium text-gray-500">{record.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-600">{record.phone || "Not Provided"}</span>
                        </td>
                        
                        {/* Dynamic Columns based on Tab */}
                        {activeTab === "CUSTOMERS" ? (
                          <>
                            <td className="px-6 py-4"><span className="text-sm font-black text-black">{record.totalOrders}</span></td>
                            <td className="px-6 py-4"><span className="text-sm font-black text-amber-600">₹{record.totalSpent.toLocaleString()}</span></td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4"><span className="text-sm font-black text-black">{record.totalListedProducts}</span></td>
                            <td className="px-6 py-4"><span className="text-sm font-black text-amber-600">₹{record.totalRevenue.toLocaleString()}</span></td>
                          </>
                        )}

                        <td className="px-6 py-4">
                          {isBanned ? (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Blocked</span>
                          ) : (record.isVIP && activeTab === "CUSTOMERS") ? (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">VIP Member</span>
                          ) : (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setViewUser(record)} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="View Profile">
                              <Eye size={18} />
                            </button>
                            <a href={`mailto:${record.email}`} className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors" title="Email User">
                              <Mail size={18} />
                            </a>
                            <button onClick={() => handleToggleBanClick(record)} className={`p-2 rounded-lg transition-colors ${isBanned ? "text-green-500 hover:bg-green-50" : "text-red-400 hover:text-red-600 hover:bg-red-50"}`} title={isBanned ? "Unblock" : "Block"}>
                              {isBanned ? <CheckCircle size={18} /> : <Ban size={18} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                      No {activeTab} Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🌟 VIEW PROFILE MODAL */}
      {/* ========================================================================= */}
      {viewUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 transition-opacity">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <div className="h-32 w-full bg-black relative">
              <button onClick={() => setViewUser(null)} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-md transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="px-8 pb-8 relative">
              <div className="w-24 h-24 rounded-2xl bg-amber-500 flex items-center justify-center text-white font-black text-4xl shadow-xl border-4 border-white absolute -top-12 left-8">
                {getInitials(viewUser.name)}
              </div>
              
              <div className="flex justify-end pt-4">
                 {viewUser.isBanned ? (
                    <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Blocked</span>
                  ) : (
                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Active Status</span>
                  )}
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">{viewUser.type === 'vendor' ? 'Registered Vendor' : 'Customer Profile'}</p>
                <h2 className="text-3xl font-black text-black">{viewUser.name || "Unknown"}</h2>
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                    <Mail size={16} className="text-gray-400"/> {viewUser.email}
                  </div>
                  {viewUser.phone && (
                    <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                      <Phone size={16} className="text-gray-400"/> {viewUser.phone}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div 
                  className={`bg-gray-50 p-5 rounded-2xl border border-gray-100 relative group ${viewUser.type === 'vendor' ? 'cursor-pointer hover:bg-amber-50 hover:border-amber-200 transition-all' : ''}`}
                  onClick={() => openVendorProducts(viewUser)}
                  title={viewUser.type === 'vendor' ? 'Click to view product details' : ''}
                >
                  {viewUser.type === 'vendor' && (
                    <ExternalLink size={14} className="absolute top-4 right-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                  )}
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    {viewUser.type === 'vendor' ? <Package size={16}/> : <ShoppingBag size={16}/>}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {viewUser.type === 'vendor' ? 'Products' : 'Total Orders'}
                    </span>
                  </div>
                  <p className={`text-3xl font-black ${viewUser.type === 'vendor' ? 'group-hover:text-amber-600 transition-colors' : 'text-black'}`}>
                    {viewUser.type === 'vendor' ? viewUser.totalListedProducts : viewUser.totalOrders}
                  </p>
                  {viewUser.type === 'vendor' && (
                     <p className="text-[9px] font-bold text-amber-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">View Details →</p>
                  )}
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <TrendingUp size={16}/>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {viewUser.type === 'vendor' ? 'Revenue' : 'Amount Spent'}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-amber-600 truncate">
                    ₹{viewUser.type === 'vendor' ? viewUser.totalRevenue?.toLocaleString() : viewUser.totalSpent?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <button onClick={() => handleToggleBanClick(viewUser)} className={`flex items-center justify-center w-full gap-2 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${viewUser.isBanned ? "bg-black text-white hover:bg-gray-800" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
                  {viewUser.isBanned ? <CheckCircle size={16} /> : <Ban size={16} />}
                  {viewUser.isBanned ? `Unblock ${viewUser.type}` : `Restrict ${viewUser.type}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 VENDOR PRODUCTS DETAIL MODAL (CLICKABLE WITH IMAGES) */}
      {/* ========================================================================= */}
      {vendorProductsModal.visible && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 md:p-6 transition-opacity">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black">{vendorProductsModal.vendorName}'s Directory</h3>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                    {vendorProductsModal.products.length} Products Listed
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setVendorProductsModal({ visible: false, vendorName: "", products: [] })} 
                className="bg-white hover:bg-gray-100 text-gray-900 p-2.5 rounded-full shadow-sm border border-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
              {vendorProductsModal.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendorProductsModal.products.map(product => {
                    const imgUrl = getProductImage(product);
                    
                    return (
                      <div 
                        key={product.id} 
                        onClick={() => handleProductClick(product.id)}
                        className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-5 hover:shadow-xl hover:border-amber-200 cursor-pointer transition-all duration-300 group relative"
                      >
                        {/* 🌟 View Details Hover Overlay Arrow */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all z-10">
                          <ChevronRight size={16} strokeWidth={3} />
                        </div>

                        {/* Product Image */}
                        <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-300 shrink-0 overflow-hidden relative">
                          {imgUrl ? (
                            <img src={imgUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <Package size={32} />
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex flex-col justify-center flex-1 overflow-hidden pr-8">
                          <h4 className="font-bold text-black text-base truncate group-hover:text-amber-600 transition-colors">{product.name || "Unnamed Product"}</h4>
                          <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {product.description || "No description provided by vendor."}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                              ₹{(Number(product.price) || 0).toLocaleString()}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${product.stock > 0 || product.quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              Stock: {product.stock || product.quantity || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                    <Package size={40} />
                  </div>
                  <h4 className="text-lg font-black text-black mb-1">No Products Found</h4>
                  <p className="text-sm font-medium text-gray-500">This vendor hasn't listed any products yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {confirmModal.visible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${confirmModal.newStatus ? 'bg-red-50 text-red-500' : 'bg-black text-white'}`}>
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-2xl font-black text-black mb-2">Confirm Action</h3>
            <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
              Are you sure you want to <strong className={confirmModal.newStatus ? "text-red-500" : "text-black"}>{confirmModal.newStatus ? "Restrict" : "Unblock"}</strong> <span>{confirmModal.user?.name || confirmModal.user?.email}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ visible: false, user: null, newStatus: null })} className="flex-1 bg-gray-100 hover:bg-gray-200 text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                Cancel
              </button>
              <button onClick={confirmToggleBan} className={`flex-1 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg ${confirmModal.newStatus ? "bg-red-500 hover:bg-red-600" : "bg-black hover:bg-gray-900"}`}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🌟 TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {toast.visible && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-[999999] animate-in slide-in-from-bottom-8 duration-300 ${toast.type === "error" ? "bg-red-600 text-white" : "bg-black text-white"}`}>
          {toast.type === "error" ? <AlertTriangle size={20} className="text-red-300" /> : <CheckCircle size={20} className="text-amber-400" />}
          <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          <button onClick={() => setToast({...toast, visible: false})} className="ml-4 text-gray-400 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}