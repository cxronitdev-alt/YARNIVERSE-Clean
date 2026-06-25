import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) return <div className="p-20 text-center animate-pulse">Verifying Admin...</div>;
  
  return user && profile?.role === "admin" ? children : <Navigate to="/" replace />;
}