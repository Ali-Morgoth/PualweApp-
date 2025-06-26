"use client";

import LoginBox from "@/app/components/loginbox/LoginBox";
import PublicLibrary from "@/app/components/publiclibrarybox/PublicLibrary";
import KiyemtuainLoader from "./components/Loader/KiyemtuainLoader";
import { useState } from "react";
import InstallPrompt from "./components/installer/InstallPromtp";


export default function Home() {
  const [isBlurred, setIsBlurred] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* Imagen de fondo */}
      <div
        className={`absolute inset-0 bg-center bg-no-repeat bg-cover z-0 bg-[#123c3c81] bg-blurable ${
          isBlurred ? "blur-bg" : ""
        }`}
        style={{
          backgroundImage: "url('/pualwe_bg.jpg')",
        }}
      />

      {/* Capa de opacidad encima de la imagen */}
      <div className="absolute inset-0 bg-black opacity-20 z-10" />

      {/* Título animado */}
      <div className="animated-title-container">
        <span className="animated-title-text">Pualwe</span>
        <ul className="animated-words">
          <li>Biblioteca</li>
          <li>Intranet</li>
          <li>Comunidad</li>
        </ul>
      </div>

      {/* Contenido principal */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full p-8 gap-8 mt-32">
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

        {/* Loader centrado debajo */}
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
        <div>
          {/* Tu contenido de navegación */}
          <InstallPrompt />
        </div>
      </div>
    </div>
  );
}
