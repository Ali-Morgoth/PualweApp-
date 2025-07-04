"use client";

import { signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import styles from "./LoginBox.module.css";
import { UserGroupIcon } from "@heroicons/react/24/outline";

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
    <div className={styles["card-login"]}>
      <div className={`${styles["circle-container"]} justify-center`}>
        <UserGroupIcon className="h-8 w-8 text-white animate-pulse"/>
      </div>
      <h2 className={styles.title}>Acceso a socios</h2>
      <div className={styles.divider}></div> {/* Línea decorativa */}
      <h3 className="text-white text-sm subtitle">
        Si perteneces a una comunidad registrada de San Juan de la Costa
      </h3>
      <button onClick={handleLogin} className={styles.button}>
        <span className={styles["text-button"]}>
          Iniciar sesión con Google
        </span>
      </button>
    </div>
  );
}
