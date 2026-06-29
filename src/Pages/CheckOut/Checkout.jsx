
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { db } from "../../firebase/firebase";
// import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore"; 
// import { useCart } from "../../context/CartContext";
// import { useCurrency } from "../../context/CurrencyContext";
// import { useAuth } from "../../context/AuthContext";
// import { CreditCard, Wallet, ShieldCheck, Lock, ChevronRight, QrCode, X, PartyPopper, AlertCircle, MapPin, Plus, Check, Home, Briefcase, Trash2 } from "lucide-react";

// export default function Checkout() {
//   const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart();
//   const { formatPrice } = useCurrency();
//   const { user } = useAuth(); 
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState("cod"); 
  
//   const [selectedItemIds, setSelectedItemIds] = useState([]);
//   const [hasInitialized, setHasInitialized] = useState(false);

//   // UI States
//   const [showQRModal, setShowQRModal] = useState(false);
//   const [orderSuccess, setOrderSuccess] = useState(false); 
//   const [errorMessage, setErrorMessage] = useState("");
//   const [savedAddresses, setSavedAddresses] = useState([]);
//   const [selectedAddressId, setSelectedAddressId] = useState(null);
//   const [showAddNewAddress, setShowAddNewAddress] = useState(false);
//   const [addressType, setAddressType] = useState("home"); 

//   const [formData, setFormData] = useState({
//     firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
//   });

//   const merchantUpiId = "your_upi_id@okhdfc"; 
//   const merchantName = "Yarniverse";

//   // 🚀 SMART SELECT LOGIC: Sirf aakhiri (newest) item ko hi default select karega
//   useEffect(() => {
//     if (!hasInitialized && cartItems.length > 0) {
//       // Sirf sabse latest item ka ID nikalenge
//       const latestItem = cartItems[cartItems.length - 1];
//       setSelectedItemIds([latestItem.id]); // Purane auto-select all ko hata diya
//       setHasInitialized(true);
//     }
//   }, [cartItems, hasInitialized]);

//   const handleToggleItem = (id) => {
//     setSelectedItemIds(prev => 
//       prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
//     );
//   };

//   const checkoutItems = cartItems.filter(item => selectedItemIds.includes(item.id));
  
//   const subTotal = checkoutItems.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
//   const shipping = subTotal > 1000 || subTotal === 0 ? 0 : 50; 
//   const totalAmount = subTotal + shipping;

