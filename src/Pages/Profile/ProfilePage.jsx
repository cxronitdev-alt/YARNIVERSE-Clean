// import { useState, useEffect } from "react";
// import { auth, db } from "../../firebase/firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { onAuthStateChanged, updateProfile } from "firebase/auth"; 
// import { Camera, User, Mail, CheckCircle, AlertCircle, Loader2, Package } from "lucide-react";
// import MyOrders from "./MyOrders"; // ✅ IMPORT KIYA

// export default function Profile() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [profileImage, setProfileImage] = useState("");
  
//   const [uploading, setUploading] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [status, setStatus] = useState({ type: "", msg: "" });

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         setCurrentUser(user);
//         setEmail(user.email);
//         const snap = await getDoc(doc(db, "users", user.uid));
//         if (snap.exists()) {
//           const data = snap.data();
//           setName(data.name || user.displayName || "");
//           setProfileImage(data.image || user.photoURL || "");
//         } else {
//           setName(user.displayName || "");
//           setProfileImage(user.photoURL || "");
//         }
//       }
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("file", file);
//       formData.append("upload_preset", "yarniverse_upload"); 
//       const response = await fetch("https://api.cloudinary.com/v1_1/dzus5lbch/image/upload", { method: "POST", body: formData });
//       const cloudData = await response.json();
//       const uploadedUrl = cloudData.secure_url;

//       if (auth.currentUser) await updateProfile(auth.currentUser, { photoURL: uploadedUrl });
//       await updateDoc(doc(db, "users", currentUser.uid), { image: uploadedUrl });
//       setProfileImage(uploadedUrl);
//       setStatus({ type: "success", msg: "Profile photo updated!" });
//     } catch (err) {
//       setStatus({ type: "error", msg: "Upload failed." });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleProfileSave = async (e) => {
//     e.preventDefault();
//     try {
//       await updateProfile(auth.currentUser, { displayName: name.trim() });
//       await updateDoc(doc(db, "users", currentUser.uid), { name: name.trim() });
//       setStatus({ type: "success", msg: "Profile updated!" });
//     } catch (err) {
//       setStatus({ type: "error", msg: "Database failure." });
//     }
//   };

//   if (loading) return <div className="p-24 text-center">Loading Profile...</div>;

//   return (
//     <div className="bg-[#f9f9f9] min-h-screen py-16 px-6 flex flex-col items-center">
      
//       {/* 1. Main Profile Settings Card */}
//       <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl relative mb-10">
//         {status.msg && (
//           <div className={`mb-6 p-4 rounded-2xl text-sm flex items-center gap-2 border ${status.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
//             {status.type === "success" ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
//             {status.msg}
//           </div>
//         )}

//         <div className="flex flex-col items-center mb-10">
//           <div className="relative group w-32 h-32 mb-4">
//             <div className="w-full h-full rounded-full bg-neutral-100 border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
//               {profileImage ? <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold text-gray-400">{name[0]}</span>}
//             </div>
//             <label className="absolute bottom-1 right-1 bg-[#6e4b31] text-white p-2.5 rounded-full cursor-pointer">
//               {uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
//               <input type="file" onChange={handleImageUpload} className="hidden" />
//             </label>
//           </div>
//           <h3 className="text-xl font-bold uppercase">{name || "Yarniverse User"}</h3>
//         </div>

