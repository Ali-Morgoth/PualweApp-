"use client";

import Image from "next/image";
import { useState } from "react";
import LoginBox from "@/app/components/loginbox/LoginBox";
import PublicLibrary from "@/app/components/publiclibrarybox/PublicLibrary";
import KiyemtuainLoader from "./components/Loader/KiyemtuainLoader";
import InstallPrompt from "./components/installer/InstallPromtp";

export default function Home() {
  const [isBlurred, setIsBlurred] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Imagen de fondo con next/image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/pualwe_bg.jpg"
          alt="Fondo Pualwe"
          fill
          priority
          className={`object-cover transition duration-300 ${
            isBlurred ? "blur-md" : ""
          }`}
        />
      </div>

      {/* Capa de opacidad encima de la imagen */}
      <div className="absolute inset-0 bg-black opacity-20 z-0" />

      {/* Título animado */}
      <div className="animated-title-container z-10 relative">
        <span className="animated-title-text">Pualwe</span>
        <ul className="animated-words">
          <li>Biblioteca</li>
          <li>Intranet</li>
          <li>Comunidad</li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full p-8 gap-8 mt-32">
        <div className="flex flex-col md:flex-row items-center justify-center gap-y-8 md:gap-y-0 md:gap-x-8">
          <div
            className="cool-card-container"
            onMouseEnter={() => setIsBlurred(true)}
            onMouseLeave={() => setIsBlurred(false)}
          >
            <div className="cool-card">
              <span className="circleLight"></span>
              <div className="card-text">
                <PublicLibrary />
              </div>
            </div>
          </div>

          <div
            className="cool-card-container"
            onMouseEnter={() => setIsBlurred(true)}
            onMouseLeave={() => setIsBlurred(false)}
          >
            <div className="cool-card">
              <span className="circleLight"></span>
              <div className="card-text">
                <LoginBox />
              </div>
            </div>
          </div>
        </div>

        {/* Loader y tooltip */}
        <div className="mt-8 flex items-center justify-center gap-0 mr-10">
          <div className="-mr-2">
            <KiyemtuainLoader useImage />
          </div>
          <div className="custom-tooltip-container">
            <button className="custom-tooltip-btn">Comunidad Kiyemtuain</button>
            <div className="custom-tooltip-content">
              <div className="custom-tooltip-text">
                Esta es una comunidad dedicada a compartir saberes ancestrales
                mapuche huilliche.
              </div>
              <div className="custom-tooltip-arrow"></div>
            </div>
          </div>
        </div>

        {/* Install prompt */}
        <div>
          <InstallPrompt />
        </div>
      </div>
    </div>
  );
}
