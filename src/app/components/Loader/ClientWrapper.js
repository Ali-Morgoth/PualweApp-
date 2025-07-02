// components/ClientWrapper.js
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import KiyemtuainLoader from "../Loader/KiyemtuainLoader";

export default function ClientWrapper({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000); // Ajusta duración
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center gap-6">
        {/* Imagen superior */}
        <Image
          src="/Kiyemtuain_logo.png" // Cambia el path si tu logo está en otra carpeta
          alt="Logo Kiyemtuain"
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
