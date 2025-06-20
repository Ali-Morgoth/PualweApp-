"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  HomeIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  QueueListIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Define las rutas en las que se debe mostrar el botón Panel
  const panelPaths = [
    "/directiva",
    "/documentos",
    "/tesoreria",
    "/libros",
    "/proyectos",
    "/eventos",
  ];

  // Muestra el botón si la ruta actual contiene alguna de las anteriores
  const showPanelButton = panelPaths.some((path) => pathname.includes(path));

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (!u) {
        router.push("/");
      } else {
        setUser(auth.currentUser); // ← Asegura obtener los datos completos como photoURL
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f0f9f8]">
      {/* Barra superior fija */}
      <div className="w-full flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex gap-4 items-center">
          {/* Botón Home */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="font-medium">Inicio</span>
          </button>

          {/* Botón Panel, solo si está en una ruta permitida */}
          {showPanelButton && (
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
            >
              <QueueListIcon className="w-6 h-6" />
              <span className="font-medium">Panel</span>
            </button>
          )}
        </div>

        {/* Menú de usuario */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-row-reverse items-center gap-2 focus:outline-none"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-9 h-9 rounded-full border border-gray-300 object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full border border-gray-300 bg-blue-600 flex items-center justify-center text-white font-semibold uppercase">
                  {user.displayName ? user.displayName.charAt(0) : "U"}
                </div>
              )}
              <span className="text-gray-700 font-medium text-sm truncate max-w-[100px]">
                {user.displayName}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/perfil");
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <UserCircleIcon className="w-5 h-5" />
                  Perfil
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/ayuda");
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <QuestionMarkCircleIcon className="w-5 h-5" />
                  Ayuda
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/administrador");
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  Administrador
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Renderizado del contenido del panel */}
      <div className="p-6">{children}</div>
    </div>
  );
}
