"use client";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  BuildingOffice2Icon,
  ArrowLeftIcon,
} from "@heroicons/react/24/solid";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminManager() {
  const [comunidad, setComunidad] = useState({
    nombre: "",
    direccion: "",
    rut: "",
  });
  const [developerData, setDeveloperData] = useState(null);
  const router = useRouter();

  const [comunidades, setComunidades] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [admin, setAdmin] = useState({
    correo: "",
    communityId: "",
    rut: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    añoIngreso: "",
  });

  const [editingAdminOldEmail, setEditingAdminOldEmail] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [activeSection, setActiveSection] = useState("comunidades");

  const checkDeveloperDoc = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "developer", user.email);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setDeveloperData(snap.data());
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkDeveloperDoc(user.email);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchComunidades();
    fetchAdmins();
  }, []);

  const fetchComunidades = async () => {
    const snapshot = await getDocs(collection(db, "comunidades"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComunidades(list);
  };

  const fetchAdmins = async () => {
    const snapshot = await getDocs(collection(db, "admin"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAdmins(list);
  };

  const handleComunidadSubmit = async (e) => {
    e.preventDefault();
    if (!comunidad.nombre || !comunidad.direccion || !comunidad.rut) return;

    if (editingId) {
      await updateDoc(doc(db, "comunidades", editingId), comunidad);
    } else {
      const newRef = doc(collection(db, "comunidades"));
      await setDoc(newRef, comunidad);
    }

    setComunidad({ nombre: "", direccion: "", rut: "" });
    setEditingId(null);
    fetchComunidades();
  };

  const handleEditComunidad = (com) => {
    setComunidad({
      nombre: com.nombre || "",
      direccion: com.direccion || "",
      rut: com.rut || "",
    });
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
    const {
      correo,
      communityId,
      rut,
      nombre,
      primerApellido,
      segundoApellido,
      añoIngreso,
    } = admin;

    if (
      !correo ||
      !communityId ||
      !rut ||
      !nombre ||
      !primerApellido ||
      !añoIngreso
    ) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      if (editingAdminOldEmail && editingAdminOldEmail !== correo) {
        await deleteDoc(doc(db, "authorizedUsers", editingAdminOldEmail));
        await deleteDoc(doc(db, "admin", editingAdminOldEmail));
      }

      await setDoc(doc(db, "authorizedUsers", correo), {
        rut,
        nombre,
        primerApellido,
        segundoApellido,
        añoIngreso,
        communityId,
      });

      await setDoc(doc(db, "admin", correo), {
        correo,
        communityId,
      });

      alert("Administrador guardado correctamente.");
      setAdmin({
        correo: "",
        communityId: "",
        rut: "",
        nombre: "",
        primerApellido: "",
        segundoApellido: "",
        añoIngreso: "",
      });
      setEditingAdminOldEmail(null);
      fetchAdmins();
    } catch (error) {
      console.error("Error al guardar administrador:", error);
      alert("Error al guardar administrador.");
    }
  };

  const handleEditAdmin = async (adm) => {
    const userSnap = await getDoc(doc(db, "authorizedUsers", adm.correo));
    if (userSnap.exists()) {
      const data = userSnap.data();
      setAdmin({
        correo: adm.correo,
        communityId: adm.communityId,
        rut: data.rut || "",
        nombre: data.nombre || "",
        primerApellido: data.primerApellido || "",
        segundoApellido: data.segundoApellido || "",
        añoIngreso: data.añoIngreso || "",
      });
      setEditingAdminOldEmail(adm.correo);
    } else {
      alert("No se encontraron datos en authorizedUsers.");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (confirm("¿Eliminar administrador?")) {
      await deleteDoc(doc(db, "admin", id));
      await deleteDoc(doc(db, "authorizedUsers", id));
      fetchAdmins();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={() => router.push("/administrador")}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver</span>
        </button>
      </div>

      <div className="text-center mt-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Administrador de Comunidades
        </h2>
        <BuildingOffice2Icon className="h-7 w-7 text-blue-600 mx-auto mt-2" />
      </div>

      {developerData && (
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2 rounded-full shadow-md shadow-pink-500/40 inline-block fade-in-up">
            {developerData.nombre} {developerData.primerApellido}{" "}
            {developerData.segundoApellido}
          </p>
        </div>
      )}

      {/* BOTONES SWITCH */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveSection("comunidades")}
          className={`px-4 py-2 rounded-2xl ${
            activeSection === "comunidades"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Comunidades
        </button>
        <button
          onClick={() => setActiveSection("admins")}
          className={`px-4 py-2 rounded-2xl ${
            activeSection === "admins"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Administradores
        </button>
      </div>

      {/* SECCIÓN DE COMUNIDADES */}
      {activeSection === "comunidades" && (
        <>
          <form
            onSubmit={handleComunidadSubmit}
            className="space-y-4 bg-gray-100 p-5 rounded-lg shadow border"
          >
            <h3 className="text-lg font-semibold text-gray-700">
              Agregar Comunidad
            </h3>
            <input
              type="text"
              placeholder="RUT de la comunidad"
              className="w-full px-4 py-2 border rounded text-black"
              value={comunidad.rut}
              onChange={(e) =>
                setComunidad({ ...comunidad, rut: e.target.value })
              }
            />
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
                    <p className="text-sm text-gray-500 font-mono">
                      RUT: {c.rut || "N/A"}
                    </p>
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
        </>
      )}

      {/* SECCIÓN DE ADMINISTRADORES */}
      {activeSection === "admins" && (
        <>
          <form
            onSubmit={handleAdminSubmit}
            className="space-y-4 bg-gray-100 p-5 rounded-lg shadow border"
          >
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5 text-green-600" />
              {editingAdminOldEmail
                ? "Editar administrador"
                : "Agregar Administrador"}
            </h3>

            <input
              type="text"
              placeholder="RUT"
              className="w-full px-4 py-2 border rounded text-black"
              value={admin.rut}
              onChange={(e) => setAdmin({ ...admin, rut: e.target.value })}
            />
            <input
              type="text"
              placeholder="Nombre"
              className="w-full px-4 py-2 border rounded text-black"
              value={admin.nombre}
              onChange={(e) => setAdmin({ ...admin, nombre: e.target.value })}
            />
            <input
              type="text"
              placeholder="Primer Apellido"
              className="w-full px-4 py-2 border rounded text-black"
              value={admin.primerApellido}
              onChange={(e) =>
                setAdmin({ ...admin, primerApellido: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Segundo Apellido"
              className="w-full px-4 py-2 border rounded text-black"
              value={admin.segundoApellido}
              onChange={(e) =>
                setAdmin({ ...admin, segundoApellido: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Año de Ingreso"
              className="w-full px-4 py-2 border rounded text-black"
              value={admin.añoIngreso}
              onChange={(e) =>
                setAdmin({ ...admin, añoIngreso: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Correo del administrador"
              className="w-full px-4 py-2 border rounded text-black"
              value={admin.correo}
              onChange={(e) => setAdmin({ ...admin, correo: e.target.value })}
            />

            <select
              className="w-full px-4 py-2 border rounded text-black"
              value={admin.communityId}
              onChange={(e) =>
                setAdmin({ ...admin, communityId: e.target.value })
              }
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              {editingAdminOldEmail
                ? "Guardar cambios"
                : "Asignar administrador"}
            </button>

            {editingAdminOldEmail && (
              <button
                type="button"
                onClick={() => {
                  setAdmin({
                    correo: "",
                    communityId: "",
                    rut: "",
                    nombre: "",
                    primerApellido: "",
                    segundoApellido: "",
                    añoIngreso: "",
                  });
                  setEditingAdminOldEmail(null);
                }}
                className="bg-red-600 rounded px-4 py-2.5 ml-2 text-sm text-white hover:text-red-600"
              >
                Cancelar edición
              </button>
            )}
          </form>

          <div className="bg-white shadow rounded-lg overflow-hidden border">
            <h3 className="text-lg font-semibold px-4 py-3 bg-gray-200">
              Administradores asignados
            </h3>
            <ul className="divide-y">
              {admins.map((adm) => (
                <li
                  key={adm.id}
                  className="flex justify-between items-center p-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-semibold text-gray-700">{adm.correo}</p>
                    <p className="text-sm text-gray-500">
                      {comunidades.find((c) => c.id === adm.communityId)
                        ?.nombre || "Comunidad no encontrada"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAdmin(adm)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(adm.id)}
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
        </>
      )}
    </div>
  );
}
