"use client";

import { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import { toast, Toaster } from "react-hot-toast";
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline";
import { db } from "@/app/lib/firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function DirectivaForm() {
  const [directivaForm, setDirectivaForm] = useState({
    presidente: { rut: "", nombre: "" },
    vicepresidente: { rut: "", nombre: "" },
    secretario: { rut: "", nombre: "" },
    consejero1: { rut: "", nombre: "" },
    fechaInicio: "",
    fechaFin: "",
  });

  const [directivas, setDirectivas] = useState([]);
  const [editingDirectivaId, setEditingDirectivaId] = useState(null);
  const [comunidadNombre, setComunidadNombre] = useState("");
  const [communityId, setCommunityId] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    getComunidadNombreDelAdmin();
  }, []);

  const getComunidadNombreDelAdmin = async () => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const adminDoc = await getDoc(doc(db, "admin", user.email));
        if (adminDoc.exists()) {
          const { communityId } = adminDoc.data();
          setCommunityId(communityId);

          const comunidadDoc = await getDoc(doc(db, "comunidades", communityId));
          if (comunidadDoc.exists()) {
            const { nombre } = comunidadDoc.data();
            setComunidadNombre(nombre);
            fetchDirectivas(communityId); // fetch después de obtener el ID
          }
        }
      } catch (err) {
        console.error("Error al obtener nombre de comunidad:", err);
      }
    });
  };