//   useEffect(() => {
//     const fetchSavedAddresses = async () => {
//       if (user?.uid) {
//         const userRef = doc(db, "users", user.uid);
//         const userSnap = await getDoc(userRef);
//         if (userSnap.exists()) {
//           const userData = userSnap.data();
//           if (userData.savedAddresses && userData.savedAddresses.length > 0) {
//             setSavedAddresses(userData.savedAddresses);
//             const defaultAddr = userData.savedAddresses.find(addr => addr.isDefault);
//             if (defaultAddr) {
//               setSelectedAddressId(defaultAddr.id);
//               setFormData(defaultAddr.data);
//             }
//           }
//           if (user?.email) {
//             setFormData(prev => ({ ...prev, email: user.email }));
//           }
//         }
//       }
//     };
//     fetchSavedAddresses();
//   }, [user]);

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const showError = (msg) => {
//     setErrorMessage(msg);
//     setTimeout(() => setErrorMessage(""), 3500);
//   };

//   const handleSelectAddress = (address) => {
//     setSelectedAddressId(address.id);
//     setFormData(address.data);
//     setShowAddNewAddress(false);
//   };

//   const handleSaveNewAddress = async () => {
//     if (formData.firstName.trim().length < 2) return showError("Invalid Name!");
//     if (!/^[0-9]{10}$/.test(formData.phone)) return showError("Invalid Phone!");
//     if (formData.address.trim().length < 10) return showError("Incomplete Address!");
    
//     const newAddress = { id: Date.now().toString(), type: addressType, isDefault: savedAddresses.length === 0, data: { ...formData } };
//     const updatedAddresses = [...savedAddresses, newAddress];
//     setSavedAddresses(updatedAddresses);
//     setSelectedAddressId(newAddress.id);
//     setShowAddNewAddress(false);

//     if (user?.uid) await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
//   };

//   const handleDeleteAddress = async (addressId) => {
//     const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
//     setSavedAddresses(updatedAddresses);
//     if (selectedAddressId === addressId) {
//       setSelectedAddressId(null);
//       setFormData({ firstName: "", lastName: "", email: user?.email || "", phone: "", address: "", city: "", state: "", pincode: "" });
//     }
//     if (user?.uid) await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
//   };

//   const handleSetDefault = async (addressId) => {
//     const updatedAddresses = savedAddresses.map(addr => ({ ...addr, isDefault: addr.id === addressId }));
//     setSavedAddresses(updatedAddresses);
//     if (user?.uid) await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
//   };

//   const handleCheckoutClick = (e) => {
//     e.preventDefault();
//     if (cartItems.length === 0) return showError("Your cart is empty.");
//     if (checkoutItems.length === 0) return showError("Please select at least one item to proceed.");
//     if (!user?.uid) return showError("Please login to place an order.");
//     if (formData.firstName.trim().length < 2) return showError("Invalid Name!");
//     if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) return showError("Invalid Pincode!");

//     if (paymentMethod === "online") setShowQRModal(true);
//     else finalizeOrder("Pending");
//   };

//   const finalizeOrder = async (paymentStatusStr) => {
//     setLoading(true);
//     setShowQRModal(false); 

//     try {
//       if (!selectedAddressId && user?.uid) {
//         const newAddress = { id: Date.now().toString(), type: addressType, isDefault: savedAddresses.length === 0, data: { ...formData } };
//         const updatedAddresses = [...savedAddresses, newAddress];
//         await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
//       }

//       const groupedOrders = checkoutItems.reduce((acc, item) => {
//         const vId = item.vendorId || (item.product && item.product.vendorId) || "admin";
//         const storeName = item.storeName || (item.product && item.product.storeName) || "Yarniverse Official";
//         if (!acc[vId]) acc[vId] = { vendorId: vId, storeName: storeName, items: [], subTotal: 0 };
//         acc[vId].items.push(item);
//         acc[vId].subTotal += (Number(item.price) * (item.quantity || 1));
//         return acc;
//       }, {});

//       const orderPromises = Object.values(groupedOrders).map(async (vendorOrder) => {
//         const vendorShipping = vendorOrder.subTotal > 1000 ? 0 : 50; 
//         const vendorTotalAmount = vendorOrder.subTotal + vendorShipping;

//         const orderData = {
//           vendorId: vendorOrder.vendorId, storeName: vendorOrder.storeName, customerInfo: formData, items: vendorOrder.items,               
//           subTotal: vendorOrder.subTotal, shippingFee: vendorShipping, totalAmount: vendorTotalAmount,
//           paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (UPI)",
//           paymentStatus: paymentStatusStr, status: "Pending", orderDate: serverTimestamp(),
//           createdAt: Date.now(), userId: user.uid, customerName: formData.firstName + " " + formData.lastName 
//         };

//         const docRef = await addDoc(collection(db, "orders"), orderData);
//         if (vendorOrder.vendorId !== "admin") {
//           await addDoc(collection(db, "notifications"), {
//             vendorId: vendorOrder.vendorId, type: "order", message: `New order from ${formData.firstName}`, read: false, orderId: docRef.id, createdAt: Date.now()
//           });
//         }
//         return docRef;
//       });

//       await Promise.all(orderPromises);
      
//       checkoutItems.forEach(item => removeFromCart(item.id));
//       setOrderSuccess(true);

//     } catch (error) {
//       console.error(error);
//       showError("Something went wrong with the server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAddressIcon = (type) => {
//     switch(type) { case "home": return <Home size={16} />; case "work": return <Briefcase size={16} />; default: return <MapPin size={16} />; }
//   };

//   const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR`;
//   const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

//   if (cartItems.length === 0 && !orderSuccess) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc]">
//         <svg className="w-24 h-24 text-gray-300 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>
//         <h2 className="text-2xl font-serif text-[#3b2416] mb-4">Your bag is empty</h2>
//         <button onClick={() => navigate("/")} className="px-8 py-3 bg-[#3b2416] text-white rounded-xl font-medium">Continue Shopping</button>
//       </div>
//     );
//   }

//  return (
//     <div className="min-h-screen bg-[#faf9f8] font-sans py-6 sm:py-12 px-3 sm:px-6 lg:px-8 selection:bg-[#3b2416] selection:text-white">
      
//       {/* Modals & Toasts */}
//       {errorMessage && (
//         <div className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[999999] flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-slide-down w-[95%] sm:w-[90%] max-w-md">
//           <AlertCircle size={20} className="shrink-0" />
//           <span className="font-medium text-xs sm:text-sm leading-tight">{errorMessage}</span>
//           <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
//         </div>
//       )}

//       {orderSuccess && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center transform transition-all animate-bounce-short mx-4">
//             <div className="w-20 sm:w-24 h-20 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-green-100">
//               <PartyPopper size={32} className="sm:w-10 sm:h-10 text-green-500" />
//             </div>
//             <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3b2416] mb-2 sm:mb-3">Congratulations!</h2>
//             <p className="text-gray-500 mb-6 sm:mb-8 font-medium text-sm sm:text-base">Thank you, {formData.firstName}! Your order has been placed successfully and is being processed.</p>
//             <div className="flex flex-col gap-2 sm:gap-3">
//               <button onClick={() => navigate("/my-orders")} className="w-full bg-[#3b2416] text-white py-3 sm:py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-[#2c1a10] transition-all cursor-pointer">Track My Order</button>
//               <button onClick={() => navigate("/")} className="w-full bg-white text-gray-700 py-3 sm:py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer">Continue Shopping</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showQRModal && (
//         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-bounce-short">
//             <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
//               <h3 className="font-bold text-gray-900 flex items-center gap-2"><QrCode size={18} className="text-[#3b2416]" /> Scan to Pay</h3>
//               <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><X size={20} /></button>
//             </div>
//             <div className="p-6 sm:p-8 flex flex-col items-center text-center">
//               <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm mb-4"><img src={qrCodeUrl} alt="UPI" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" /></div>
//               <p className="text-sm text-gray-500 mb-1">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
//               <p className="text-xl sm:text-2xl font-serif font-bold text-[#3b2416] mb-4 sm:mb-6">₹{totalAmount.toLocaleString('en-IN')}</p>
//               <button onClick={() => finalizeOrder("Verification Pending")} className="w-full bg-[#3b2416] text-white py-3 sm:py-3.5 rounded-xl font-medium tracking-widest uppercase text-xs hover:bg-[#2c1a10] active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer">
//                 I have completed the payment <ChevronRight size={14} />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-6xl mx-auto">
//         <div className="text-center mb-8 sm:mb-12">
//           <h1 className="text-2xl sm:text-3xl font-serif text-[#3b2416] tracking-wide mb-2">Secure Checkout</h1>
//           <p className="text-gray-500 text-xs sm:text-sm flex items-center justify-center gap-1"><Lock size={14} /> Encrypted & Secure</p>
//         </div>

//         <form onSubmit={handleCheckoutClick} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          
//           {/* LEFT COLUMN: ADDRESS & PAYMENT */}
//           <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8">
//             {savedAddresses.length > 0 && (
//               <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
//                 <div className="flex justify-between items-center mb-4 sm:mb-6">
//                   <h2 className="text-base sm:text-lg font-medium text-gray-900 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
//                     <MapPin size={18} className="text-[#3b2416]" /> Saved Addresses
//                   </h2>
//                   <button type="button" onClick={() => { setShowAddNewAddress(true); setSelectedAddressId(null); setFormData({ firstName: "", lastName: "", email: user?.email || "", phone: "", address: "", city: "", state: "", pincode: "" }); }} className="text-xs sm:text-sm text-[#3b2416] font-medium hover:underline flex items-center gap-1 cursor-pointer">
//                     <Plus size={16} /> Add New
//                   </button>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                   {savedAddresses.map((addr) => (
//                     <div key={addr.id} onClick={() => handleSelectAddress(addr)} className={`relative p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all group ${selectedAddressId === addr.id ? 'border-[#3b2416] bg-[#3b2416]/5 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
//                       {selectedAddressId === addr.id && (<div className="absolute top-2 right-2 w-5 h-5 bg-[#3b2416] rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>)}
//                       <div className="flex items-start gap-2 mb-2">
//                         <span className="text-[#3b2416] mt-0.5">{getAddressIcon(addr.type)}</span>
//                         <div className="flex-1 min-w-0">
//                           <p className="font-semibold text-gray-900 text-sm truncate">{addr.data.firstName} {addr.data.lastName}</p>
//                           <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{addr.data.address}, {addr.data.city}, {addr.data.state} - {addr.data.pincode}</p>
//                           <p className="text-xs text-gray-400 mt-1">{addr.data.phone}</p>
//                         </div>
//                       </div>
//                       <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
//                         {!addr.isDefault && ( <button type="button" onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }} className="text-xs text-[#3b2416] hover:underline">Set as Default</button> )}
//                         {addr.isDefault && ( <span className="text-xs text-green-600 font-medium">✓ Default</span> )}
//                         <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }} className="text-xs text-red-500 hover:underline ml-auto">Remove</button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {(showAddNewAddress || savedAddresses.length === 0) && (
//               <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
//                 <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6 uppercase tracking-wider text-xs sm:text-sm flex justify-between items-center">
//                   {savedAddresses.length === 0 ? 'Shipping Address' : 'New Address'}
//                 </h2>
//                 {showAddNewAddress && (
//                   <div className="flex gap-2 mb-5">
//                     {['home', 'work', 'other'].map((type) => (
//                       <button key={type} type="button" onClick={() => setAddressType(type)} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${addressType === type ? 'bg-[#3b2416] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
//                         {getAddressIcon(type)} <span className="capitalize hidden sm:inline">{type}</span>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
//                   <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">First Name *</label><input required value={formData.firstName} type="text" name="firstName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
//                   <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Last Name *</label><input required value={formData.lastName} type="text" name="lastName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
//                   <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Email Address *</label><input required value={formData.email} type="email" name="email" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
//                   <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Phone Number *</label><input required value={formData.phone} type="tel" name="phone" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
//                   <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Full Address *</label><textarea required value={formData.address} name="address" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31] min-h-[80px]" /></div>
//                   <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">City *</label><input required value={formData.city} type="text" name="city" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
//                   <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">State *</label><input required value={formData.state} type="text" name="state" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
//                   <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Pincode *</label><input required value={formData.pincode} type="text" name="pincode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
//                 </div>
//                 {showAddNewAddress && (
//                   <button type="button" onClick={handleSaveNewAddress} className="mt-4 sm:mt-6 w-full sm:w-auto px-6 py-3 bg-[#3b2416] text-white rounded-xl font-medium text-sm hover:bg-[#2c1a10] flex items-center justify-center gap-2"><Plus size={16} /> Save This Address</button>
//                 )}
//               </div>
//             )}

//             <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
//               <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2"><CreditCard size={18} className="text-[#3b2416]" /> Payment Method</h2>
//               <div className="flex flex-col gap-3">
//                 <label className={`flex items-center justify-between p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#3b2416] bg-[#3b2416]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
//                   <div className="flex items-center gap-3">
//                     <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#3b2416] border-gray-300 focus:ring-[#3b2416]" />
//                     <div><span className="font-medium text-gray-900 text-sm sm:text-base">Pay via UPI (QR Code)</span><p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Google Pay, PhonePe, Paytm</p></div>
//                   </div>
//                   <QrCode size={20} className={paymentMethod === 'online' ? 'text-[#3b2416]' : 'text-gray-400'} />
//                 </label>
//                 <label className={`flex items-center justify-between p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#3b2416] bg-[#3b2416]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
//                   <div className="flex items-center gap-3">
//                     <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#3b2416] border-gray-300 focus:ring-[#3b2416]" />
//                     <div><span className="font-medium text-gray-900 text-sm sm:text-base">Cash on Delivery</span><p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Pay when you receive</p></div>
//                   </div>
//                   <Wallet size={20} className={paymentMethod === 'cod' ? 'text-[#3b2416]' : 'text-gray-400'} />
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT COLUMN: ORDER SUMMARY */}
//           <div className="lg:col-span-5">
//             <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-4 sm:top-8">
//               <div className="flex justify-between items-center mb-4 sm:mb-6">
//                 <h2 className="text-base sm:text-lg font-medium text-gray-900 uppercase tracking-wider text-xs sm:text-sm">
//                   Order Summary
//                 </h2>
//                 <span className="text-xs text-gray-500">{checkoutItems.length} selected</span>
//               </div>
              
