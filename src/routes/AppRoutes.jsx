import { Routes, Route, Navigate } from "react-router-dom";

// ==========================================
// 🛡️ 1. IMPORT ROUTE GUARDS 
// ==========================================
import ProtectedRoute from "./ProtectedRoute.jsx"; 
import AdminRoute from "./AdminRoute.jsx";      
import VendorRoute from "./VendorRoute.jsx";   


// ==========================================
// 🌐 2. IMPORT ALL PUBLIC & BUYER PAGES
// ==========================================
import Home from "../Pages/Home/Home";
import Profile from "../Pages/Profile/ProfilePage";
import ProductPageTemplate from "../components/shared/ProductPageTemplate"; 
import MyOrders from "../Pages/Profile/MyOrders";
import SearchPage from "../Pages/SearchPage/SearchPage";
import Checkout from "../Pages/CheckOut/Checkout";
import ProductDetails from "../Pages/ProductDetails/ProductDetails"; // 👈 Ye page hum reuse karenge


// ==========================================
// 🏪 3. IMPORT VENDOR PAGES
// ==========================================
import VendorRegister from "../Pages/Vendor/VendorRegister";
import VendorLogin from "../Pages/Vendor/VendorLogin";
import VendorDashboard from "../Pages/Vendor/VendorDashboard";
import VendorProducts from "../Pages/Vendor/VendorProducts";
import AddProduct from "../Pages/Vendor/AddProduct"; 
import VendorLayout from "../Pages/Vendor/VendorLayout";
import VendorOrders from "../Pages/Vendor/VendorOrders";
import VendorPayouts from "../Pages/Vendor/VendorPayouts";

// ==========================================
// 👑 4. IMPORT ADMIN PAGES
// ==========================================
import AdminLayout from "../Pages/Admin/AdminLayout";
import Overview from "../Pages/Admin/Overview";
import VendorApprovals from "../Pages/Admin/VendorApprovals";
import ManageProducts from "../Pages/Admin/ManageProducts";
import ManageUsers from "../Pages/Admin/ManageUsers";
import ManageOrders from "../Pages/Admin/ManageOrders"; 
import AdminLogin from "../Pages/Admin/AdminLogin";
import Payments from "../Pages/Admin/Payments";
import AdminPayouts from "../Pages/Admin/AdminPayouts";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ------------------------------------------ */}
      {/* 🟢 PUBLIC PAGES (No Guard Needed)            */}
      {/* ------------------------------------------ */}
      <Route path="/" element={<Home />} />
      <Route path="/all-handcraft" element={<ProductPageTemplate pageTitle="ALL HANDICRAFT" allowedCategories={["Crochet", "Knitting"]} />} />
      <Route path="/collection" element={<ProductPageTemplate pageTitle="COLLECTION" allowedCategories={["Spring", "Summer"]} />} />
      <Route path="/design" element={<ProductPageTemplate pageTitle="DESIGN" allowedCategories={["Modern", "Luxury", "Accessories", "Bags", "Toys"]} />} />
      <Route path="/craft" element={<ProductPageTemplate pageTitle="CRAFT" allowedCategories={["Home Decor", "Wall Art"]} />} />
      <Route path="/sale" element={<ProductPageTemplate pageTitle="SALE" allowedCategories={["50% Off", "Flash Sale"]} />} />
      <Route path="/state" element={<ProductPageTemplate pageTitle="STATE" allowedCategories={["Rajasthan", "Gujarat", "Kashmir", "Kerala", "Punjab"]} />} />
      
      <Route path="/search" element={<SearchPage />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      
      <Route path="/vendor-register" element={<VendorRegister />} />
      <Route path="/vendor-login" element={<VendorLogin />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* ------------------------------------------ */}
      {/* 🛍️ CUSTOMER PROTECTED PAGES                  */}
      {/* ------------------------------------------ */}
      <Route path="/profile" element={ <ProtectedRoute><Profile /></ProtectedRoute> } />
      <Route path="/my-orders" element={ <ProtectedRoute><MyOrders /></ProtectedRoute> } />
      <Route path="/checkout" element={ <ProtectedRoute><Checkout /></ProtectedRoute> } />

      {/* ------------------------------------------ */}
      {/* 🏪 VENDOR PROTECTED PAGES                    */}
      {/* ------------------------------------------ */}

      {/* 🔥 FIX: Vendor jab product pe click karega toh ye wala route chalega aur ProductDetails page open hoga */}
      <Route path="/vendor/product/:id" element={ <VendorRoute><ProductDetails /></VendorRoute> } />

      <Route path="/vendor" element={ <VendorRoute><VendorLayout /></VendorRoute> }>
        
        {/* Default route: Agar koi sirf /vendor likhe toh dashboard pe jaye */}
        <Route index element={<Navigate to="/vendor/dashboard" replace />} />
        
        {/* Yeh teeno pages ab Layout (Sidebar) ke andar right side me khulenge */}
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="products" element={<VendorProducts />} />
        <Route path="add-product" element={<AddProduct />} />
        <Route path="wallet" element={<VendorPayouts />} />
        <Route path="orders" element={<VendorOrders />} />
      </Route>

      
      {/* ------------------------------------------ */}
      {/* 👑 ADMIN PROTECTED PAGES                     */}
      {/* ------------------------------------------ */}
      <Route path="/admin" element={ <AdminRoute><AdminLayout /></AdminRoute> }>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Overview />} />
        <Route path="vendor-approvals" element={<VendorApprovals />} />
        <Route path="payouts" element={<AdminPayouts />} />
        
        {/* 🚀 FIXED: Admin bhi ab product add kar payega */}
        <Route path="add-product" element={<AddProduct />} />
        
        <Route path="manage-products" element={<ManageProducts />} />
        <Route path="manage-users" element={<ManageUsers />} />
        <Route path="manage-orders" element={<ManageOrders />} />
        <Route path="payments" element={<Payments />} />
      </Route>

    </Routes>
  );
}