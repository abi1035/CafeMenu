import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Firebase";
import AdminSignIn from "../pages/AdminSignIn";

export default function RequireAuth({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  if (user === undefined) {
    return <p style={{ padding: "2rem", fontFamily: "sans-serif" }}>Loading…</p>;
  }

  if (!user) {
    return <AdminSignIn />;
  }

  return children;
}