//               <div className="flex flex-col gap-4 mb-4 sm:mb-6 max-h-[300px] sm:max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
//                 {cartItems.map((item, idx) => {
//                   const isSelected = selectedItemIds.includes(item.id);
//                   return (
//                     <div key={item.id || idx} className={`flex items-center gap-3 sm:gap-4 transition-all duration-300 ${!isSelected ? 'opacity-40 grayscale-[50%]' : ''}`}>
                      
//                       <input 
//                         type="checkbox" 
//                         checked={isSelected}
//                         onChange={() => handleToggleItem(item.id)}
//                         className="w-4 h-4 text-[#3b2416] border-gray-300 rounded focus:ring-[#3b2416] cursor-pointer accent-[#3b2416]"
//                       />

//                       <div className="relative flex-shrink-0">
//                         <img 
//                           src={item.image} 
//                           alt={item.name} 
//                           className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-lg bg-gray-50 border border-gray-100" 
//                         />
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.name}</p>
//                         <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-0.5">{item.category}</p>
                        
//                         <div className="flex items-center gap-3 mt-1.5">
//                           <div className="flex items-center bg-gray-50 border border-gray-200 rounded text-xs font-medium">
//                             <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 text-gray-500 hover:text-black">-</button>
//                             <span className="px-1 text-gray-900">{item.quantity || 1}</span>
//                             <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="px-2 py-0.5 text-gray-500 hover:text-black">+</button>
//                           </div>
//                           <button type="button" onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
//                             <Trash2 size={13} />
//                           </button>
//                         </div>
//                       </div>

