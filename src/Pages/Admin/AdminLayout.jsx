
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, PlusCircle, Edit, Users, LogOut, Landmark, Package, CreditCard,Store, Menu, X 
} from "lucide-react";

export default function AdminLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  
  // Mobile Sidebar Toggle State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Sidebar band karne ka function (mobile ke liye)
  const closeSidebar = () => setIsSidebarOpen(false);

  // Sidebar Menu Array
  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/admin/add-product", label: "Add Product", icon: <PlusCircle size={18} /> },
    { path: "/admin/manage-products", label: "Manage Products", icon: <Edit size={18} /> },
    { path: "/admin/manage-orders", label: "Manage Orders", icon: <Package size={18} /> },
    { path: "/admin/manage-users", label: "Manage Users & Vendor", icon: <Users size={18} /> },
    { path: "/admin/payments", label: "Payments", icon: <CreditCard size={18} /> },
    {path:"/admin/vendor-approvals", label: "Vendor approvals", icon: <Store size={18}/>},
     {path: "/admin/payouts", label: "Payout Requests",  icon: <Landmark size={18}/> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* MOBILE OVERLAY (Dark background jab sidebar open ho) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        ></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#6e4b31] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#593c26] flex justify-between items-center shrink-0">
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-wider">YARNIVERSE</h1>
              <p className="text-xs text-green-300 font-mono mt-1">👑 ADMIN CORE</p>
            </div>
            {/* Close Button for Mobile Sidebar */}
            <button 
              className="md:hidden text-gray-300 hover:text-white transition-colors" 
              onClick={closeSidebar}
            >
              <X size={24} />
            </button>
          </div>

          {/* Links Area (Scrollable agar zyada links ho jaye) */}
          <nav className="p-4 flex flex-col gap-2 overflow-y-auto flex-1 custom-scrollbar">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar} // Link click karne par mobile sidebar band ho jayega
                className={({ isActive }) => `flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? "bg-[#593c26] text-white shadow-inner" : "text-gray-200 hover:bg-[#593c26]/50"
                }`}
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* PROFILE & LOGOUT SECTION */}
        <div className="p-4 border-t border-[#593c26] bg-[#593c26]/30 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white text-[#6e4b31] flex items-center justify-center font-bold">
              {profile?.email?.[0].toUpperCase() || "A"}
            </div>
            <div className="truncate w-40">
              <p className="text-xs font-bold truncate">{profile?.email}</p>
              <p className="text-[10px] text-gray-300">System Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* MOBILE TOP-BAR (Sirf choti screen par dikhega) */}
        <div className="md:hidden flex items-center justify-between bg-[#6e4b31] p-4 text-white shadow-md z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-1 hover:bg-[#593c26] rounded-md transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-serif font-bold">YARNIVERSE</h1>
          </div>
        </div>

        {/* DYNAMIC CONTENT SWITCHER (Outlet) */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          {/* pb-20 is added for mobile devices so content doesn't get hidden behind bottom edges */}
          <div className="max-w-7xl w-full mx-auto pb-20 md:pb-0">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
}