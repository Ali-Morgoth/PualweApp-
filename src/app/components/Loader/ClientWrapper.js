"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import KiyemtuainLoader from "../Loader/KiyemtuainLoader";

// ✅ Función para precargar imágenes sin conflicto con next/image
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.src = src;
    img.onload = resolve;
    img.onerror = reject;
  });
};

export default function ClientWrapper({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const preloadAssets = async () => {
      try {
        // Precargar ambas imágenes
        await Promise.all([
          preloadImage("/pualwe_bg.webp"),
          preloadImage("/biblioteca_publica.webp"),
        ]);
      } catch (err) {
        console.warn("No se pudo precargar alguna imagen", err);
      } finally {
        setTimeout(() => setLoading(false), 1000); // ligeramente más corto que antes
      }
    };

    preloadAssets();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-6">
        {/* Imagen superior */}
        <Image
          src="/pualwe_logo.png"
          alt="Logo Pualwe"
          width={120}
          height={120}
          priority
        />

        {/* Loader */}
        <KiyemtuainLoader />
      </div>
    );
  }

  return children;
}
