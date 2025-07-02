"use client";

import { useEffect, useState } from "react";
import { db, storage } from "../../../lib/firebase";
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
  where
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Eventos() {
  const [communityId, setCommunityId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    archivo: null,
  });
  const [eventos, setEventos] = useState([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [userRole, setUserRole] = useState(null);

  // NUEVOS estados para loader y éxito
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const categoriasEventos = [
    "Todas",
    "Semana Cultural",
    "Ceremonias",
    "Encuentros",
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDoc = await getDoc(doc(db, "admin", user.email));
          if (adminDoc.exists()) {
            setUserRole("admin");
            setCommunityId(adminDoc.data().communityId);
          } else {
            const userDoc = await getDoc(
              doc(db, "authorizedUsers", user.email)
            );
            if (userDoc.exists()) {
              setUserRole("user");
              setCommunityId(userDoc.data().communityId);
            }
          }
        } catch (error) {
          console.error("Error verificando rol de usuario:", error);
          setUserRole("user");
        }
      } else {
        setUserRole(null);
        setCommunityId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!communityId) return;

    const q = query(
      collection(db, "eventos"),
      where("communityId", "==", communityId),
      orderBy("fecha", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((item) => item.communityId === communityId); // ✅ Filtro

      setEventos(datos);
    });

    return () => unsubscribe();
  }, [communityId]);

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

    setIsUploading(true); // Inicia loader

    try {
      const storageRef = ref(
        storage,
        `eventos/${Date.now()}_${formData.archivo.name}`
      );
      await uploadBytes(storageRef, formData.archivo);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "eventos"), {
        nombre: formData.nombre,
        categoria: formData.categoria,
        archivoURL: downloadURL,
        fecha: Timestamp.now(),
        communityId: communityId,
      });

      setFormData({ nombre: "", categoria: "", archivo: null });

      setUploadSuccess(true); // Mostrar mensaje éxito
      setIsUploading(false); // Termina loader

      // Cerrar modal luego de 2 segundos y ocultar mensaje
      setTimeout(() => {
        setUploadSuccess(false);
        setModalOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Error al subir el evento:", error);
      alert("Hubo un error al subir el documento del evento.");
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
        await deleteDoc(doc(db, "eventos", id));
      } catch (error) {
        console.error("Error al eliminar el documento:", error);
        alert("Error al eliminar el documento.");
      }
    }
  };

  const formatearFecha = (fecha) =>
    fecha?.toDate().toLocaleDateString("es-CL") || "";

  const eventosFiltrados =
    categoriaFiltro === "Todas"
      ? eventos
      : eventos.filter((e) => e.categoria === categoriaFiltro);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">
        Documentos de Eventos
      </h1>

      {/* Filtro por categoría */}
      <div className="mb-6 overflow-x-hidden">
        <label className="block mb-2 text-gray-700 font-medium">
          Filtrar por categoría:
        </label>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="w-auto max-w-full md:w-1/3 border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {categoriasEventos.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-medium">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Categoría</th>
              <th className="px-6 py-3 text-left">Fecha subida</th>
              <th className="px-6 py-3 text-left">Archivo</th>
              <th className="px-6 py-3 text-center">Acciones</th>
              <th className="px-6 py-3 text-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-white bg-green-600 hover:bg-green-700 transition px-3 py-1 rounded-full font-bold text-xl select-none"
                  aria-label="Agregar evento"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {eventosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No hay documentos en esta categoría.
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-800">{doc.nombre}</td>
                  <td className="px-6 py-4 text-gray-800">{doc.categoria}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatearFecha(doc.fecha)}
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={doc.archivoURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Ver PDF
                    </a>
                  </td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <button
                      onClick={() => handleEliminar(doc.id)}
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
            onClick={() => !isUploading && setModalOpen(false)}
          />
          <form
            onSubmit={handleSubmit}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Subir documento de evento
            </h2>

            {/* Mensaje éxito */}
            {uploadSuccess && (
              <div className="mb-4 text-green-700 font-semibold text-center">
                Documento subido exitosamente!
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="nombre"
                className="block text-gray-700 font-medium mb-1"
              >
                Nombre del documento
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                disabled={isUploading}
              />
            </div>

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
                className="w-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-black rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                required
                disabled={isUploading}
              >
                <option value="" disabled>
                  Seleccione una categoría
                </option>
                {categoriasEventos
                  .filter((c) => c !== "Todas")
                  .map((cat) => (
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

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => !isUploading && setModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={isUploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center gap-2"
                disabled={isUploading}
              >
                {isUploading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                ) : (
                  "Subir documento"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
