"use client";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/solid";

export default function AdminManager() {
  const [comunidad, setComunidad] = useState({ nombre: "", direccion: "" });
  const [comunidades, setComunidades] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [admin, setAdmin] = useState({ correo: "", comunidadId: "" });

  useEffect(() => {
    fetchComunidades();
  }, []);

  const fetchComunidades = async () => {
    const snapshot = await getDocs(collection(db, "comunidades"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComunidades(list);
  };

  const handleComunidadSubmit = async (e) => {
    e.preventDefault();
    if (!comunidad.nombre || !comunidad.direccion) return;

    if (editingId) {
      await updateDoc(doc(db, "comunidades", editingId), comunidad);
    } else {
      const newRef = doc(collection(db, "comunidades"));
      await setDoc(newRef, comunidad);
    }

    setComunidad({ nombre: "", direccion: "" });
    setEditingId(null);
    fetchComunidades();
  };

  const handleEditComunidad = (com) => {
    setComunidad({ nombre: com.nombre, direccion: com.direccion });
    setEditingId(com.id);
  };

  const handleDeleteComunidad = async (id) => {
    if (confirm("¿Eliminar comunidad?")) {
      await deleteDoc(doc(db, "comunidades", id));
      fetchComunidades();
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!admin.correo || !admin.comunidadId) return;

    await setDoc(doc(db, "admin", admin.correo), {
      comunidadId: admin.comunidadId,
      correo: admin.correo,
    });

    setAdmin({ correo: "", comunidadId: "" });
    alert("Administrador asignado correctamente");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <h2 className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
        <BuildingOffice2Icon className="h-7 w-7 text-blue-600" />
        Administrador de Comunidades
      </h2>

      {/* FORM AGREGAR/EDITAR COMUNIDAD */}
      <form onSubmit={handleComunidadSubmit} className="space-y-4 bg-gray-100 p-5 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Agregar Comunidad</h3>
        <input
          type="text"
          placeholder="Nombre de la comunidad"
          className="w-full px-4 py-2 border rounded text-black"
          value={comunidad.nombre}
          onChange={(e) =>
            setComunidad({ ...comunidad, nombre: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Dirección"
          className="w-full px-4 py-2 border rounded text-black"
          value={comunidad.direccion}
          onChange={(e) =>
            setComunidad({ ...comunidad, direccion: e.target.value })
          }
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editingId ? "Guardar cambios" : "Agregar comunidad"}
        </button>
      </form>

      {/* TABLA DE COMUNIDADES */}
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <h3 className="text-lg font-semibold px-4 py-3 bg-gray-200">
          Comunidades registradas
        </h3>
        <ul className="divide-y">
          {comunidades.map((c) => (
            <li
              key={c.id}
              className="flex justify-between items-center p-4 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-gray-700">{c.nombre}</p>
                <p className="text-sm text-gray-500">{c.direccion}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditComunidad(c)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDeleteComunidad(c.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* FORMULARIO ADMIN */}
      <form
        onSubmit={handleAdminSubmit}
        className="space-y-4 bg-gray-100 p-5 rounded-lg shadow"
      >
        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <UserPlusIcon className="h-5 w-5 text-green-600" />
          Agregar Administrador
        </h3>
        <input
          type="email"
          placeholder="Correo del administrador"
          className="w-full px-4 py-2 border rounded text-black"
          value={admin.correo}
          onChange={(e) => setAdmin({ ...admin, correo: e.target.value })}
        />
        <select
          className="w-full px-4 py-2 border rounded text-black"
          value={admin.comunidadId}
          onChange={(e) => setAdmin({ ...admin, comunidadId: e.target.value })}
        >
          <option value="">Selecciona comunidad</option>
          {comunidades.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Asignar administrador
        </button>
      </form>
    </div>
  );
}
