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

export default function Proyectos() {
  const [communityId, setCommunityId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    anio: "",
    archivos: [], // múltiples archivos
  });
  const [proyectos, setProyectos] = useState([]);
  const [anioFiltro, setAnioFiltro] = useState("Todos");
  const [userRole, setUserRole] = useState(null);

  // Cargar usuario por communityId
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
          console.error("Error obteniendo comunidad:", error);
        }
      } else {
        setUserRole(null);
        setCommunityId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Escuchar proyectos ordenados por fecha, solo con communityId
  useEffect(() => {
    if (!communityId) return;

    const q = query(
      collection(db, "proyectos"),
      where("communityId", "==", communityId),
      orderBy("fecha", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProyectos(datos);
    });

    return () => unsubscribe();
  }, [communityId]);

  // Extraer años únicos de los proyectos para filtro, tomando en cuenta 'anio' y 'fecha'
  const años = [
    "Todos",
    ...Array.from(
      new Set(
        proyectos.flatMap((p) => {
          const años = [];
          if (p.anio) años.push(Number(p.anio));
          if (p.fecha) años.push(p.fecha.toDate().getFullYear());
          return años;
        })
      )
    ).sort((a, b) => b - a),
  ];

  // Manejo de formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "archivos") {
      // Validar todos los archivos seleccionados son PDF
      const validFiles = [];
      for (let i = 0; i < files.length; i++) {
        if (files[i].type !== "application/pdf") {
          alert("Solo se permiten archivos PDF.");
          return;
        }
        validFiles.push(files[i]);
      }
      setFormData((prev) => ({
        ...prev,
        archivos: [...prev.archivos, ...validFiles], // agregar sin borrar los previos
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Remover archivo agregado antes de subir
  const handleRemoveArchivo = (index) => {
    setFormData((prev) => {
      const nuevosArchivos = [...prev.archivos];
      nuevosArchivos.splice(index, 1);
      return { ...prev, archivos: nuevosArchivos };
    });
  };

  // Submit: subir uno o más PDFs
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.archivos.length === 0)
      return alert("Debes subir al menos un archivo PDF.");

    try {
      // Subir archivos uno a uno
      const urls = [];
      for (const archivo of formData.archivos) {
        const storageRef = ref(
          storage,
          `proyectos/${Date.now()}_${archivo.name}`
        );
        await uploadBytes(storageRef, archivo);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }

      await addDoc(collection(db, "proyectos"), {
        nombre: formData.nombre,
        anio: Number(formData.anio),
        archivosURLs: urls,
        fecha: Timestamp.now(),
        communityId: communityId,
      });

      setFormData({ nombre: "", anio: "", archivos: [] });
      setModalOpen(false);
    } catch (error) {
      console.error("Error al subir el proyecto:", error);
      alert("Hubo un error al subir los documentos del proyecto.");
    }
  };

  // Eliminar proyecto (solo admin)
  const handleEliminar = async (id) => {
    if (userRole !== "admin") {
      alert("No tienes permisos para eliminar este proyecto.");
      return;
    }
    if (confirm("¿Estás seguro de eliminar este proyecto?")) {
      try {
        await deleteDoc(doc(db, "proyectos", id));
      } catch (error) {
        console.error("Error al eliminar el proyecto:", error);
        alert("Error al eliminar el proyecto.");
      }
    }
  };

  // Filtrar por año
  const proyectosFiltrados =
    anioFiltro === "Todos"
      ? proyectos
      : proyectos.filter((p) => {
          const anioProyecto = p.anio
            ? Number(p.anio)
            : p.fecha
            ? p.fecha.toDate().getFullYear()
            : null;
          return anioProyecto === Number(anioFiltro);
        });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Proyectos</h1>

      {/* Filtro por año */}
      <div className="mb-6 overflow-x-hidden">
        <label className="block mb-2 text-gray-700 font-medium">
          Filtrar por año:
        </label>
        <select
          value={anioFiltro}
          onChange={(e) => setAnioFiltro(e.target.value)}
          className="w-auto max-w-full md:w-1/3 border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {años.map((anio) => (
            <option key={anio} value={anio}>
              {anio}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-medium">
            <tr>
              <th className="px-6 py-3 text-left">Nombre</th>
              <th className="px-6 py-3 text-left">Año</th>
              <th className="px-6 py-3 text-left">Fecha subida</th>
              <th className="px-6 py-3 text-left">Archivos</th>
              <th className="px-6 py-3 text-center">Acciones</th>
              <th className="px-6 py-3 text-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-white bg-green-600 hover:bg-green-700 transition px-3 py-1 rounded-full font-bold text-xl select-none"
                  aria-label="Agregar proyecto"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {proyectosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No hay proyectos en este año.
                </td>
              </tr>
            ) : (
              proyectosFiltrados.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 text-gray-800">{doc.nombre}</td>
                  <td className="px-6 py-4 text-gray-800">
                    {doc.anio || doc.fecha?.toDate().getFullYear()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {doc.fecha?.toDate().toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-6 py-4">
                    {doc.archivosURLs?.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 underline hover:text-blue-800"
                      >
                        Ver PDF {i + 1}
                      </a>
                    ))}
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
            onClick={() => setModalOpen(false)}
          />
          <form
            onSubmit={handleSubmit}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // evitar cerrar modal si clickeas dentro
          >
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Subir proyecto
            </h2>

            <div className="mb-4">
              <label
                htmlFor="nombre"
                className="block text-gray-700 font-medium mb-1"
              >
                Nombre del proyecto
              </label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="anio"
                className="block text-gray-700 font-medium mb-1"
              >
                Año
              </label>
              <input
                id="anio"
                type="number"
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                placeholder="Ejemplo: 2023"
                min="1900"
                max="2100"
                className="w-full border border-gray-300 rounded px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="archivos"
                className="block text-gray-700 font-medium mb-1"
              >
                Archivos PDF
              </label>
              <input
                id="archivos"
                type="file"
                accept=".pdf"
                multiple
                name="archivos"
                onChange={handleChange}
                className="w-full border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 file:hover:bg-green-200"
              />
              {/* Lista de archivos a subir */}
              {formData.archivos.length > 0 && (
                <ul className="mt-2 max-h-28 overflow-auto border border-gray-300 rounded p-2">
                  {formData.archivos.map((file, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center text-sm text-gray-700 border-b last:border-b-0 py-1"
                    >
                      <span>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArchivo(index)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                        aria-label={`Eliminar archivo ${file.name}`}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Subir proyecto
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
