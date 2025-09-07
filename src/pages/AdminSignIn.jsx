// src/pages/AdminSignIn.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Firebase";

export default function AdminSignIn() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      // onAuthStateChanged in RequireAuth will navigate/render protected content
    } catch (e) {
      setErr(e.message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 360, margin: "4rem auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 12 }}>Admin Sign In</h2>
      <label style={{ display: "block", marginBottom: 8 }}>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>
      <label style={{ display: "block", marginBottom: 16 }}>
        Password
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginTop: 4 }}
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        style={{ padding: "0.5rem 0.9rem", background: "#0d6efd", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}
      <p style={{ fontSize: 12, opacity: 0.7, marginTop: 12 }}>
        Don’t have an account? Contact the site admin
      </p>
    </form>
  );
}
