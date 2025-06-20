"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../lib/firebase";
import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const categoriasDisponibles = [
  "Historia",
  "Investigaciones",
  "Cuentos y Leyendas",
  "Idioma",
  "Cosmovisión",
  "Arte y Música",
];

export default function Libros() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    autor: "",
    archivo: null,
    categoria: "",
  });
  const [libros, setLibros] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  // Estado para controlar el loader y mensaje éxito
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "admin", user.email));
          if (adminDoc.exists()) {
            setUserRole("admin");
          } else {
            setUserRole("user");
          }
        } catch (error) {
          console.error("Error verificando rol de usuario:", error);
          setUserRole("user");
        }
      } else {
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let q;
    if (categoriaFiltro) {
      q = query(
        collection(db, "libros"),
        where("categoria", "==", categoriaFiltro),
        orderBy("fecha", "desc")
      );
    } else {
      q = query(collection(db, "libros"), orderBy("fecha", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLibros(datos);
    });
    return () => unsubscribe();
  }, [categoriaFiltro]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "archivo") {
      if (files[0]?.type !== "application/pdf") {
        alert("Solo se permiten archivos PDF.");
        return;
      }
      setFormData({ ...formData, archivo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.archivo) return alert("Debes subir un archivo PDF.");
    if (!formData.categoria) return alert("Debes seleccionar una categoría.");

    setIsUploading(true);
    setUploadSuccess(false);

    try {
      const storageRef = ref(
        storage,
        `libros/${Date.now()}_${formData.archivo.name}`
      );
      await uploadBytes(storageRef, formData.archivo);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "libros"), {
        titulo: formData.titulo,
        autor: formData.autor,
        archivoURL: downloadURL,
        categoria: formData.categoria,
        fecha: Timestamp.now(),
      });

      setFormData({ titulo: "", autor: "", archivo: null, categoria: "" });
      setUploadSuccess(true);

      // Esperar 2 segundos para que usuario vea el mensaje
      setTimeout(() => {
        setModalOpen(false);
        setUploadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error al subir el libro:", error);
      alert("Hubo un error al subir el documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (userRole !== "admin") {
      alert("No tienes permisos para eliminar este documento.");
      return;
    }
    if (confirm("¿Estás seguro de eliminar este documento?")) {
      try {
        await deleteDoc(doc(db, "libros", id));
      } catch (error) {
        console.error("Error al eliminar el documento:", error);
        alert("Error al eliminar el documento.");
      }
    }
  };

  const formatearFecha = (fecha) =>
    fecha?.toDate().toLocaleDateString("es-CL") || "";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Libros PDF</h1>

      {/* Filtro de categorías */}
      <div className="mb-4">
        <label
          htmlFor="categoriaFiltro"
          className="block mb-1 font-semibold text-gray-700"
        >
          Filtrar por categoría:
        </label>
        <select
          id="categoriaFiltro"
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs text-black"
        >
          <option value="">Todas las categorías</option>
          {categoriasDisponibles.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-medium">
            <tr>
              <th className="px-6 py-3 text-left">Título</th>
              <th className="px-6 py-3 text-left">Autor</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              {/* nueva columna */}
              <th className="px-6 py-3 text-left">Fecha subida</th>
              <th className="px-6 py-3 text-left">Archivo</th>
              <th className="px-6 py-3 text-center">Acciones</th>
              <th className="px-6 py-3 text-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-white bg-green-600 hover:bg-green-700 transition px-3 py-1 rounded-full font-bold text-xl select-none"
                  aria-label="Agregar libro"
                  disabled={isUploading} // opcional: deshabilitar mientras sube
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {libros.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No hay libros subidos.
                </td>
              </tr>
            ) : (
              libros.map((libro) => (
                <tr
                  key={libro.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-800">{libro.titulo}</td>
                  <td className="px-6 py-4 text-gray-800">{libro.autor}</td>
                  <td className="px-6 py-4 text-gray-800">{libro.categoria}</td>
                  {/* muestra categoria */}
                  <td className="px-6 py-4 text-gray-600">
                    {formatearFecha(libro.fecha)}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={libro.archivoURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Ver PDF
                    </a>
                  </td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => handleEliminar(libro.id)}
                      className="text-red-600 hover:text-red-800 font-semibold"
                    >
                      Eliminar
                    </button>
                  </td>
                  <td></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => {
              if (!isUploading) {
                setModalOpen(false);
                setUploadSuccess(false);
              }
            }}
          />
          <form
            onSubmit={handleSubmit}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Subir libro PDF
            </h2>

            <div className="mb-4">
              <label
                htmlFor="titulo"
                className="block text-gray-700 font-medium mb-1"
              >
                Título
              </label>
              <input
                id="titulo"
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                disabled={isUploading}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="autor"
                className="block text-gray-700 font-medium mb-1"
              >
                Autor
              </label>
              <input
                id="autor"
                type="text"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                disabled={isUploading}
              />
            </div>

            {/* NUEVO CAMPO CATEGORÍA */}
            <div className="mb-4">
              <label
                htmlFor="categoria"
                className="block text-gray-700 font-medium mb-1"
              >
                Categoría
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                disabled={isUploading}
              >
                <option value="">Selecciona una categoría</option>
                {categoriasDisponibles.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label
                htmlFor="archivo"
                className="block text-gray-700 font-medium mb-1"
              >
                Archivo PDF
              </label>
              <input
                id="archivo"
                type="file"
                accept=".pdf"
                name="archivo"
                onChange={handleChange}
                className="w-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 file:hover:bg-green-200"
                required
                disabled={isUploading}
              />
            </div>

            {/* Mensaje de éxito */}
            {uploadSuccess && (
              <div className="mb-4 text-green-700 font-semibold text-center">
                Libro subido exitosamente!
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isUploading) {
                    setModalOpen(false);
                    setUploadSuccess(false);
                  }
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className={`px-4 py-2 rounded text-white transition 
                  ${isUploading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    Subiendo...
                  </span>
                ) : (
                  "Subir libro"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

