// import React from "react";
// import { useAuth } from "../../context/AuthContext";
// import { IndianRupee, Package, ShoppingBag, TrendingUp, Star, Clock, ArrowUpRight, CheckCircle2 } from "lucide-react";
// import { Link } from "react-router-dom";

// export default function VendorDashboard() {
//   const { profile } = useAuth();

//   // Premium Dashboard ke liye Stats Data
//   const stats = [
//     {
//       title: "Total Revenue",
//       value: "₹45,230",
//       trend: "+12.5%",
//       isPositive: true,
//       icon: IndianRupee,
//       color: "bg-gradient-to-br from-[#6e4b31] to-[#8a6244] text-white", // Signature dark theme
//       iconBg: "bg-white/20",
//     },
//     {
//       title: "Active Orders",
//       value: "12",
//       trend: "3 Pending",
//       isPositive: true,
//       icon: ShoppingBag,
//       color: "bg-white text-gray-900",
//       iconBg: "bg-amber-50 text-amber-600",
//     },
//     {
//       title: "Total Products",
//       value: "48",
//       trend: "+2 this week",
//       isPositive: true,
//       icon: Package,
//       color: "bg-white text-gray-900",
//       iconBg: "bg-blue-50 text-blue-600",
//     },
//     {
//       title: "Store Rating",
//       value: "4.8",
//       trend: "Based on 32 reviews",
//       isPositive: true,
//       icon: Star,
//       color: "bg-white text-gray-900",
//       iconBg: "bg-emerald-50 text-emerald-600",
//     }
//   ];

//   // Dummy Recent Orders for Luxury UI
//   const recentOrders = [
//     { id: "#ORD-8901", product: "Vintage Woolen Scarf", customer: "Aarav M.", amount: "₹1,299", status: "Pending", time: "2 hours ago" },
//     { id: "#ORD-8900", product: "Handcrafted Ceramic Mug", customer: "Priya S.", amount: "₹850", status: "Shipped", time: "5 hours ago" },
//     { id: "#ORD-8899", product: "Knitted Baby Sweater", customer: "Neha K.", amount: "₹2,100", status: "Delivered", time: "1 day ago" },
//   ];

//   return (
//     <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      
//       {/* 👑 HEADER SECTION */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
//             Welcome back, {profile?.name?.split(" ")[0] || "Seller"}
//           </h1>
//           <p className="text-gray-500 mt-1 flex items-center gap-2">
//             <StoreIcon size={16} className="text-[#6e4b31]" />
//             {profile?.storeName || "Your Premium Store"} Overview
//           </p>
//         </div>
//         <Link 
//           to="/vendor/add-product"
//           className="bg-[#6e4b31] hover:bg-[#5a3d28] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#6e4b31]/20 w-fit"
//         >
//           <PlusIcon size={18} /> New Listing
//         </Link>
//       </div>

//       {/* 📊 PREMIUM STATS GRID */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div 
//               key={index} 
//               className={`${stat.color} p-6 rounded-2xl border ${stat.color.includes('bg-white') ? 'border-gray-100 shadow-sm' : 'border-transparent shadow-md'} relative overflow-hidden group`}
//             >
//               <div className="flex justify-between items-start mb-4 relative z-10">
//                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
//                   <Icon size={24} />
//                 </div>
//                 <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${stat.color.includes('bg-white') ? 'bg-gray-50 text-gray-600' : 'bg-white/20 text-white'}`}>
//                   {stat.trend}
//                 </span>
//               </div>
//               <div className="relative z-10">
//                 <h3 className={`text-sm font-bold mb-1 ${stat.color.includes('bg-white') ? 'text-gray-500' : 'text-white/80'}`}>
//                   {stat.title}
//                 </h3>
//                 <p className="text-3xl font-black tracking-tight">{stat.value}</p>
//               </div>
//               {/* Luxury Background Glow */}
//               <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
//             </div>
//           );
//         })}
//       </div>

//       {/* 🛍️ LOWER SECTION (Split Grid) */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
//         {/* Left Col: Recent Orders (Takes 2/3 space) */}
//         <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
//             <h2 className="text-lg font-bold text-gray-900 font-serif">Recent Orders</h2>
//             <button className="text-[#6e4b31] text-sm font-bold flex items-center gap-1 hover:underline">
//               View All <ArrowUpRight size={16} />
//             </button>
//           </div>
//           <div className="divide-y divide-gray-50">
//             {recentOrders.map((order, i) => (
//               <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
//                     <Package size={20} />
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-gray-900">{order.product}</h4>
//                     <p className="text-sm text-gray-500 mt-0.5">{order.id} • {order.customer}</p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="font-bold text-gray-900">{order.amount}</p>
//                   <div className="flex items-center justify-end gap-1.5 mt-1">
//                     {order.status === "Pending" && <Clock size={14} className="text-amber-500" />}
//                     {order.status === "Shipped" && <TrendingUp size={14} className="text-blue-500" />}
//                     {order.status === "Delivered" && <CheckCircle2 size={14} className="text-emerald-500" />}
//                     <span className={`text-xs font-bold ${
//                       order.status === 'Pending' ? 'text-amber-600' : 
//                       order.status === 'Shipped' ? 'text-blue-600' : 'text-emerald-600'
//                     }`}>
//                       {order.status}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right Col: Quick Actions / Store Health (Takes 1/3 space) */}
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
//           <h2 className="text-lg font-bold text-gray-900 font-serif mb-6">Store Health</h2>
          
