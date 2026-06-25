import { useEffect, useState } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import AdminLayout from "../../components/layouts/AdminLayout";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(snap.docs.map(d => d.data()));
    };

    fetch();
  }, []);

  return (
    <AdminLayout>

      <h1>Users</h1>

      {users.map((u, i) => (
        <div key={i}>
          {u.email} - {u.role}
        </div>
      ))}

    </AdminLayout>
  );
}