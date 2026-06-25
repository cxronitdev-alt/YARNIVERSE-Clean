import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layouts/AdminLayout";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  return (
    <AdminLayout>

      <h1 className="text-3xl font-bold mb-6">Products</h1>

      {products.map((p) => (
        <div key={p.id} className="bg-white p-4 mb-3 flex justify-between">

          <div>
            <h2>{p.name}</h2>
            <p>₹{p.price}</p>
          </div>

          <div className="flex gap-3">

            <Link to={`/admin/edit/${p.id}`}>
              Edit
            </Link>

            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-500"
            >
              Delete
            </button>

          </div>

        </div>
      ))}

    </AdminLayout>
  );
}