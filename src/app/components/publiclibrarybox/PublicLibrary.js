"use client";
import Link from "next/link";
import "./PublicLibraryBox.css";
import { BookOpenIcon } from "@heroicons/react/24/outline"; // o 'solid' si prefieres

export default function PublicLibraryBox() {
  return (
    <div className="card-library">
      <div className="circle-container">
        <BookOpenIcon className="h-8 w-8 text-white animate-pulse" />
      </div>

      <h2 className="title">Biblioteca Pública</h2>
      <h3 className="text-white text-sm subtitle">
        Recopilatorio histórico mapuche huilliche de San Juan de la Costa
      </h3>
      <Link href="/biblioteca">
        <button className="button">
          <span className="text-button">Ver Biblioteca</span>
        </button>
      </Link>
    </div>
  );
}

