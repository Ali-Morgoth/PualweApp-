"use client";

import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.push("/");
      } else {
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (!user) return <div className="flex justify-center items-center h-screen">Cargando...</div>;

  const cargo = "Miembro de la Comunidad";
  const provider = user.providerData.length > 0 ? user.providerData[0].providerId : "Desconocido";
  const lastLogin = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString()
    : "Desconocida";

  return (
    <div className="min-h-screen bg-[#f0f9f8] flex flex-col items-center p-6 relative">
      {/* Botón volver atrás */}
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-6 left-6 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        aria-label="Volver al dashboard"
      >
        <ArrowLeftIcon className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Volver</span>
      </button>

      <h1 className="text-3xl font-bold mb-8 mt-6">Perfil de Usuario</h1>

      <div className="bg-white rounded-lg shadow-2xl p-6 max-w-md w-full flex flex-col items-center gap-6">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || "Foto de perfil"}
            className="w-28 h-28 rounded-full object-cover border border-gray-300"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-5xl uppercase border border-gray-300">
            {user.displayName ? user.displayName.charAt(0) : "U"}
          </div>
        )}

        <div className="text-center">
          <h2 className="text-xl text-black font-semibold">{user.displayName || "Nombre no disponible"}</h2>
          <p className="text-gray-600">{cargo}</p>
        </div>

        <div className="w-full">
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="font-medium text-gray-700">Correo electrónico:</span>
            <span className="text-gray-900">{user.email || "No disponible"}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 py-2">
            <span className="font-medium text-gray-700">Proveedor de autenticación:</span>
            <span className="text-gray-900">{provider}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-700">Último login:</span>
            <span className="text-gray-900">{lastLogin}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
