"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import styles from "./PublicLibraryBox.module.css";

export default function PublicLibraryBox() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleNavigate = async () => {
    setLoading(true);

    const img = new Image();
    img.src = "/biblioteca_publica.webp";
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    router.push("/biblioteca");
  };

  return (
    <div className={styles["card-library"]}>
      <div className={styles["circle-container"]}>
        <BookOpenIcon className="h-8 w-8 text-white animate-pulse" />
      </div>

      <h2 className={styles.title}>Biblioteca Pública</h2>
      <div className={styles.divider}></div>

      <h3 className={`text-white text-sm ${styles.subtitle}`}>
        Recopilatorio histórico mapuche huilliche de San Juan de la Costa
      </h3>

      <button
        onClick={handleNavigate}
        className={`${styles["button-library"]} flex items-center justify-center gap-2`}
        disabled={loading}
      >
        {loading ? (
          <>
            <ArrowPathIcon className="h-5 w-5 animate-spin text-white" />
            <span className={styles["text-button-library"]}>
              Cargando...
            </span>
          </>
        ) : (
          <span className={styles["text-button-library"]}>Ver Biblioteca</span>
        )}
      </button>
    </div>
  );
}
