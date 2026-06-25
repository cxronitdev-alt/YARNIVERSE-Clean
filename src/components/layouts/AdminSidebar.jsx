import { Link } from "react-router-dom";

export default function AdminSidebar() {
  return (
    <div className="w-64 h-screen fixed bg-black text-white p-5">

      <h1 className="text-2xl mb-6">Admin Panel</h1>

      <nav className="flex flex-col gap-3">

        <Link to="/admin">Dashboard</Link>

        <Link to="/admin/upload">
          Add Product
        </Link>

        <Link to="/admin/products">
          Manage Products
        </Link>

        <Link to="/admin/categories">
          Categories
        </Link>

        <Link to="/admin/users">
          Users
        </Link>

      </nav>

    </div>
  );
}