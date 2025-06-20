"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import {
  ArrowLeftIcon,
  TrashIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import KiyemtuainLoader from "../../app/components/Loader/KiyemtuainLoader";
import { Toaster, toast } from "react-hot-toast";
import DatePicker from "react-datepicker";

export default function AdministradorPage() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    rut: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    añoIngreso: "",
  });
  const [editingEmail, setEditingEmail] = useState(null);
  const [directiva, setDirectiva] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    cargo: "",
    año: "",
  });
  const [socios, setSocios] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const formRef = useRef(null); // <-- ref agregado para scroll
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/");
        return;
      }
      setUser(u);
      const adminRef = doc(db, "admin", u.email);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        setAuthorized(true);
        await fetchSocios();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchSocios = async () => {
    const snapshot = await getDocs(collection(db, "authorizedUsers"));
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSocios(users);
  };

  const handleAddAuthorizedUser = async (e) => {
    e.preventDefault();

    const q = query(
      collection(db, "authorizedUsers"),
      where("email", "==", form.email)
    );
    const r = query(
      collection(db, "authorizedUsers"),
      where("rut", "==", form.rut)
    );
    const emailSnap = await getDocs(q);
    const rutSnap = await getDocs(r);

    if (
      !form.email ||
      !form.rut ||
      !form.nombre ||
      !form.primerApellido ||
      !form.segundoApellido ||
      !form.añoIngreso
    ) {
      return toast.error("Por favor, completa todos los campos.");
    }

    if (!form.email.includes("@")) return toast.error("Correo inválido.");
    if (!/^[0-9kK\-\.]+$/.test(form.rut)) return toast.error("RUT inválido.");

    if (!editingEmail && !emailSnap.empty)
      return toast.error("Correo ya registrado.");
    if (!editingEmail && !rutSnap.empty)
      return toast.error("RUT ya registrado.");

    const docRef = doc(db, "authorizedUsers", form.email);

    if (editingEmail) {
      // Actualizar socio existente
      await updateDoc(doc(db, "authorizedUsers", editingEmail), form);
      setEditingEmail(null);
      toast.success("Socio actualizado correctamente");
    } else {
      // Agregar nuevo socio
      await setDoc(docRef, form);
      toast.success("Socio autorizado agregado");
    }

    setForm({
      rut: "",
      nombre: "",
      primerApellido: "",
      segundoApellido: "",
      email: "",
      añoIngreso: "",
    });

    await fetchSocios();
  };

  const handleDeleteSocio = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este socio?")) {
      await deleteDoc(doc(db, "authorizedUsers", id));
      toast.success("Socio eliminado correctamente");
      await fetchSocios();
    }
  };

  const handleEditSocio = (socio) => {
    setForm({
      rut: socio.rut ?? "",
      nombre: socio.nombre ?? "",
      primerApellido: socio.primerApellido ?? "",
      segundoApellido: socio.segundoApellido ?? "",
      email: socio.email ?? "",
      añoIngreso: socio.añoIngreso ?? "",
    });
    // Convierte el año en una fecha Date válida para el DatePicker
    setSelectedDate(new Date(`${socio.añoIngreso}-01-01`));

    setEditingEmail(socio.email);

    formRef.current?.scrollIntoView({ behavior: "smooth" }); // <--- scroll suave al formulario
  };

  const handleAddDirectiva = async (e) => {
    e.preventDefault();
    if (
      !directiva.nombre ||
      !directiva.apellidoPaterno ||
      !directiva.apellidoMaterno ||
      !directiva.cargo ||
      !directiva.año
    ) {
      return toast.error("Completa todos los campos de directiva.");
    }

    await setDoc(doc(collection(db, "directiva")), directiva);
    setDirectiva({
      nombre: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      cargo: "",
      año: "",
    });
    toast.success("Integrante de la directiva agregado");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <KiyemtuainLoader />
        <h1 className="text-black">Cargando...</h1>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-4 left-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full text-center border border-gray-300">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            Acceso denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para ver esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <style jsx global>{`
        input,
        textarea,
        select {
          border: 1px solid #cbd5e1;
          outline: none;
          border-radius: 0.375rem;
        }
        input::placeholder,
        textarea::placeholder {
          color: #9ca3af;
          opacity: 1;
        }
        input:focus,
        textarea:focus,
        select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
      `}</style>

      <div className="min-h-screen bg-white p-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Volver</span>
        </button>

        <h1 className="text-3xl text-black font-bold text-center mb-10">
          Panel de Administrador
        </h1>

        <div className="max-w-3xl mx-auto space-y-10">
          <div
            ref={formRef}
            className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-300"
          >
            <form onSubmit={handleAddAuthorizedUser} className="space-y-4">
              <h2 className=" text-black font-semibold mb-2">
                {editingEmail ? "Editar socio" : "Agregar nuevo socio"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Rut"
                  value={form.rut || ""}
                  onChange={(e) => setForm({ ...form, rut: e.target.value })}
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre"
                  value={form.nombre || ""}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Primer Apellido"
                  value={form.primerApellido || ""}
                  onChange={(e) =>
                    setForm({ ...form, primerApellido: e.target.value })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Segundo Apellido"
                  value={form.segundoApellido || ""}
                  onChange={(e) =>
                    setForm({ ...form, segundoApellido: e.target.value })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.email || ""}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="col-span-full px-3 py-2 w-full text-black"
                  required
                  disabled={!!editingEmail}
                />
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => {
                    setSelectedDate(date);
                    setForm({ ...form, añoIngreso: date.getFullYear() });
                  }}
                  showYearPicker
                  dateFormat="yyyy"
                  placeholderText="Año de ingreso"
                  className="border px-3 py-2 rounded text-black"
                  id="year"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {editingEmail ? "Guardar cambios" : "Agregar socio"}
              </button>
            </form>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-300">
            <h2 className=" text-black font-semibold mb-4">
              Socios registrados:
            </h2>
            {socios.length === 0 ? (
              <p className="text-gray-500">No hay socios registrados aún.</p>
            ) : (
              <ul className="space-y-4">
                {socios.map((socio, index) => (
                  <li
                    key={socio.id}
                    className="flex justify-between items-center p-4 bg-white rounded-lg shadow hover:shadow-md hover:bg-gray-50 transition-all duration-200 border border-gray-200"
                  >
                    <div className="text-gray-800 space-y-1">
                      <div>
                        <span className="font-semibold text-blue-600 mr-2">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Rut:</span> {socio.rut}
                      </div>
                      <div>
                        <span className="font-semibold">Nombre:</span>{" "}
                        {socio.nombre} {socio.primerApellido}{" "}
                        {socio.segundoApellido}
                      </div>
                      <div>
                        <span className="font-semibold">Año de ingreso:</span>{" "}
                        {socio.añoIngreso}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditSocio(socio)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Editar socio"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSocio(socio.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Eliminar socio"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-300">
            <form onSubmit={handleAddDirectiva} className="space-y-4">
              <h2 className=" text-black font-semibold mb-2">
                Agregar integrante de la directiva
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={directiva.nombre || ""}
                  onChange={(e) =>
                    setDirectiva({ ...directiva, nombre: e.target.value })
                  }
                  className="px-3 py-2 w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Primer Apellido"
                  value={directiva.apellidoPaterno || ""}
                  onChange={(e) =>
                    setDirectiva({
                      ...directiva,
                      apellidoPaterno: e.target.value,
                    })
                  }
                  className="px-3 py-2 w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Segundo Apellido"
                  value={directiva.apellidoMaterno || ""}
                  onChange={(e) =>
                    setDirectiva({
                      ...directiva,
                      apellidoMaterno: e.target.value,
                    })
                  }
                  className="px-3 py-2 w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Cargo"
                  value={directiva.cargo || ""}
                  onChange={(e) =>
                    setDirectiva({ ...directiva, cargo: e.target.value })
                  }
                  className="px-3 py-2 w-full"
                  required
                />
                <input
                  type="text"
                  placeholder="Año"
                  value={directiva.año || ""}
                  onChange={(e) =>
                    setDirectiva({ ...directiva, año: e.target.value })
                  }
                  className="px-3 py-2 w-full"
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Agregar directiva
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
