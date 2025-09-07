
import { signOut } from "firebase/auth";
import { auth } from "../Firebase";

export default function SignOutButton() {
  const onClick = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
      alert("Sign-out failed");
    }
  };

  return (
    <button
      onClick={onClick}
      style={{ padding: ".4rem .8rem", background: "#6c757d", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
    >
      Sign out
    </button>
  );
}
