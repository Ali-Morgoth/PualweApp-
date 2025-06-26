"use client";
import { useEffect, useState } from "react";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      localStorage.setItem("canInstall", "true");
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    if (localStorage.getItem("canInstall") === "true") {
      setShowButton(true);
    }

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowButton(false);
      localStorage.removeItem("canInstall");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      localStorage.removeItem("canInstall");
    }
    setDeferredPrompt(null);
    setShowButton(false);
    setModalOpen(false);
  };

  if (!showButton || isInstalled) return null;

  return (
    <>
      {/* Botón flotante siempre abajo a la derecha */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 w-[56px] h-[56px] rounded-full bg-gradient-to-tr from-[#338e7d] to-[#87cec1] flex items-center justify-center shadow-lg z-50 animate-pulse hover:scale-105 transition"
      >
        <QuestionMarkCircleIcon className="h-7 w-7 text-white animate-spin-slow" />
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#87cec1] text-white p-6 rounded-lg w-80 relative shadow-xl animate-fade-in">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-white hover:text-orange-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold mb-3">¿Instalar acceso directo?</h2>
            <p className="mb-5">
              Puedes agregar esta aplicación a tu pantalla de inicio para acceder más rápido.
            </p>
            <button
              onClick={handleInstallClick}
              className="bg-white text-orange-600 font-semibold px-4 py-2 rounded hover:bg-orange-100 transition w-full"
            >
              Instalar ahora
            </button>
          </div>
        </div>
      )}

      {/* Animaciones */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