//                       <span className="font-semibold text-gray-900 text-sm flex-shrink-0 self-start mt-1">
//                         {formatPrice(Number(item.price) * (item.quantity || 1))}
//                       </span>
//                     </div>
//                   )
//                 })}
//               </div>

//               <div className="border-t border-gray-100 pt-3 sm:pt-4 pb-3 sm:pb-4 flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span className="font-medium text-gray-900">{formatPrice(subTotal)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Shipping</span>
//                   <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
//                     {shipping === 0 ? "Free" : formatPrice(shipping)}
//                   </span>
//                 </div>
//               </div>

//               <div className="border-t border-gray-100 pt-3 sm:pt-4 flex justify-between items-center mb-6 sm:mb-8">
//                 <span className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide">Total</span>
//                 <span className="text-xl sm:text-2xl font-serif text-[#3b2416]">₹{totalAmount.toLocaleString('en-IN')}</span>
//               </div>

//               <button 
//                 type="submit" 
//                 disabled={loading || checkoutItems.length === 0}
//                 className="w-full bg-[#3b2416] text-white py-3 sm:py-4 rounded-xl font-medium tracking-widest uppercase text-xs sm:text-sm hover:bg-[#2c1a10] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer shadow-md"
//               >
//                 {loading ? "Processing..." : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
//                 {!loading && <ChevronRight size={16} />}
//               </button>