const fetchDirectivas = async (communityIdActual) => {
  const directivaRef = collection(db, "directiva");
  const q = query(directivaRef, where("communityId", "==", communityIdActual));
  const snapshot = await getDocs(q);

  const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  setDirectivas(list);
};

  const handleAddDirectiva = async (e) => {
    e.preventDefault();
    const {
      presidente,
      vicepresidente,
      secretario,
      consejero1,
      fechaInicio,
      fechaFin,
    } = directivaForm;

    if (
      !presidente.rut ||
      !presidente.nombre ||
      !vicepresidente.rut ||
      !vicepresidente.nombre ||
      !secretario.rut ||
      !secretario.nombre ||
      !consejero1.rut ||
      !consejero1.nombre ||
      !fechaInicio ||
      !fechaFin
    ) {
      return toast.error("Completa todos los campos de la directiva.");
    }

    const validateRut = (rut) => /^[0-9kK\-\.]+$/.test(rut);
    if (!validateRut(presidente.rut)) return toast.error("RUT Presidente inválido.");
    if (!validateRut(vicepresidente.rut)) return toast.error("RUT Vicepresidente inválido.");
    if (!validateRut(secretario.rut)) return toast.error("RUT Secretario(a) inválido.");
    if (!validateRut(consejero1.rut)) return toast.error("RUT Consejero(a) 1 inválido.");

    try {
      if (editingDirectivaId) {
        await updateDoc(doc(db, "directiva", editingDirectivaId), {
          ...directivaForm,
          communityId,
          comunidadNombre,
        });
        toast.success("Directiva actualizada correctamente");
        setEditingDirectivaId(null);
      } else {
        const newDocRef = doc(collection(db, "directiva"));
        await setDoc(newDocRef, {
          ...directivaForm,
          communityId,
          comunidadNombre,
        });
        toast.success("Directiva guardada exitosamente");
      }

      setDirectivaForm({
        presidente: { rut: "", nombre: "" },
        vicepresidente: { rut: "", nombre: "" },
        secretario: { rut: "", nombre: "" },
        consejero1: { rut: "", nombre: "" },
        fechaInicio: "",
        fechaFin: "",
      });

      fetchDirectivas(communityId);
    } catch (error) {
      console.error("Error al guardar la directiva:", error);
      toast.error("Error al guardar la directiva.");
    }
  };

  const handleEditDirectiva = (directiva) => {
    setDirectivaForm({
      presidente: directiva.presidente,
      vicepresidente: directiva.vicepresidente,
      secretario: directiva.secretario,
      consejero1: directiva.consejero1,
      fechaInicio: directiva.fechaInicio,
      fechaFin: directiva.fechaFin,
    });
    setEditingDirectivaId(directiva.id);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteDirectiva = async (id) => {
    if (confirm("¿Seguro que deseas eliminar esta directiva?")) {
      await deleteDoc(doc(db, "directiva", id));
      toast.success("Directiva eliminada correctamente");
      await fetchDirectivas(communityId);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-10">
        {/* Formulario de Directiva */}
        <div
          ref={formRef}
          className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-300 max-w-4xl mx-auto"
        >
          <form onSubmit={handleAddDirectiva} className="space-y-4">
            <h2 className="text-black font-semibold mb-2">
              {editingDirectivaId ? "Editar directiva" : "Agregar nueva directiva"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["presidente", "vicepresidente", "secretario", "consejero1"].map((rol) => (
                <div key={rol} className="contents">
                  <input
                    type="text"
                    placeholder={`RUT ${rol}`}
                    value={directivaForm[rol].rut}
                    onChange={(e) =>
                      setDirectivaForm({
                        ...directivaForm,
                        [rol]: {
                          ...directivaForm[rol],
                          rut: e.target.value,
                        },
                      })
                    }
                    className="px-3 py-2 text-black"
                    required
                  />
                  <input
                    type="text"
                    placeholder={`Nombre completo ${rol}`}
                    value={directivaForm[rol].nombre}
                    onChange={(e) =>
                      setDirectivaForm({
                        ...directivaForm,
                        [rol]: {
                          ...directivaForm[rol],
                          nombre: e.target.value,
                        },
                      })
                    }
                    className="px-3 py-2 text-black"
                    required
                  />
                </div>
              ))}

              <input
                type="date"
                placeholder="Fecha inicio"
                value={directivaForm.fechaInicio}
                onChange={(e) =>
                  setDirectivaForm({
                    ...directivaForm,
                    fechaInicio: e.target.value,
                  })
                }
                className="px-3 py-2 text-black"
                required
              />
              <input
                type="date"
                placeholder="Fecha fin"
                value={directivaForm.fechaFin}
                onChange={(e) =>
                  setDirectivaForm({
                    ...directivaForm,
                    fechaFin: e.target.value,
                  })
                }
                className="px-3 py-2 text-black"
                required
              />
            </div>

            <div className="flex items-center col-span-full space-x-2 ml-4">
              <label className="text-black font-medium whitespace-nowrap">Comunidad:</label>
              <input
                type="text"
                value={comunidadNombre}
                readOnly
                disabled
                className="px-3 py-2 text-black bg-gray-200 cursor-not-allowed w-auto min-w-[150px]"
                placeholder="Comunidad"
              />
            </div>

            <button
              type="submit"
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingDirectivaId ? "Guardar cambios" : "Agregar directiva"}
            </button>
          </form>
        </div>

        {/* Lista de Directivas */}
        <div className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-300 max-w-4xl mx-auto">
          <h2 className="text-black font-semibold mb-4">Directivas registradas:</h2>
          {directivas.length === 0 ? (
            <p className="text-gray-500">No hay directivas registradas aún.</p>
          ) : (
            <ul className="space-y-4">
              {directivas.map((dir, index) => (
                <li
                  key={dir.id}
                  className="bg-white p-4 rounded shadow border border-gray-200 flex justify-between items-center"
                >
                  <div className="text-gray-800 space-y-2">
                    <div className="text-blue-600 font-bold">#{index + 1}</div>
                    <div><strong>Presidente:</strong> {dir.presidente?.nombre || "N/A"} ({dir.presidente?.rut || "N/A"})</div>
                    <div><strong>Vicepresidente:</strong> {dir.vicepresidente?.nombre || "N/A"} ({dir.vicepresidente?.rut || "N/A"})</div>
                    <div><strong>Secretario(a):</strong> {dir.secretario?.nombre || "N/A"} ({dir.secretario?.rut || "N/A"})</div>
                    <div><strong>Consejero(a) 1:</strong> {dir.consejero1?.nombre || "N/A"} ({dir.consejero1?.rut || "N/A"})</div>
                    <div><strong>Inicio:</strong> {dir.fechaInicio || "N/A"} — <strong>Fin:</strong> {dir.fechaFin || "N/A"}</div>
                    <input
                      type="text"
                      value={dir.comunidadNombre || comunidadNombre}
                      readOnly
                      disabled
                      className="px-2 py-1 text-black bg-gray-200 text-sm mt-2"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEditDirectiva(dir)}
                      className="text-blue-600 hover:text-blue-800 transition"
                      title="Editar directiva"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDirectiva(dir.id)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Eliminar directiva"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
