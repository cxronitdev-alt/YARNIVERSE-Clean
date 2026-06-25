import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { db } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { LayoutDashboard, PlusCircle, Edit, Users, LogOut, Package, Image, Upload, Trash2, Layers } from "lucide-react";

export default function AdminDashboard() {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  // ================= STATES =================
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [success, setSuccess] = useState("");

  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    "Crochet",
    "Knitting",
    "Home Decor",
    "Wall Art",
    "Accessories",
    "Bags",
    "Toys",
  ];

  // ================= FETCH PRODUCTS FROM FIRESTORE =================
  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const data = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ================= LOCAL PREVIEW ENGINE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= CLOUDINARY UPLOAD =================
  const uploadToCloudinary = async () => {
    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "yarniverse_upload");

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
      formData
    );

    return res.data.secure_url;
  };

  // ================= ADD PRODUCT (LIVE INTEGRATION) =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Please select a product image first!");
      return;
    }

    try {
      setLoading(true);

      // 1. Image uploaded to Cloudinary
      const imageUrl = await uploadToCloudinary();

      // 2. Document saved to Firestore under global collection with category filtering property
      await addDoc(collection(db, "products"), {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        image: imageUrl,
        createdAt: Date.now(),
      });

      // Reset form states
      setProduct({
        name: "",
        price: "",
        category: "",
        description: "",
        stock: "",
      });
      setImage(null);
      setImagePreview(null);

      setSuccess("✅ Product Published & Synchronized Successfully!");
      fetchProducts(); // Refresh list data
      setActiveTab("edit-product"); // Redirect visually to list tab

      setTimeout(() => setSuccess(""), 4000);
    } catch (error) {
      console.error(error);
      alert("Backend Upload Architecture Failed!");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE PRODUCT =================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this craftsmanship asset?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "products", id));
      setSuccess("🗑 Product Purged from Firestore");
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error(error);
      alert("Purge Process Interrupted!");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* ================= SIDEBAR NAVIGATION ================= */}
      <aside className="w-64 bg-[#6e4b31] text-white flex flex-col justify-between shadow-xl">
        <div>
          <div className="p-6 border-b border-[#593c26]">
            <h1 className="text-2xl font-serif font-bold tracking-wider">YARNIVERSE</h1>
            <p className="text-xs text-green-300 font-mono mt-1">👑 ADMIN CORE LAYER</p>
          </div>

          <nav className="p-4 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "dashboard" ? "bg-[#593c26] text-white" : "text-gray-200 hover:bg-[#593c26]/50"
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard Overview
            </button>

            <button
              onClick={() => setActiveTab("add-product")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "add-product" ? "bg-[#593c26] text-white" : "text-gray-200 hover:bg-[#593c26]/50"
              }`}
            >
              <PlusCircle size={18} /> Add New Product
            </button>

            <button
              onClick={() => setActiveTab("edit-product")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "edit-product" ? "bg-[#593c26] text-white" : "text-gray-200 hover:bg-[#593c26]/50"
              }`}
            >
              <Edit size={18} /> Edit / Manage Products
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                activeTab === "users" ? "bg-[#593c26] text-white" : "text-gray-200 hover:bg-[#593c26]/50"
              }`}
            >
              <Users size={18} /> Manage Users
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#593c26] bg-[#593c26]/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white text-[#6e4b31] flex items-center justify-center font-bold">
              {profile?.email?.[0].toUpperCase() || "A"}
            </div>
            <div className="truncate w-40">
              <p className="text-xs font-bold truncate">{profile?.email}</p>
              <p className="text-[10px] text-gray-300">System Admin Instance</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Logout from System
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT MODULE ================= */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white h-16 shadow-xs border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
            {activeTab.replace("-", " ")}
          </h2>
          {success && (
            <div className="bg-green-100 text-green-800 text-xs font-bold px-4 py-2 rounded-xl animate-fade-in shadow-xs border border-green-200">
              {success}
            </div>
          )}
        </header>

        <div className="p-8 max-w-6xl w-full mx-auto">
          
          {/* TAB: OVERVIEW STATS */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Products</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">{products.length}</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Active Users</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">1,205</h3>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Storage Pipeline</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">Cloudinary Connected</h3>
              </div>
            </div>
          )}

          {/* TAB: ADD PRODUCT CONTAINER */}
          {activeTab === "add-product" && (
            <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 max-w-2xl">
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">PRODUCT NAME</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#6e4b31]" 
                    placeholder="e.g., Crochet Handcraft Bag" 
                    value={product.name}
                    onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">PRICE (INR)</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#6e4b31]" 
                      placeholder="₹" 
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">STOCK UNITS</label>
                    <input 
                      type="number" 
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#6e4b31]" 
                      placeholder="e.g., 10" 
                      value={product.stock}
                      onChange={(e) => setProduct({ ...product, stock: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">TARGET MARKET CATEGORY</label>
                  <select
                    required
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:border-[#6e4b31]"
                  >
                    <option value="">Select Routing Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">DESCRIPTION / TEXTURE SPECIFICATION</label>
                  <textarea 
                    rows="4" 
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-[#6e4b31]" 
                    placeholder="Write detailed craftsmanship info here..."
                    value={product.description}
                    onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 block mb-1">PRODUCT SCHEMATIC IMAGE</label>
                  <div className="flex gap-4 items-center mt-1">
                    <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      <Upload size={24} className="text-gray-400 mb-1" />
                      <span className="text-xs font-medium text-gray-600">{image ? image.name : "Upload image file"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>

                    <div className="w-24 h-24 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden relative">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-[10px] text-gray-400">
                          <Image size={20} />
                          <span>Preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#6e4b31] disabled:bg-gray-400 text-white py-3 rounded-lg font-medium mt-4 hover:bg-[#593c26] transition-colors cursor-pointer"
                >
                  {loading ? "Uploading to Cloud Pipeline..." : "Publish Product Instance"}
                </button>
              </form>
            </div>
          )}

          {/* TAB: LIST / EDIT / MANAGE DATA VIEW */}
          {activeTab === "edit-product" && (
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <th className="p-4">Visual asset</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Category Node</th>
                    <th className="p-4">Stock Value</th>
                    <th className="p-4 text-center">Actions Engine</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">No synchronized products found in Firestore collection.</td>
                    </tr>
                  ) : (
                    products.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="p-4 flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border" />
                          <span className="font-medium truncate w-48">{item.name}</span>
                        </td>
                        <td className="p-4 font-mono">₹{item.price}</td>
                        <td className="p-4">
                          <span className="text-xs bg-[#f4ede8] text-[#6e4b31] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-max">
                            <Layers size={10} /> {item.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-semibold ${item.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                            {item.stock > 0 ? `In Stock (${item.stock})` : "Out of Stock"}
                          </span>
                        </td>
                        <td className="p-4 text-center flex justify-center gap-4">
                          <Link to={`/edit-product/${item.id}`} className="text-blue-500 hover:underline font-medium cursor-pointer">
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="text-red-500 hover:text-red-700 font-medium cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={14}/> Purge
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: SYSTEM USERS DATAFRAME */}
          {activeTab === "users" && (
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                    <th className="p-4">User Index Account</th>
                    <th className="p-4">System Node Authorization</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium">{profile?.email || "active-admin@yarniverse.com"}</td>
                    <td className="p-4">
                      <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full uppercase">
                        {profile?.role || "ADMIN"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}