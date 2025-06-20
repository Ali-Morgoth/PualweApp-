"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

export default function Ayuda() {
  const router = useRouter();

  const renderBullet = (text, color = "blue") => {
    const pClass = {
      blue: "alert-p-blue",
      orange: "alert-p-orange",
      red: "alert-p-red",
    }[color];

    const iconClass = {
      blue: "alert-icon-blue",
      orange: "alert-icon-orange",
      red: "alert-icon-red",
    }[color];

    return (
      <p className={pClass}>
        <svg
          stroke="currentColor"
          viewBox="0 0 24 24"
          fill="none"
          className={iconClass}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          ></path>
        </svg>
        {text}
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-[#f0f9f8] p-6 relative">
      <button
        onClick={() => router.push("/dashboard")}
        className="absolute top-6 left-6 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        aria-label="Volver al dashboard"
      >
        <ArrowLeftIcon className="w-6 h-6" />
        <span className="hidden sm:inline font-medium">Volver</span>
      </button>

      <h1 className="text-3xl font-bold text-center mt-6 mb-10">Centro de Ayuda</h1>

      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        {/* Cuadro 1 */}
        <div className="rounded-lg border border-stone bg-stone-100 p-6 shadow-lg space-y-2">
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-full bg-emerald-400 p-2 text-white">
              <InformationCircleIcon className="w-5 h-5" />
            </span>
            <p className="font-medium sm:text-lg text-emerald-600">¿De qué se trata la aplicación?</p>
          </div>
          <div className="space-y-2 mt-4">
            {renderBullet("Esta aplicación es un sistema orientado a brindar servicios para una biblioteca pública comunitaria.")}
            {renderBullet("Cuenta con una intranet diseñada para socios registrados, quienes pueden colaborar activamente con la plataforma.")}
            {renderBullet("Los socios tienen la capacidad de cargar libros a la biblioteca pública y documentos internos en distintas categorías.")}
            {renderBullet("Las categorías disponibles incluyen libros, documentos formales, de tesorería, proyectos y eventos, todos en formato PDF.")}
            {renderBullet("Los libros estarán disponibles para descarga pública y también para socios.")}
            {renderBullet("El resto de los documentos solo podrán ser descargados por los socios.")}
            {renderBullet("El administrador también puede agregar nuevos socios, eliminar socios o editar sus datos si estos lo requieren.")}
          </div>
        </div>

        {/* Cuadro 2 */}
        <div className="rounded-lg border border-stone bg-stone-100 p-6 shadow-lg space-y-2">
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-full bg-emerald-400 p-2 text-white">
              <Cog6ToothIcon className="w-5 h-5" />
            </span>
            <p className="font-medium sm:text-lg text-emerald-600">Funciones principales</p>
          </div>
          <div className="space-y-2 mt-4">
            {renderBullet("Visualizar y descargar libros en PDF para usuarios públicos y socios.")}
            {renderBullet("Acceder a documentos internos según su categoría, solo disponibles para los socios.")}
            {renderBullet("Subir nuevos documentos en las categorías establecidas mediante un formulario en el panel.")}
            {renderBullet("Visualizar una lista directiva cuyos integrantes solo pueden ser agregados por el administrador.")}
            {renderBullet("Aplicar filtros de búsqueda en todas las tablas del sistema para facilitar la navegación.")}
            {renderBullet("Administración de socios, incluyendo su edición o eliminación, a cargo exclusivo del administrador.", "orange")}
            {renderBullet("Solo el administrador del sistema tiene permisos para eliminar documentos.", "orange")}
            {renderBullet("La eliminación permanente de archivos es irreversible.", "red")}
            {renderBullet("Asegurar el cumplimiento de los permisos establecidos por cada tipo de documento.")}
          </div>
        </div>

        {/* Cuadro 3 */}
        <div className="rounded-lg border border-stone bg-stone-100 p-6 shadow-lg space-y-2">
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-full bg-emerald-400 p-2 text-white">
              <QuestionMarkCircleIcon className="w-5 h-5" />
            </span>
            <p className="font-medium sm:text-lg text-emerald-600">¿Cómo realizar ciertas acciones?</p>
          </div>
          <div className="space-y-2 mt-4">
            {renderBullet("Para subir un archivo PDF, el socio debe ir al menú Panel.")}
            {renderBullet("Dentro del panel, se debe localizar sección correspondiente a la categoría deseada.")}
            {renderBullet("En la tabla, hacer clic en el botón con símbolo (+) para desplegar el formulario de carga.")}
            {renderBullet("Completar los datos del formulario y seleccionar el archivo PDF a subir.")}
            {renderBullet("Se recomienda revisar cuidadosamente el archivo y datos del formulario antes de subirlo.", "red")}
            {renderBullet("Todos los documentos deben estar en formato PDF, sin excepciones.")}
            {renderBullet("Los documentos serán visibles según los permisos establecidos: libros para todos, otros documentos solo para socios.")}
            {renderBullet("Solo el administrador puede eliminar documentos cargados por error.", "orange")}
            {renderBullet("La lista de la directiva solo puede ser modificada por el administrador.", "orange")}
            {renderBullet("Eliminar documentos importantes puede afectar a la comunidad y sus socios.", "red")}
            {renderBullet("Todas las tablas cuentan con un filtro de búsqueda para facilitar el acceso a la información.")}
          </div>
        </div>
      </div>
    </div>
  );
}
