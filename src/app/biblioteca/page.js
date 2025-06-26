"use client";

import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function Biblioteca() {
  const router = useRouter();

  const categorias = [
    { nombre: "Historia", path: "historia", imagen: "/historia.webp" },
    {
      nombre: "Investigaciones",
      path: "investigaciones",
      imagen: "/investigaciones.webp",
    },
    {
      nombre: "Cuentos y leyendas",
      path: "cuentos-leyendas",
      imagen: "/cuentos.webp",
    },
    { nombre: "Idioma", path: "idioma", imagen: "/idioma.webp" },
    { nombre: "Cosmovisión", path: "cosmovision", imagen: "/cosmovision.webp" },
    { nombre: "Arte y música", path: "arte", imagen: "/arte.webp" },
  ];

  return (
    <div className="relative min-h-screen p-6">
      {/* Imagen de fondo con menor zoom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/biblioteca_publica.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(3.5px)"
        
          
        }}
      ></div>

      {/* Capa oscura adicional si se desea más contraste */}
      {/* <div className="absolute inset-0 bg-black opacity-10 z-10" /> */}

      {/* Flecha volver */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-20 text-white hover:text-blue-300 transition"
        aria-label="Volver al menú principal"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      {/* Encabezado animado */}
      <div className="folder-header-container z-20 relative">
        <div className="folder-header-folder">
          <div className="tip"></div>
          <div className="cover front-side"></div>
          <div className="cover back-side"></div>
        </div>
        <h1 className="font-extralight text-white">Biblioteca Pública</h1>
      </div>

      {/* Tarjetas de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto z-20 relative">
        {categorias.map((cat) => (
          <div key={cat.path} className="cool-card">
            <div className="circleLight"></div>
            <img
              src={cat.imagen}
              alt={cat.nombre}
              className="w-full h-40 object-cover rounded-lg mb-1"
            />
            <h2 className="font-semibold mb-2 text-white">{cat.nombre}</h2>
            <button
              onClick={() => router.push(`/biblioteca/${cat.path}`)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-[#065f46]"
            >
              Ver {cat.nombre}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