//         <form onSubmit={handleProfileSave} className="space-y-5">
//           <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border rounded-xl p-3" />
//           <button type="submit" className="w-full bg-neutral-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Save Changes</button>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"; 
import { 
  Camera, User, Mail, CheckCircle, AlertCircle, Loader2, 
  Package, MapPin, Phone, Calendar, Edit3, Save, X, 
  Shield, Key, Eye, EyeOff, LogOut, ChevronRight, 
  ShoppingBag, Heart, Settings, Bell, CreditCard, 
  Clock, Award, Star, Globe, Link as LinkIcon,
  Upload, ImagePlus, Trash2, Plus, Info, Lock,
  UserCheck, Briefcase, Home, Bookmark, ExternalLink,
  AtSign
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", msg: "" });
  
  // Profile Data
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    socialLink: "",
    profileImage: "",
    coverImage: "",
    gender: "",
    birthday: "",
    occupation: "",
    company: "",
  });

  // Edit Modes
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Image Upload
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Stats
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
    memberSince: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (user) => {
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          name: data.name || user.displayName || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          location: data.location || "",
          website: data.website || "",
          socialLink: data.socialLink || data.instagram || "",
          profileImage: data.profileImage || data.image || user.photoURL || "",
          coverImage: data.coverImage || "",
          gender: data.gender || "",
          birthday: data.birthday || "",
          occupation: data.occupation || "",
          company: data.company || "",
        });
        setStats({
          orders: data.totalOrders || 0,
          wishlist: data.wishlistCount || 0,
          reviews: data.reviewCount || 0,
          memberSince: data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Unknown"
        });
      } else {
        // Create initial profile
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName || "",
          email: user.email || "",
          profileImage: user.photoURL || "",
          createdAt: Date.now(),
          totalOrders: 0,
          wishlistCount: 0,
          reviewCount: 0,
        });
        setProfile(prev => ({
          ...prev,
          name: user.displayName || "",
          email: user.email || "",
          profileImage: user.photoURL || "",
        }));
        setStats({
          orders: 0,
          wishlist: 0,
          reviews: 0,
          memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: "", msg: "" }), 4000);
  };

  // Handle Profile Image Upload
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showStatus("error", "Image must be less than 5MB");
      return;
    }

    setUploadingProfile(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: uploadedUrl });
      }
      await updateDoc(doc(db, "users", currentUser.uid), { 
        profileImage: uploadedUrl,
        image: uploadedUrl 
      });
      
      setProfile(prev => ({ ...prev, profileImage: uploadedUrl }));
      showStatus("success", "Profile photo updated successfully! ✨");
    } catch (err) {
      console.error("Upload error:", err);
      showStatus("error", "Failed to upload image. Please try again.");
    } finally {
      setUploadingProfile(false);
    }
  };

  // Handle Cover Image Upload
  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showStatus("error", "Cover image must be less than 10MB");
      return;
    }

    setUploadingCover(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      await updateDoc(doc(db, "users", currentUser.uid), { coverImage: uploadedUrl });
      setProfile(prev => ({ ...prev, coverImage: uploadedUrl }));
      showStatus("success", "Cover image updated successfully! 🎨");
    } catch (err) {
      console.error("Upload error:", err);
      showStatus("error", "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  // Cloudinary Upload Helper
  const uploadToCloudinary = async (file) => {
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME || "dzus5lbch";
    const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET || "yarniverse_upload";
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );
    
    if (!response.ok) throw new Error("Upload failed");
    
    const data = await response.json();
    return data.secure_url;
  };

  // Handle Profile Update
  const handleProfileSave = async (e) => {
    e.preventDefault();
    
    if (!profile.name.trim()) {
      showStatus("error", "Name is required");
      return;
    }

    try {
      const updates = {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        bio: profile.bio.trim(),
        location: profile.location.trim(),
        website: profile.website.trim(),
        socialLink: profile.socialLink.trim(),
        gender: profile.gender,
        birthday: profile.birthday,
        occupation: profile.occupation.trim(),
        company: profile.company.trim(),
        updatedAt: Date.now()
      };

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: profile.name.trim() });
      }
      await updateDoc(doc(db, "users", currentUser.uid), updates);
      
      setEditMode(false);
      showStatus("success", "Profile updated successfully! 🎉");
    } catch (err) {
      console.error("Update error:", err);
      showStatus("error", "Failed to update profile. Please try again.");
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showStatus("error", "Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showStatus("error", "Password must be at least 6 characters");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showStatus("success", "Password changed successfully! 🔒");
    } catch (err) {
      console.error("Password change error:", err);
      if (err.code === "auth/wrong-password") {
        showStatus("error", "Current password is incorrect");
      } else {
        showStatus("error", "Failed to change password. Please try again.");
      }
    }
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    fetchUserProfile(currentUser);
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-stone-200 border-t-[#6e4b31] mx-auto"></div>
          <p className="text-stone-500 font-medium text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/20">
      
      {/* 🔔 Status Toast */}
      {status.msg && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-slide-down border backdrop-blur-md ${
          status.type === "success" 
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800' 
            : 'bg-red-50/95 border-red-200 text-red-800'
        }`}>
          {status.type === "success" ? <CheckCircle size={20} className="text-emerald-600" /> : <AlertCircle size={20} className="text-red-600" />}
          <span className="font-bold text-sm tracking-wide">{status.msg}</span>
        </div>
      )}

      {/* 🎨 Cover Image Section */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-[#6e4b31] via-[#8b6914] to-[#6e4b31] overflow-hidden">
        {profile.coverImage && (
          <img 
            src={profile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Cover Image Upload Button */}
        <label className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-xl cursor-pointer transition-all border border-white/30 hover:scale-105">
          {uploadingCover ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Camera size={18} />
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleCoverImageUpload} 
            className="hidden" 
            disabled={uploadingCover}
          />
        </label>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-20 md:-mt-28 relative z-10 pb-16">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden mb-8">
          <div className="p-6 md:p-8 lg:p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              
              {/* Profile Image */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br from-stone-100 to-amber-50 border-4 border-white shadow-xl overflow-hidden">
                  {profile.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt={profile.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#6e4b31]/10 to-amber-100">
                      <span className="text-5xl font-black text-[#6e4b31]/30">
                        {(profile.name || "U")[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <label className="absolute -bottom-2 -right-2 bg-[#6e4b31] hover:bg-[#5a3d28] text-white p-3 rounded-xl cursor-pointer shadow-lg transition-all hover:scale-110">
                  {uploadingProfile ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                  <input 
                    ref={profileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfileImageUpload} 
                    className="hidden" 
                    disabled={uploadingProfile}
                  />
                </label>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-stone-900">
                      {profile.name || "Yarniverse User"}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 text-stone-500">
                      <Mail size={14} />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-2 mt-1 text-stone-500">
                        <MapPin size={14} />
                        <span className="text-sm">{profile.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-5 py-2.5 bg-[#6e4b31] hover:bg-[#5a3d28] text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#6e4b31]/20 flex items-center gap-2"
                      >
                        <Edit3 size={16} /> Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCancelEdit}
                          className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
                        >
                          <X size={16} /> Cancel
                        </button>
                        <button
                          onClick={handleProfileSave}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                        >
                          <Save size={16} /> Save Changes
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && !editMode && (
                  <p className="text-stone-600 mt-4 leading-relaxed text-sm md:text-base max-w-2xl">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Bar
          <div className="grid grid-cols-3 border-t border-stone-100">
            {[
              { label: "Orders", value: stats.orders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Wishlist", value: stats.wishlist, icon: Heart, color: "text-red-600", bg: "bg-red-50" },
              { label: "Reviews", value: stats.reviews, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((stat, idx) => (
              <div key={idx} className={`p-4 md:p-6 text-center ${idx < 2 ? 'border-r border-stone-100' : ''}`}>
                <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <div className="text-xl md:text-2xl font-black text-stone-900">{stat.value}</div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div> */}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column - Edit Form or Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {editMode ? (
              /* ✏️ EDIT MODE */
              <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-8">
                <h2 className="font-serif font-bold text-xl text-stone-900 mb-6 flex items-center gap-2">
                  <Edit3 size={20} className="text-[#6e4b31]" /> Edit Profile
                </h2>
                
                <form onSubmit={handleProfileSave} className="space-y-5">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <User size={14} className="inline mr-1" /> Full Name *
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <Mail size={14} className="inline mr-1" /> Email
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full bg-stone-100 border border-stone-200 rounded-xl p-3.5 text-stone-500 cursor-not-allowed font-medium"
                      />
                      <p className="text-[10px] text-stone-400 mt-1 ml-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <Phone size={14} className="inline mr-1" /> Phone
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <MapPin size={14} className="inline mr-1" /> Location
                      </label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <Briefcase size={14} className="inline mr-1" /> Occupation
                      </label>
                      <input
                        type="text"
                        value={profile.occupation}
                        onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                        placeholder="Designer, Artisan, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <Home size={14} className="inline mr-1" /> Company
                      </label>
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                        placeholder="Company or brand name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <Calendar size={14} className="inline mr-1" /> Birthday
                      </label>
                      <input
                        type="date"
                        value={profile.birthday}
                        onChange={(e) => setProfile(prev => ({ ...prev, birthday: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <UserCheck size={14} className="inline mr-1" /> Gender
                      </label>
                      <select
                        value={profile.gender}
                        onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                      <Info size={14} className="inline mr-1" /> Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows="4"
                      className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Social Links */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <Globe size={14} className="inline mr-1" /> Website
                      </label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                        <AtSign size={14} className="inline mr-1" /> Social Link
                      </label>
                      <input
                        type="text"
                        value={profile.socialLink}
                        onChange={(e) => setProfile(prev => ({ ...prev, socialLink: e.target.value }))}
                        className="w-full bg-white border border-stone-200 rounded-xl p-3.5 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                        placeholder="Instagram, Twitter, or any social link"
                      />
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* 👁️ VIEW MODE - Details Cards */
              <>
                {/* About Section */}
                {profile.bio && (
                  <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-8">
                    <h2 className="font-serif font-bold text-xl text-stone-900 mb-4 flex items-center gap-2">
                      <Info size={20} className="text-[#6e4b31]" /> About Me
                    </h2>
                    <p className="text-stone-600 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Personal Information */}
                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-8">
                  <h2 className="font-serif font-bold text-xl text-stone-900 mb-6 flex items-center gap-2">
                    <User size={20} className="text-[#6e4b31]" /> Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: Phone, label: "Phone", value: profile.phone },
                      { icon: MapPin, label: "Location", value: profile.location },
                      { icon: Briefcase, label: "Occupation", value: profile.occupation },
                      { icon: Home, label: "Company", value: profile.company },
                      { icon: Calendar, label: "Birthday", value: profile.birthday },
                      { icon: UserCheck, label: "Gender", value: profile.gender },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                        <item.icon size={16} className="text-stone-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{item.label}</p>
                          <p className="text-sm font-medium text-stone-700 mt-0.5">
                            {item.value || <span className="text-stone-300 italic">Not provided</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                {(profile.website || profile.socialLink) && (
                  <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-8">
                    <h2 className="font-serif font-bold text-xl text-stone-900 mb-4 flex items-center gap-2">
                      <LinkIcon size={20} className="text-[#6e4b31]" /> Connect
                    </h2>
                    <div className="space-y-3">
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-700 hover:text-[#6e4b31]">
                          <Globe size={18} />
                          <span className="text-sm font-medium truncate">{profile.website}</span>
                          <ExternalLink size={14} className="ml-auto shrink-0" />
                        </a>
                      )}
                      {profile.socialLink && (
                        <a href={profile.socialLink} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors text-stone-700 hover:text-[#6e4b31]">
                          <AtSign size={18} />
                          <span className="text-sm font-medium truncate">{profile.socialLink}</span>
                          <ExternalLink size={14} className="ml-auto shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Quick Actions & Settings */}
          <div className="space-y-6">
            
            {/* Member Since Card */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-[#6e4b31]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award size={28} className="text-[#6e4b31]" />
              </div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Member Since</p>
              <p className="text-lg font-black text-stone-900 mt-1">{stats.memberSince}</p>
            </div>

            {/* Quick Links
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
              <h3 className="font-bold text-sm text-stone-900 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                Quick Actions
              </h3>
              {[
                { icon: ShoppingBag, label: "My Orders", link: "/orders", color: "text-blue-600" },
                { icon: Heart, label: "Wishlist", link: "/wishlist", color: "text-red-600" },
                { icon: Star, label: "My Reviews", link: "/reviews", color: "text-amber-600" },
                { icon: Bookmark, label: "Saved Items", link: "/saved", color: "text-purple-600" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  to={item.link}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0 group"
                >
                  <div className={`${item.color} bg-stone-50 p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-stone-700 flex-1">{item.label}</span>
                  <ChevronRight size={16} className="text-stone-300 group-hover:text-[#6e4b31] transition-colors" />
                </Link>
              ))}
            </div> */}

            {/* Settings */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
              <h3 className="font-bold text-sm text-stone-900 px-6 py-4 border-b border-stone-100 bg-stone-50/50">
                Account Settings
              </h3>
              
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-stone-50 transition-colors border-b border-stone-50 group"
              >
                <div className="text-stone-600 bg-stone-50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <Lock size={18} />
                </div>
                <span className="text-sm font-medium text-stone-700 flex-1 text-left">Change Password</span>
                <ChevronRight size={16} className="text-stone-300" />
              </button>

              <button
                onClick={() => auth.signOut()}
                className="w-full flex items-center gap-3 px-6 py-4 hover:bg-red-50 transition-colors group"
              >
                <div className="text-red-600 bg-red-50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <LogOut size={18} />
                </div>
                <span className="text-sm font-medium text-red-600 flex-1 text-left">Sign Out</span>
                <ChevronRight size={16} className="text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🔒 PASSWORD CHANGE MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-stone-900/70 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 border border-stone-100 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif font-bold text-xl text-stone-900 flex items-center gap-2">
                <Key size={20} className="text-[#6e4b31]" /> Change Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { key: 'currentPassword', label: 'Current Password', show: showPasswords.current },
                { key: 'newPassword', label: 'New Password', show: showPasswords.new },
                { key: 'confirmPassword', label: 'Confirm Password', show: showPasswords.confirm },
              ].map((field, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <input
                      type={field.show ? "text" : "password"}
                      value={passwordData[field.key]}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 pr-12 text-stone-800 focus:ring-2 focus:ring-[#6e4b31]/30 focus:border-[#6e4b31] outline-none transition-all font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                type="submit"
                className="w-full bg-[#6e4b31] hover:bg-[#5a3d28] text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#6e4b31]/20 mt-2"
              >
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}