"use client";

import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function LoginBox({ onLoginValidated }) {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signOut(auth);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "authorizedUsers", user.email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { communityId } = docSnap.data();

        // Mostrar loader de pantalla completa
        if (onLoginValidated) onLoginValidated();

        router.push(`/dashboard/${communityId}`);
      } else {
        toast.error("No estás autorizado para ingresar.");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Ocurrió un error al iniciar sesión.");
    }
  };

  return (
    <div className="p-6 bg-[#87cec1] shadow-lg rounded-lg text-center w-70">
      <h2 className="text-2xl font-serif mb-4 text-white">Acceso a socios</h2>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Iniciar sesión con Google
      </button>
    </div>
  );
}

