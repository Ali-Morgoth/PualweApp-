"use client";
import Link from "next/link";
import styles from "./PublicLibraryBox.module.css";
import { BookOpenIcon } from "@heroicons/react/24/outline"; // o 'solid' si prefieres

export default function PublicLibraryBox() {
  return (
    <div className={styles["card-library"]}>
      <div className={styles["circle-container"]}>
        <BookOpenIcon className="h-8 w-8 text-white animate-pulse" />
      </div>

      <h2 className={styles.title}>Biblioteca Pública</h2>
      <div className={styles.divider}></div> {/* Línea decorativa */}
      <h3 className="text-white text-sm subtitle">
        Recopilatorio histórico mapuche huilliche de San Juan de la Costa
      </h3>
      <Link href="/biblioteca">
        <button className={styles["button-library"]}>
          <span className={styles["text-button-library"]}>Ver Biblioteca</span>
        </button>
      </Link>
    </div>
  );
}
