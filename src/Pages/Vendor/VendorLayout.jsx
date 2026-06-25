import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { 
  LayoutDashboard, Package, PlusCircle, LogOut, 
  Menu, Bell, Search, X, User, ShoppingBag, Heart, CheckCircle, Wallet
} from "lucide-react";

export default function VendorLayout() {
  const { logout, profile, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // 🚀 REAL-TIME NOTIFICATIONS FETCH
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "notifications"), where("vendorId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  // Click outside to close notifications
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/vendor-login");
  };

  const markAsRead = async (notifId) => {
    try {
      await updateDoc(doc(db, "notifications", notifId), { read: true });
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const markAllAsRead = () => {
    notifications.forEach(n => {
      if (!n.read) markAsRead(n.id);
    });
  };

  const navLinks = [
    { name: "Dashboard", path: "/vendor/dashboard", icon: LayoutDashboard },
    { name: "My Products", path: "/vendor/products", icon: Package },
    { name: "Orders", path: "/vendor/orders", icon: ShoppingBag },
    { name: "Wallet & Payouts", path: "/vendor/wallet", icon: Wallet },
    { name: "Add Product", path: "/vendor/add-product", icon: PlusCircle },
  ];

  const getNotifIcon = (type) => {
    if (type === "order") return <ShoppingBag size={16} className="text-blue-500" />;
    if (type === "wishlist") return <Heart size={16} className="text-red-500" />;
    if (type === "review") return <CheckCircle size={16} className="text-emerald-500" />;
    return <Bell size={16} className="text-amber-500" />;
  };

  return (
    <div className="flex h-screen bg-[#faf9f8] overflow-hidden font-sans">
      
      {/* 🟢 PREMIUM SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-[60] w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        
        <div className="p-6 border-b border-gray-50 flex items-center justify-between shrink-0">
          <div className="overflow-hidden pr-2">
            <h2 className="text-xl font-serif font-bold text-[#3b2416] truncate">
              {profile?.storeName || "My Store"}
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5 tracking-wider uppercase">Seller Panel</p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-xl">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Global Vendor Search */}
        <div className="p-4 shrink-0">
          <div className="flex items-center bg-gray-50 px-3.5 py-2.5 rounded-xl border border-gray-100 focus-within:border-[#6e4b31]/30 focus-within:bg-white focus-within:shadow-sm transition-all">
            <Search size={18} className="text-gray-400 mr-2 shrink-0" />
            <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all ${
                  isActive 
                  ? "bg-[#3b2416] text-white shadow-md shadow-[#3b2416]/20" 
                  : "text-gray-600 hover:bg-[#3b2416]/5 hover:text-[#3b2416]"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} /> {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50 shrink-0 bg-gray-50/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shrink-0 shadow-sm">
              {profile?.image ? <img src={profile.image} alt="Profile" className="w-full h-full object-cover" /> : <User size={20} />}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{profile?.name || "Vendor User"}</p>
              <p className="text-xs text-gray-500 truncate">Manage Account</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* 🟢 MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        
        {/* Top Navbar for Mobile + Notifications */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <Menu size={20} />
            </button>
            <span className="font-serif font-bold text-[#3b2416] text-lg truncate max-w-[150px]">{profile?.storeName || "My Store"}</span>
          </div>
          
          {/* Empty div for desktop alignment */}
          <div className="hidden md:block"></div>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-gray-500 hover:text-[#3b2416] hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-[#3b2416] font-medium hover:underline">Mark all as read</button>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                      <Bell size={32} className="text-gray-300 mb-2" />
                      <p className="text-sm">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markAsRead(notif.id)}
                          className={`p-4 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.read ? 'bg-orange-50/30' : ''}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!notif.read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                            {getNotifIcon(notif.type)}
                          </div>
                          <div>
                            <p className={`text-sm ${!notif.read ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{notif.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                            </p>
                          </div>
                          {!notif.read && <div className="w-2 h-2 bg-[#3b2416] rounded-full shrink-0 mt-1.5 ml-auto"></div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <Outlet /> 
        </div>
      </main>

      <style>{`
        .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}