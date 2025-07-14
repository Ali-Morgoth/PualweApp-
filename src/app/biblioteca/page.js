"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import BuscadorSemantico from "../components/buscador/BucadorSemantico";
import { BookOpenIcon, SparklesIcon } from "@heroicons/react/24/outline";

export default function Biblioteca() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollDirection, setScrollDirection] = useState(1);
  const scrollInterval = useRef(null);
  const timeoutRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStart = useRef(0);
  const [showModal, setShowModal] = useState(false);

  // Estado para controlar la opacidad del fondo
  const [bgLoaded, setBgLoaded] = useState(false);

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
      descripcion:
        "Perspectiva espiritual y filosófica del pueblo mapuche huilliche.",
    },
    {
      nombre: "Arte y música",
      path: "arte",
      imagen: "/musica_y_arte.webp",
      descripcion: "Expresiones artísticas y musicales ancestrales.",
    },
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !autoScroll) return;

    scrollInterval.current = setInterval(() => {
      container.scrollLeft += scrollDirection;
      const maxScroll = container.scrollWidth - container.clientWidth;
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
      {/* Fondo sólido con color semitransparente */}
      <div className="absolute inset-0 -z-20 bg-[rgba(18,34,37,0.64)]"></div>

      {/* Imagen de fondo con fade-in */}
      <div
        className={`absolute inset-0 -z-10 transition-opacity duration-1000 ${
          bgLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src="/biblioteca_publica.webp"
          alt="Fondo biblioteca"
          blurDataURL="/biblioteca_blur.jpg"
          fill
          className="object-cover blur-[3.5px]"
          priority
          onLoad={() => setBgLoaded(true)}
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
      <div className="item-hints">
        <div className="hint flex flex-col items-center gap-2">
          <div className="hint-dot">
            <BookOpenIcon className="w-8 h-8 text-white" />
          </div>
          <div className="bg-gray-600/30 rounded-xl px-3 py-1">
            <p className="text-white font-extralight text-sm">
              Biblioteca Pública
            </p>
          </div>

          <div className="hint-content">
            <h1 className="font-extralight text-white text-xs">
              Aquí encontrarás un respaldo histórico de libros en formato PDF subidos por comunidades
              indígenas mapuche huilliche.
            </h1>
          </div>
        </div>
      </div>

      {/* Carrusel horizontal */}
      <div className="mt-20 sm:mt-0 flex justify-center">
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
              <div className="relative w-full h-40">
                <Image
                  src={cat.imagen}
                  alt={cat.nombre}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, 280px"
                  priority={cat.path === "historia"}
                />
              </div>

              <div className="flex-grow flex flex-col p-4 text-white">
                <h2 className="text-lg font-light mb-1 text-[#14fed3]">
                  {cat.nombre}
                </h2>
                <div className="text-sm text-white text-opacity-80 mb-4 w-full break-words whitespace-normal overflow-hidden">
                  {cat.descripcion}
                </div>
                <button
                  onClick={() => router.push(`/biblioteca/${cat.path}`)}
                  className="button-categories mt-7"
                >
                  <span className="button-categories-text">
                    Ver {cat.nombre}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Botón flotante al final */}
      <div className="mt-10 flex justify-center z-30 relative">
        <button onClick={() => setShowModal(true)} className="button-ia">
          <span className="sparkle">
            <SparklesIcon className="path w-6 h-6" />
          </span>
          <span className="text_button">
            ¿Quieres un libro sugerido por la IA?
          </span>
          <span className="dots_border"></span>
        </button>
      </div>
      {/* Modal flotante */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1818a150] bg-opacity-60 backdrop-blur-sm">
           
          <div className="bg-[#84a7a983] text-white rounded-lg p-6 w-[90%] max-w-2xl max-h-[85vh] relative shadow-2xl overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-white hover:text-red-400"
              aria-label="Cerrar"
            >
              ✕
            </button>
            <h2 className="text-xs font-light mb-4 text-[#14fed3]">
              Intérprete de búsqueda por vectores y se retornan resultados por
              similitud de significado...
            </h2>
            <BuscadorSemantico />
          </div>
        </div>
      )}
    </div>
  );
}
