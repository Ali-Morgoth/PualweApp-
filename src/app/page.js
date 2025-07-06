"use client";

import Image from "next/image";
import { useState } from "react";
import LoginBox from "@/app/components/loginbox/LoginBox";
import PublicLibrary from "@/app/components/publiclibrarybox/PublicLibrary";
import KiyemtuainLoader from "./components/Loader/KiyemtuainLoader";
import InstallPrompt from "./components/installer/InstallPromtp";

export default function Home() {
  const [isBlurred, setIsBlurred] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  // Estado para controlar el fade-in de la imagen de fondo
  const [bgLoaded, setBgLoaded] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Fondo blanco-gris semitransparente antes de la imagen */}
      <div className="absolute inset-0 -z-20 bg-[rgba(245,245,245,0.6)]" />

      {/* Imagen de fondo con fade-in */}
      <div
        className={`absolute inset-0 -z-10 transition-opacity duration-1000 ${
          bgLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <Image
          src="/pualwe_bg.webp"
          alt="Fondo Pualwe"
          fill
          priority
          placeholder="blur"
          blurDataURL="/pualwe_blur.jpg"
          className={`object-cover transition duration-300 ${
            isBlurred ? "blur-md" : ""
          }`}
          onLoadingComplete={() => setBgLoaded(true)}
        />
      </div>

      <div className="absolute inset-0 bg-black opacity-20 z-0" />

      <div className="animated-title-container z-10 relative">
        <span className="animated-title-text">Pualwe</span>
        <ul className="animated-words">
          <li>Biblioteca</li>
          <li>Intranet</li>
          <li>Comunidad</li>
        </ul>
      </div>

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
                <LoginBox onLoginValidated={() => setShowLoader(true)} />
              </div>
            </div>
          </div>
        </div>

        {/* Loader de la comunidad (decorativo) */}
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

      {/* Loader en pantalla completa tras validación */}
      {showLoader && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <KiyemtuainLoader />
        </div>
      )}
    </div>
  );
}
