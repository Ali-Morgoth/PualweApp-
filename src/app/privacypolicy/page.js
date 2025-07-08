"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../app/lib/firebase"; // Ajusta la ruta según tu estructura

export default function PrivacyPolicy() {
  const router = useRouter();
  const [dashboardUrl, setDashboardUrl] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Consulta en authorizedUsers para obtener communityId basado en uid
          const q = query(
            collection(db, "authorizedUsers"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0].data();
            const communityId = userDoc.communityId;
            setDashboardUrl(`/dashboard/${communityId}`);
          } else {
            console.log("Usuario no autorizado o sin comunidad asignada.");
          }
        } catch (error) {
          console.error("Error obteniendo dashboard:", error);
        }
      } else {
        setDashboardUrl(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleBackClick = () => {
    if (dashboardUrl) {
      router.push(dashboardUrl);
    } else {
      router.back();
    }
  };

  const [visibleSections, setVisibleSections] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index"));
            setVisibleSections((prev) =>
              prev.includes(index) ? prev : [...prev, index]
            );
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const sections = document.querySelectorAll(".fade-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <main className="relative min-h-screen py-16 bg-gray-50">
      {/* Botón regresar */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBackClick}
          aria-label="Volver al dashboard"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <ArrowLeftIcon className="h-6 w-6 text-blue-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Contenedor central */}
      <div className="relative max-w-3xl mx-auto px-4">
        {/* Línea vertical que inicia más abajo */}
        <div className="absolute top-[120px] left-1/2 transform -translate-x-1/2 h-[calc(100%-120px)] w-0.5 bg-green-200 rounded z-0" />

        {/* Título */}
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Política de Privacidad – Pualwe App
        </h1>
      

        {/* Timeline sections */}
        {[
          {
            title: "1. Introducción",
            content: (
              <>
                Esta Política de Privacidad describe cómo{" "}
                <strong>Pualwe App</strong>, desarrollado por el analista de
                sistemas y programador Alian Andahur, recopila, utiliza y
                protege la información que proporcionan los usuarios dentro del
                sistema. Esta plataforma está diseñada para el uso exclusivo de
                comunidades indígenas, resguardando tanto la información privada
                como los contenidos compartidos de manera pública.
              </>
            ),
          },
          {
            title: "2. Responsable del tratamiento de datos",
            content: (
              <>
                Nombre: Alian Andahur Colpiante Rumian <br />
                Sitio web:{" "}
                <a
                  href="https://alian-andahur.vercel.app"
                  className="text-blue-600 hover:underline"
                >
                  https://alian-andahur.vercel.app
                </a>
              </>
            ),
          },
          {
            title: "3. Datos que se recopilan",
            content: (
              <>
                <ul className="list-disc list-inside">
                  <li>Nombre de usuario o comunidad</li>
                  <li>Correo electrónico (para autenticación)</li>
                  <li>
                    Documentos subidos por las comunidades (Exclusivamente archivos .PDF los cuales contienen textos e imagenes ) solo visibles para socios de una comunidad
                    permaneciendo esta completamente privada a excepción de los
                    libros
                  </li>
                  <li>Datos técnicos (IP, navegador, dispositivo)</li>
                </ul>
                <p className="mt-2">
                  No se recopilan datos sensibles sin consentimiento expreso.
                </p>
              </>
            ),
          },
          {
            title: "4. Finalidad del tratamiento",
            content: (
              <>
                <p>Los datos son tratados con los siguientes fines:</p>
                <ul className="list-disc list-inside">
                  <li>Brindar acceso seguro al sistema</li>
                  <li>Gestionar y almacenar la documentación comunitaria</li>
                  <li>Mantener una biblioteca pública accesible</li>
                  <li>
                    Garantizar el funcionamiento correcto de la plataforma
                  </li>
                </ul>
              </>
            ),
          },
          {
            title: "5. Almacenamiento y seguridad",
            content: (
              <p>
                La información se almacena en servicios de nube{" "}
                <strong> Firebase (Google)</strong>, los cuales cuentan con
                altos estándares de seguridad. Se implementan medidas técnicas y
                organizativas para proteger los datos frente a accesos no
                autorizados.
              </p>
            ),
          },
          {
            title: "6. Compartición de datos",
            content: (
              <ul className="list-disc list-inside">
                <li>No se comparten datos con terceros.</li>
                <li>
                  La biblioteca pública contiene solo documentos autorizados por
                  cada comunidad.
                </li>
                <li>
                  Los documentos privados permanecen bajo control exclusivo de
                  cada comunidad.
                </li>
              </ul>
            ),
          },
          {
            title: "7. Derechos de los usuarios",
            content: (
              <>
                <p>
                  En virtud de la Ley N° 19.628 (Chile), los usuarios tienen
                  derecho a:
                </p>
                <ul className="list-disc list-inside">
                  <li>Acceder a sus datos personales</li>
                  <li>Rectificar o eliminar su información</li>
                  <li>Retirar el consentimiento en cualquier momento</li>
                </ul>
                <p>   Para ejecer estos derechos contacta a:</p>
                <a
                    href="https://alian-andahur.vercel.app"
                    className="text-blue-600 hover:underline"
                  >  
                    https://alian-andahur.vercel.app
                  </a>
              </>
            ),
          },
          {
            title: "8. Cookies y tecnologías similares",
            content: (
              <p>
                Pualwe App no utiliza cookies con fines de marketing. Solo se
                utilizan cookies esenciales para el funcionamiento del sistema y
                la autenticación.
              </p>
            ),
          },
          {
            title: "9. Cambios en esta política",
            content: (
              <p>
                Esta Política podrá ser actualizada en el futuro. Los cambios
                serán comunicados mediante el sitio web o directamente dentro de
                la aplicación.
              </p>
            ),
          },
          {
            title: "10. Protección de menores",
            content: (
              <p>
                Pualwe App en su sección intranet privada no está dirigida a menores de edad. No recopilamos
                intencionalmente información de niños sin el consentimiento
                verificable de sus padres o tutores. Si tienes conocimiento de
                que un menor ha proporcionado información personal sin
                autorización, por favor contáctanos para eliminarla.
              </p>
            ),
          },

          {
            title: "11. Contacto",
            content: (
              <>
                <p>
                  Si tienes dudas sobre esta política, puedes escribir a:
                  <br />
                  <strong>Alian Andahur</strong>
                  <br />
                  Sitio web:{" "}
                  <a
                    href="https://alian-andahur.vercel.app"
                    className="text-blue-600 hover:underline"
                  >
                    https://alian-andahur.vercel.app
                  </a>
                </p>
              </>
            ),
          },
        ].map((item, index) => (
          <div
            key={index}
            data-index={index}
            className={`relative mb-12 w-full flex fade-section transition-all duration-700 ease-out transform ${
              index % 2 === 0 ? "justify-start" : "justify-end"
            } ${
              visibleSections.includes(index)
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            {/* Punto circular */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-7 w-1.5 h-1.5 bg-green-300 rounded-full z-20" />

            {/* Contenido */}
            <div className="w-full sm:w-[90%] lg:w-[70%] bg-white border border-gray-200 rounded-lg p-6 shadow-md relative z-10">
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <div className="text-gray-700 text-sm">{item.content}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