//           <div className="space-y-6">
//             <div>
//               <div className="flex justify-between text-sm mb-2">
//                 <span className="font-bold text-gray-600">Profile Completion</span>
//                 <span className="font-bold text-[#6e4b31]">80%</span>
//               </div>
//               <div className="w-full bg-gray-100 rounded-full h-2">
//                 <div className="bg-[#6e4b31] h-2 rounded-full w-[80%]"></div>
//               </div>
//             </div>

//             <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
//               <h4 className="font-bold text-amber-800 text-sm mb-1">Attention Required</h4>
//               <p className="text-amber-700 text-xs">You have 3 orders that need to be shipped today to maintain your seller rating.</p>
//             </div>

//             <button className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-bold hover:border-[#6e4b31] hover:text-[#6e4b31] transition-colors flex items-center justify-center gap-2">
//               <PlusIcon size={18} /> Create Discount Coupon
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// // Chhote helper icons jo specific styling ke liye use kiye hain
// function StoreIcon(props) {
//   return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
// }

// function PlusIcon(props) {
//   return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>;
// }
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { IndianRupee, Package, ShoppingBag, Star, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function VendorDashboard() {
  const { user, profile } = useAuth();
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // 🚀 REAL-TIME REVIEW STATES
  const [avgRating, setAvgRating] = useState("0.0");
  const [totalReviews, setTotalReviews] = useState(0);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch Products Count
    const fetchProductsCount = async () => {
      const q = query(collection(db, "products"), where("vendorId", "==", user.uid));
      const snap = await getDocs(q);
      setTotalProducts(snap.docs.length);
    };
    fetchProductsCount();

    // 2. Real-time Orders & Revenue
    const ordersQuery = query(collection(db, "orders"), where("vendorId", "==", user.uid));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      let revenue = 0;
      let active = 0;
      let allOrders = [];

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        allOrders.push({ id: doc.id, ...data });
        if (data.status === "Delivered" || data.status === "Shipped") {
          revenue += Number(data.totalAmount || data.total || 0);
        }
        if (!data.status || data.status === "Pending" || data.status === "Processing") {
          active += 1;
        }
      });

      setTotalRevenue(revenue);
      setActiveOrdersCount(active);
      allOrders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRecentOrders(allOrders.slice(0, 4));
      setLoading(false);
    });

    // 3. 🚀 REAL-TIME REVIEWS LISTENER
    const reviewsQuery = query(collection(db, "reviews"), where("vendorId", "==", user.uid));
    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      if (snapshot.empty) {
        setAvgRating("New");
        setTotalReviews(0);
        return;
      }
      
      let sum = 0;
      snapshot.docs.forEach(doc => { sum += Number(doc.data().rating || 0); });
      const avg = (sum / snapshot.docs.length).toFixed(1);
      
      setAvgRating(avg);
      setTotalReviews(snapshot.docs.length);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeReviews();
    };
  }, [user]);

  const stats = [
    { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, trend: "Real-time", icon: IndianRupee, color: "bg-gradient-to-br from-[#3b2416] to-[#5a3d28] text-white", iconBg: "bg-white/20" },
    { title: "Active Orders", value: activeOrdersCount.toString(), trend: "Needs Action", icon: ShoppingBag, color: "bg-white text-gray-900", iconBg: "bg-amber-50 text-amber-600" },
    { title: "Total Products", value: totalProducts.toString(), trend: "Live Inventory", icon: Package, color: "bg-white text-gray-900", iconBg: "bg-blue-50 text-blue-600" },
    { title: "Store Rating", value: avgRating, trend: totalReviews > 0 ? `${totalReviews} reviews` : "No reviews yet", icon: Star, color: "bg-white text-gray-900", iconBg: "bg-emerald-50 text-emerald-600" }
  ];

  if (loading) return <div className="p-20 text-center text-[#3b2416] font-bold animate-pulse">Syncing Store Data...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            Welcome back, {profile?.storeName || "Vendor"}
          </p>
        </div>
        <Link to="/vendor/add-product" className="bg-[#3b2416] hover:bg-[#2c1a10] text-white px-6 py-2.5 rounded-xl font-medium tracking-wide text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#3b2416]/20">
          <PlusIcon size={18} /> New Listing
        </Link>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.color} p-6 rounded-2xl border ${stat.color.includes('bg-white') ? 'border-gray-100 shadow-sm hover:shadow-md' : 'border-transparent shadow-lg'} transition-all relative overflow-hidden group`}>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}><Icon size={24} /></div>
                <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${stat.color.includes('bg-white') ? 'bg-gray-50 text-gray-600' : 'bg-white/20 text-white'}`}>{stat.trend}</span>
              </div>
              <div className="relative z-10">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${stat.color.includes('bg-white') ? 'text-gray-500' : 'text-white/80'}`}>{stat.title}</h3>
                <p className="text-2xl sm:text-3xl font-serif font-bold">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-lg font-bold text-gray-900 font-serif">Live Orders Feed</h2>
          <Link to="/vendor/orders" className="text-[#3b2416] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">View All <ArrowUpRight size={14} /></Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No recent orders yet.</div>
          ) : (
            recentOrders.map((order, i) => (
              <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-orange-50/10 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100 shrink-0"><Package size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{order.items?.[0]?.name || "Products"}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{order.id.slice(0,8)} • {order.customerName || "Customer"}</p>
                  </div>
                </div>
                <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                  <p className="font-bold text-[#3b2416]">₹{order.totalAmount?.toLocaleString('en-IN') || "0"}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mt-1 border ${
                    !order.status || order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    order.status === 'Processing' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                    order.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PlusIcon(props) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>; }