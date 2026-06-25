import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function SearchPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const query =
    new URLSearchParams(location.search).get("q") || "";

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(data);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter((product) => {
    const search = query.toLowerCase();

    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.parentMenu?.toLowerCase().includes(search) ||
      product.originState?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-screen">
      <h1 className="text-3xl font-bold text-[#6e4b31] mb-2">
        Search Results
      </h1>

      <p className="text-gray-500 mb-8">
        Showing results for: <strong>{query}</strong>
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-600">
            No Products Found 😔
          </h2>

          <p className="text-gray-400 mt-2">
            Try another keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() =>
                navigate(`/product/${product.id}`)
              }
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-60 object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-1">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {product.category}
                </p>

                <p className="text-[#6e4b31] font-bold text-lg mt-3">
                  ₹{product.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}