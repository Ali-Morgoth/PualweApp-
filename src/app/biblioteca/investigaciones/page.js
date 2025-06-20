"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ArrowLeftIcon, EyeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export default function Investigaciones() {
  const [libros, setLibros] = useState([]);

  useEffect(() => {
    const fetchLibros = async () => {
      const q = query(
        collection(db, "libros"),
        where("categoria", "==", "Investigaciones")
      );
      const querySnapshot = await getDocs(q);
      const librosFiltrados = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLibros(librosFiltrados);
    };

    fetchLibros();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-[#f0f9f860]">
      {/* Botón de volver */}
      <Link
        href="/biblioteca"
        className="inline-flex items-center text-white hover:text-blue-800 transition mb-4"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Volver atrás
      </Link>

      {/* Encabezado con estilo de libro */}
      <div className="flex justify-center mb-6">
        <div className="bg-white py-2 px-4 rounded-md shadow-lg flex justify-center items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 14"
            height="25"
            width="25"
          >
            <path
              fill="#FFA000"
              d="M16.2 1.75H8.1L6.3 0H1.8C0.81 0 0 0.7875 0 1.75V12.25C0 13.2125 0.81 14 1.8 14H15.165L18 9.1875V3.5C18 2.5375 17.19 1.75 16.2 1.75Z"
            ></path>
            <path
              fill="#FFCA28"
              d="M16.2 2H1.8C0.81 2 0 2.77143 0 3.71429V12.2857C0 13.2286 0.81 14 1.8 14H16.2C17.19 14 18 13.2286 18 12.2857V3.71429C18 2.77143 17.19 2 16.2 2Z"
            ></path>
          </svg>
          <h1 className="text-xl font-semibold text-gray-900">
            Investigaciones - Libros
          </h1>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
          <thead className="bg-green-100 text-green-900 uppercase text-sm">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left">Nombre</th>
              <th className="px-4 sm:px-6 py-3 text-left">Autor</th>
              <th className="px-4 sm:px-6 py-3 text-left">Ver PDF</th>
            </tr>
          </thead>
          <tbody>
            {libros.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-4 text-gray-500 text-center"
                >
                  No hay libros disponibles en esta categoría.
                </td>
              </tr>
            ) : (
              libros.map((libro) => (
                <tr
                  key={libro.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 sm:px-6 py-4 text-gray-800">
                    {libro.titulo}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-gray-800">
                    {libro.autor}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <a
                      href={libro.archivoURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium"
                    >
                      <EyeIcon className="h-5 w-5" />
                      <span className="hidden sm:inline">Ver PDF</span>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
