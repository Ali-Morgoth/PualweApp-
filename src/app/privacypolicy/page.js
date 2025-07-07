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

  return (
    <main className="max-w-3xl mx-auto p-6 text-justify text-gray-800 relative min-h-screen">
      {/* Contenedor para el botón fuera del main */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleBackClick}
          aria-label="Volver al dashboard"
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <ArrowLeftIcon className="h-6 w-6 text-blue-600 dark:text-gray-300" />
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-4 text-center">
        Política de Privacidad – Pualwe App
      </h1>
      <p className="mb-6 text-sm text-center text-gray-500">
        Fecha de última actualización: [Completa con la fecha actual]
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Introducción</h2>
        <p>
          Esta Política de Privacidad describe cómo <strong>Pualwe App</strong>,
          desarrollado por el analista de sistemas y programador Alian Andahur, recopila, utiliza y protege la
          información que proporcionan los usuarios dentro del sistema. Esta
          plataforma está diseñada para el uso exclusivo de comunidades
          indígenas, resguardando tanto la información privada como los
          contenidos compartidos de manera pública.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          2. Responsable del tratamiento de datos
        </h2>
        <p>
          Nombre: Alian Andahur Colpiante Rumian
          <br />
          Sitio web:{" "}
          <a
            href="https://alian-andahur.vercel.app"
            className="text-blue-600 hover:underline"
          >
            https://alian-andahur.vercel.app
          </a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          3. Datos que se recopilan
        </h2>
        <ul className="list-disc list-inside">
          <li>Nombre de usuario o comunidad</li>
          <li>Correo electrónico (para autenticación)</li>
          <li>
            Documentos subidos por las comunidades (PDF, imágenes, textos) solo
            visibles para socios de una comunidad permaneciendo esta
            completamente privada a excepción de los libros
          </li>
          <li>Datos técnicos (IP, navegador, dispositivo)</li>
        </ul>
        <p className="mt-2">
          No se recopilan datos sensibles sin consentimiento expreso.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          4. Finalidad del tratamiento
        </h2>
        <p>Los datos son tratados con los siguientes fines:</p>
        <ul className="list-disc list-inside">
          <li>Brindar acceso seguro al sistema</li>
          <li>Gestionar y almacenar la documentación comunitaria</li>
          <li>Mantener una biblioteca pública accesible</li>
          <li>Garantizar el funcionamiento correcto de la plataforma</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          5. Almacenamiento y seguridad
        </h2>
        <p>
          La información se almacena en servicios de nube{" "}
          <strong> Firebase (Google)</strong>, los cuales cuentan con altos
          estándares de seguridad. Se implementan medidas técnicas y
          organizativas para proteger los datos frente a accesos no autorizados.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Compartición de datos</h2>
        <ul className="list-disc list-inside">
          <li>No se comparten datos con terceros.</li>
          <li>
            La biblioteca pública contiene solo documentos autorizados por cada
            comunidad.
          </li>
          <li>
            Los documentos privados permanecen bajo control exclusivo de cada
            comunidad.
          </li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          7. Derechos de los usuarios
        </h2>
        <p>
          En virtud de la Ley N° 19.628 (Chile), los usuarios tienen derecho a:
        </p>
        <ul className="list-disc list-inside">
          <li>Acceder a sus datos personales</li>
          <li>Rectificar o eliminar su información</li>
          <li>Retirar el consentimiento en cualquier momento</li>
        </ul>
        <p className="mt-2">
          Para ejercer estos derechos, contacta a: alian.andahur.lml@gmail.com
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          8. Cookies y tecnologías similares
        </h2>
        <p>
          Pualwe App no utiliza cookies con fines de marketing. Solo se utilizan
          cookies esenciales para el funcionamiento del sistema y la
          autenticación.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          9. Cambios en esta política
        </h2>
        <p>
          Esta Política podrá ser actualizada en el futuro. Los cambios serán
          comunicados mediante el sitio web o directamente dentro de la
          aplicación.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">10. Contacto</h2>
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
      </section>
    </main>
  );
}
