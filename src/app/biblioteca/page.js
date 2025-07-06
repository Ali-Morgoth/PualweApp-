"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Image from "next/image";

export default function Biblioteca() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollDirection, setScrollDirection] = useState(1); // 1 = right, -1 = left
  const scrollInterval = useRef(null);
  const timeoutRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);

  const categorias = [
    {
      nombre: "Historia",
      path: "historia",
      imagen: "/historia.webp",
      descripcion:
        "Descubre los hechos históricos del pueblo mapuche huilliche.",
    },
    {
      nombre: "Investigaciones",
      path: "investigaciones",
      imagen: "/investigaciones.webp",
      descripcion: "Accede a estudios, análisis y trabajos académicos.",
    },
    {
      nombre: "Cuentos y leyendas",
      path: "cuentos-leyendas",
      imagen: "/cuentos.webp",
      descripcion: "Relatos tradicionales que reflejan la cultura local.",
    },
    {
      nombre: "Idioma",
      path: "idioma",
      imagen: "/idioma.webp",
      descripcion: "Aprende y conserva el idioma originario.",
    },
    {
      nombre: "Cosmovisión",
      path: "cosmovision",
      imagen: "/cosmovision.webp",
      descripcion: "Perspectiva espiritual y filosófica del pueblo mapuche huilliche.",
    },
    {
      nombre: "Arte y música",
      path: "arte",
      imagen: "/arte.webp",
      descripcion: "Expresiones artísticas y musicales ancestrales.",
    },
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !autoScroll) return;

    scrollInterval.current = setInterval(() => {
      container.scrollLeft += scrollDirection;

      const maxScroll = container.scrollWidth - container.clientWidth;

      // Usamos Math.round para evitar fallos por valores decimales
      const currentScroll = Math.round(container.scrollLeft);

      if (currentScroll >= Math.round(maxScroll)) {
        setScrollDirection(-1);
      } else if (currentScroll <= 0) {
        setScrollDirection(1);
      }
    }, 20);

    return () => clearInterval(scrollInterval.current);
  }, [autoScroll, scrollDirection]);

  const handleUserInteraction = () => {
    setAutoScroll(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAutoScroll(true);
    }, 2000);
  };

  // Mouse drag (desktop)
  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.clientX;
    scrollStart.current = scrollRef.current.scrollLeft;
    handleUserInteraction();
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const diff = e.clientX - dragStartX.current;
    scrollRef.current.scrollLeft = scrollStart.current - diff;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative min-h-screen p-6 overflow-hidden select-none">
      {/* Imagen de fondo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/biblioteca_publica.webp"
          alt="Fondo biblioteca"
          blurDataURL="/biblioteca_blur.jpg"
          fill
          className="object-cover blur-[3.5px]"
          priority
        />
      </div>

      {/* Botón volver */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-20 text-white hover:text-blue-300 transition"
        aria-label="Volver al menú principal"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      {/* Título */}
      <div className="folder-header-container z-20 relative">
        <div className="folder-header-folder">
          <div className="tip"></div>
          <div className="cover front-side"></div>
          <div className="cover back-side"></div>
        </div>
        <h1 className="font-extralight text-white">Biblioteca Pública</h1>
      </div>

      {/* Carrusel horizontal */}
 {/* Contenedor que empuja hacia abajo en móviles */}
<div className="mt-20 sm:mt-0 flex justify-center">
  {/* Carrusel horizontal */}
  <div
    ref={scrollRef}
    onWheel={handleUserInteraction}
    onTouchStart={handleUserInteraction}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
    className="flex gap-4 overflow-x-auto no-scrollbar py-6 px-2 z-20 relative scroll-smooth whitespace-nowrap cursor-grab active:cursor-grabbing"
  >
    {categorias.map((cat) => (
      <div
        key={cat.path}
        className="inline-block w-[280px] h-auto min-h-[360px] shrink-0 bg-[#3dab9a55] backdrop-blur-md rounded-lg border border-white/20 shadow-md flex flex-col"
      >
        <img
          src={cat.imagen}
          alt={cat.nombre}
          className="w-full h-40 object-cover rounded-t-lg"
        />
        <div className="flex-grow flex flex-col p-4 text-white">
          <h2 className="text-lg font-light mb-1">{cat.nombre}</h2>
          <div className="text-sm text-white text-opacity-80 mb-4 w-full break-words whitespace-normal overflow-hidden">
            {cat.descripcion}
          </div>
          <button
            onClick={() => router.push(`/biblioteca/${cat.path}`)}
            className="mt-auto bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Ver {cat.nombre}
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}