//               <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-400">
//                 <ShieldCheck size={14} /> <span>Information is encrypted and secure</span>
//               </div>
//             </div>
//           </div>

//         </form>
//       </div>

//       <style>{`
//         @keyframes bounce-short { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
//         @keyframes slide-down { 0% { transform: translate(-50%, -100%); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
//         .animate-bounce-short { animation: bounce-short 0.3s ease-out forwards; }
//         .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
//         .custom-scrollbar::-webkit-scrollbar { width: 4px; }
//         .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 2px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb { background: #c4a484; border-radius: 2px; }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6e4b31; }
//         .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
//         @media (max-width: 640px) { .sticky { position: relative; top: 0; } }
//       `}</style>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore"; 
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";
import { CreditCard, Wallet, ShieldCheck, Lock, ChevronRight, QrCode, X, PartyPopper, AlertCircle, MapPin, Plus, Check, Home, Briefcase, Trash2 } from "lucide-react";

export default function Checkout() {
  const { cartItems, clearCart, updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth(); 
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod"); 
  
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // UI States
  const [showQRModal, setShowQRModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false); 
  const [errorMessage, setErrorMessage] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddNewAddress, setShowAddNewAddress] = useState(false);
  const [addressType, setAddressType] = useState("home"); 

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
  });

  const merchantUpiId = "your_upi_id@okhdfc"; 
  const merchantName = "Yarniverse";

  // Smart Select Logic
  useEffect(() => {
    if (!hasInitialized && cartItems.length > 0) {
      const latestItem = cartItems[cartItems.length - 1];
      setSelectedItemIds([latestItem.id]); 
      setHasInitialized(true);
    }
  }, [cartItems, hasInitialized]);

  const handleToggleItem = (id) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const checkoutItems = cartItems.filter(item => selectedItemIds.includes(item.id));
  
  const subTotal = checkoutItems.reduce((total, item) => total + (Number(item.price) * (item.quantity || 1)), 0);
  const shipping = subTotal > 1000 || subTotal === 0 ? 0 : 50; 
  const totalAmount = subTotal + shipping;

  useEffect(() => {
    const fetchSavedAddresses = async () => {
      if (user?.uid) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.savedAddresses && userData.savedAddresses.length > 0) {
            setSavedAddresses(userData.savedAddresses);
            const defaultAddr = userData.savedAddresses.find(addr => addr.isDefault);
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setFormData(defaultAddr.data);
            }
          }
          if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
          }
        }
      }
    };
    fetchSavedAddresses();
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(""), 3500);
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    setFormData(address.data);
    setShowAddNewAddress(false);
  };

  const handleSaveNewAddress = async () => {
    if (formData.firstName.trim().length < 2) return showError("Invalid Name!");
    if (!/^[0-9]{10}$/.test(formData.phone)) return showError("Invalid Phone!");
    if (formData.address.trim().length < 10) return showError("Incomplete Address!");
    
    const newAddress = { id: Date.now().toString(), type: addressType, isDefault: savedAddresses.length === 0, data: { ...formData } };
    const updatedAddresses = [...savedAddresses, newAddress];
    setSavedAddresses(updatedAddresses);
    setSelectedAddressId(newAddress.id);
    setShowAddNewAddress(false);

    if (user?.uid) await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
  };

  const handleDeleteAddress = async (addressId) => {
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
    setSavedAddresses(updatedAddresses);
    if (selectedAddressId === addressId) {
      setSelectedAddressId(null);
      setFormData({ firstName: "", lastName: "", email: user?.email || "", phone: "", address: "", city: "", state: "", pincode: "" });
    }
    if (user?.uid) await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
  };

  const handleSetDefault = async (addressId) => {
    const updatedAddresses = savedAddresses.map(addr => ({ ...addr, isDefault: addr.id === addressId }));
    setSavedAddresses(updatedAddresses);
    if (user?.uid) await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
  };

  const handleCheckoutClick = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return showError("Your cart is empty.");
    if (checkoutItems.length === 0) return showError("Please select at least one item to proceed.");
    if (!user?.uid) return showError("Please login to place an order.");
    if (formData.firstName.trim().length < 2) return showError("Invalid Name!");
    if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) return showError("Invalid Pincode!");

    if (paymentMethod === "online") setShowQRModal(true);
    else finalizeOrder("Pending");
  };

  const finalizeOrder = async (paymentStatusStr) => {
    setLoading(true);
    setShowQRModal(false); 

    try {
      if (!selectedAddressId && user?.uid) {
        const newAddress = { id: Date.now().toString(), type: addressType, isDefault: savedAddresses.length === 0, data: { ...formData } };
        const updatedAddresses = [...savedAddresses, newAddress];
        await setDoc(doc(db, "users", user.uid), { savedAddresses: updatedAddresses }, { merge: true });
      }

      const groupedOrders = checkoutItems.reduce((acc, item) => {
        const vId = item.vendorId || (item.product && item.product.vendorId) || "admin";
        const storeName = item.storeName || (item.product && item.product.storeName) || "Yarniverse Official";
        if (!acc[vId]) acc[vId] = { vendorId: vId, storeName: storeName, items: [], subTotal: 0 };
        acc[vId].items.push(item);
        acc[vId].subTotal += (Number(item.price) * (item.quantity || 1));
        return acc;
      }, {});

      const orderPromises = Object.values(groupedOrders).map(async (vendorOrder) => {
        const vendorShipping = vendorOrder.subTotal > 1000 ? 0 : 50; 
        const vendorTotalAmount = vendorOrder.subTotal + vendorShipping;

        const orderData = {
          vendorId: vendorOrder.vendorId, storeName: vendorOrder.storeName, customerInfo: formData, items: vendorOrder.items,               
          subTotal: vendorOrder.subTotal, shippingFee: vendorShipping, totalAmount: vendorTotalAmount,
          paymentMethod: paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (UPI)",
          paymentStatus: paymentStatusStr, status: "Pending", orderDate: serverTimestamp(),
          createdAt: Date.now(), userId: user.uid, customerName: formData.firstName + " " + formData.lastName 
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);
        if (vendorOrder.vendorId !== "admin") {
          await addDoc(collection(db, "notifications"), {
            vendorId: vendorOrder.vendorId, type: "order", message: `New order from ${formData.firstName}`, read: false, orderId: docRef.id, createdAt: Date.now()
          });
        }
        return docRef;
      });

      await Promise.all(orderPromises);
      
      checkoutItems.forEach(item => removeFromCart(item.id));
      setOrderSuccess(true);

    } catch (error) {
      console.error(error);
      showError("Something went wrong with the server.");
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (type) => {
    switch(type) { case "home": return <Home size={16} />; case "work": return <Briefcase size={16} />; default: return <MapPin size={16} />; }
  };

  const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfcfc]">
        <svg className="w-24 h-24 text-gray-300 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" /></svg>
        <h2 className="text-2xl font-serif text-[#3b2416] mb-4">Your bag is empty</h2>
        <button onClick={() => navigate("/")} className="px-8 py-3 bg-[#3b2416] text-white rounded-xl font-medium">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f8] font-sans py-6 sm:py-12 px-3 sm:px-6 lg:px-8 selection:bg-[#3b2416] selection:text-white">
      
      {/* Modals & Toasts */}
      {errorMessage && (
        <div className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-[999999] flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-slide-down w-[95%] sm:w-[90%] max-w-md">
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-medium text-xs sm:text-sm leading-tight">{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
        </div>
      )}

      {orderSuccess && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 text-center transform transition-all animate-bounce-short mx-4">
            <div className="w-20 sm:w-24 h-20 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 border-green-100">
              <PartyPopper size={32} className="sm:w-10 sm:h-10 text-green-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3b2416] mb-2 sm:mb-3">Congratulations!</h2>
            <p className="text-gray-500 mb-6 sm:mb-8 font-medium text-sm sm:text-base">Thank you, {formData.firstName}! Your order has been placed successfully and is being processed.</p>
            <div className="flex flex-col gap-2 sm:gap-3">
              <button onClick={() => navigate("/my-orders")} className="w-full bg-[#3b2416] text-white py-3 sm:py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-[#2c1a10] transition-all cursor-pointer">Track My Order</button>
              <button onClick={() => navigate("/")} className="w-full bg-white text-gray-700 py-3 sm:py-4 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer">Continue Shopping</button>
            </div>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all animate-bounce-short">
            <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><QrCode size={18} className="text-[#3b2416]" /> Scan to Pay</h3>
              <button onClick={() => setShowQRModal(false)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><X size={20} /></button>
            </div>
            <div className="p-6 sm:p-8 flex flex-col items-center text-center">
              <div className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm mb-4"><img src={qrCodeUrl} alt="UPI" className="w-40 h-40 sm:w-48 sm:h-48 object-contain" /></div>
              <p className="text-sm text-gray-500 mb-1">Scan with any UPI App (GPay, PhonePe, Paytm)</p>
              <p className="text-xl sm:text-2xl font-serif font-bold text-[#3b2416] mb-4 sm:mb-6">₹{totalAmount.toLocaleString('en-IN')}</p>
              <button onClick={() => finalizeOrder("Verification Pending")} className="w-full bg-[#3b2416] text-white py-3 sm:py-3.5 rounded-xl font-medium tracking-widest uppercase text-xs hover:bg-[#2c1a10] active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer">
                I have completed the payment <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-serif text-[#3b2416] tracking-wide mb-2">Secure Checkout</h1>
          <p className="text-gray-500 text-xs sm:text-sm flex items-center justify-center gap-1"><Lock size={14} /> Encrypted & Secure</p>
        </div>

        <form onSubmit={handleCheckoutClick} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
          
          {/* LEFT COLUMN: ADDRESS & PAYMENT */}
          <div className="lg:col-span-7 flex flex-col gap-6 sm:gap-8">
            {savedAddresses.length > 0 && (
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg font-medium text-gray-900 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2">
                    <MapPin size={18} className="text-[#3b2416]" /> Saved Addresses
                  </h2>
                  <button type="button" onClick={() => { setShowAddNewAddress(true); setSelectedAddressId(null); setFormData({ firstName: "", lastName: "", email: user?.email || "", phone: "", address: "", city: "", state: "", pincode: "" }); }} className="text-xs sm:text-sm text-[#3b2416] font-medium hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus size={16} /> Add New
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} onClick={() => handleSelectAddress(addr)} className={`relative p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all group ${selectedAddressId === addr.id ? 'border-[#3b2416] bg-[#3b2416]/5 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}>
                      {selectedAddressId === addr.id && (<div className="absolute top-2 right-2 w-5 h-5 bg-[#3b2416] rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>)}
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-[#3b2416] mt-0.5">{getAddressIcon(addr.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{addr.data.firstName} {addr.data.lastName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{addr.data.address}, {addr.data.city}, {addr.data.state} - {addr.data.pincode}</p>
                          <p className="text-xs text-gray-400 mt-1">{addr.data.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!addr.isDefault && ( <button type="button" onClick={(e) => { e.stopPropagation(); handleSetDefault(addr.id); }} className="text-xs text-[#3b2416] hover:underline">Set as Default</button> )}
                        {addr.isDefault && ( <span className="text-xs text-green-600 font-medium">✓ Default</span> )}
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }} className="text-xs text-red-500 hover:underline ml-auto">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(showAddNewAddress || savedAddresses.length === 0) && (
              <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6 uppercase tracking-wider text-xs sm:text-sm flex justify-between items-center">
                  {savedAddresses.length === 0 ? 'Shipping Address' : 'New Address'}
                </h2>
                {showAddNewAddress && (
                  <div className="flex gap-2 mb-5">
                    {['home', 'work', 'other'].map((type) => (
                      <button key={type} type="button" onClick={() => setAddressType(type)} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${addressType === type ? 'bg-[#3b2416] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {getAddressIcon(type)} <span className="capitalize hidden sm:inline">{type}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">First Name *</label><input required value={formData.firstName} type="text" name="firstName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
                  <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Last Name *</label><input required value={formData.lastName} type="text" name="lastName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
                  <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Email Address *</label><input required value={formData.email} type="email" name="email" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
                  <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Phone Number *</label><input required value={formData.phone} type="tel" name="phone" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
                  <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Full Address *</label><textarea required value={formData.address} name="address" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31] min-h-[80px]" /></div>
                  <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">City *</label><input required value={formData.city} type="text" name="city" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
                  <div className="flex flex-col gap-1 sm:gap-1.5"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">State *</label><input required value={formData.state} type="text" name="state" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
                  <div className="flex flex-col gap-1 sm:gap-1.5 sm:col-span-2"><label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">Pincode *</label><input required value={formData.pincode} type="text" name="pincode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-100 p-3 sm:p-3.5 rounded-xl text-sm focus:ring-[#6e4b31]" /></div>
                </div>
                {showAddNewAddress && (
                  <button type="button" onClick={handleSaveNewAddress} className="mt-4 sm:mt-6 w-full sm:w-auto px-6 py-3 bg-[#3b2416] text-white rounded-xl font-medium text-sm hover:bg-[#2c1a10] flex items-center justify-center gap-2"><Plus size={16} /> Save This Address</button>
                )}
              </div>
            )}

            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6 uppercase tracking-wider text-xs sm:text-sm flex items-center gap-2"><CreditCard size={18} className="text-[#3b2416]" /> Payment Method</h2>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center justify-between p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#3b2416] bg-[#3b2416]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#3b2416] border-gray-300 focus:ring-[#3b2416]" />
                    <div><span className="font-medium text-gray-900 text-sm sm:text-base">Pay via UPI (QR Code)</span><p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Google Pay, PhonePe, Paytm</p></div>
                  </div>
                  <QrCode size={20} className={paymentMethod === 'online' ? 'text-[#3b2416]' : 'text-gray-400'} />
                </label>
                <label className={`flex items-center justify-between p-3 sm:p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#3b2416] bg-[#3b2416]/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={(e) => setPaymentMethod(e.target.value)} className="w-4 h-4 text-[#3b2416] border-gray-300 focus:ring-[#3b2416]" />
                    <div><span className="font-medium text-gray-900 text-sm sm:text-base">Cash on Delivery</span><p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Pay when you receive</p></div>
                  </div>
                  <Wallet size={20} className={paymentMethod === 'cod' ? 'text-[#3b2416]' : 'text-gray-400'} />
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-4 sm:top-8">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 uppercase tracking-wider text-xs sm:text-sm">
                  Order Summary
                </h2>
                <span className="text-xs text-gray-500">{checkoutItems.length} selected</span>
              </div>
              
              {/* 🚀 FIX: Iski height max-h-[380px] kardi hai aur items ke beech se faltu gap (padding/margin) kam kardi hai */}
              <div className="flex flex-col gap-0 mb-4 sm:mb-6 max-h-[380px] sm:max-h-[450px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                {cartItems.map((item, idx) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  return (
                    <div key={item.id || idx} className={`flex items-start sm:items-center gap-2.5 sm:gap-4 py-3 sm:py-3 border-b border-gray-50 last:border-0 transition-all duration-300 ${!isSelected ? 'opacity-40 grayscale-[50%]' : ''}`}>
                      
                      <div className="pt-1 sm:pt-0">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleItem(item.id)}
                          className="w-4 h-4 text-[#3b2416] border-gray-300 rounded focus:ring-[#3b2416] cursor-pointer accent-[#3b2416]"
                        />
                      </div>

                      <div className="relative flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-14 h-16 sm:w-16 sm:h-20 object-cover rounded-lg bg-gray-50 border border-gray-100" 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-[13px] sm:text-sm line-clamp-1 leading-tight">{item.name}</p>
                        <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">{item.category}</p>
                        
                        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded text-xs font-medium">
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 text-gray-500 hover:text-black">-</button>
                            <span className="px-1 text-gray-900 w-4 text-center">{item.quantity || 1}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} className="px-2 py-0.5 text-gray-500 hover:text-black">+</button>
                          </div>
                          <button type="button" onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <span className="font-semibold text-gray-900 text-sm flex-shrink-0 self-start mt-0.5 sm:mt-1">
                        {formatPrice(Number(item.price) * (item.quantity || 1))}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 sm:pt-4 pb-3 sm:pb-4 flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 sm:pt-4 flex justify-between items-center mb-6 sm:mb-8">
                <span className="text-sm sm:text-base font-bold text-gray-900 uppercase tracking-wide">Total</span>
                <span className="text-xl sm:text-2xl font-serif text-[#3b2416]">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <button 
                type="submit" 
                disabled={loading || checkoutItems.length === 0}
                className="w-full bg-[#3b2416] text-white py-3 sm:py-4 rounded-xl font-medium tracking-widest uppercase text-xs sm:text-sm hover:bg-[#2c1a10] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? "Processing..." : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                {!loading && <ChevronRight size={16} />}
              </button>

              <div className="mt-4 sm:mt-5 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-400">
                <ShieldCheck size={14} /> <span>Information is encrypted and secure</span>
              </div>
            </div>
          </div>

        </form>
      </div>

      <style>{`
        @keyframes bounce-short { 0% { transform: scale(0.9); opacity: 0; } 50% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes slide-down { 0% { transform: translate(-50%, -100%); opacity: 0; } 100% { transform: translate(-50%, 0); opacity: 1; } }
        .animate-bounce-short { animation: bounce-short 0.3s ease-out forwards; }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c4a484; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6e4b31; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        @media (max-width: 640px) { .sticky { position: relative; top: 0; } }
      `}</style>
    </div>
  );
}