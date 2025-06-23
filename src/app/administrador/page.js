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
        await fetchSocios();
        await fetchDirectivas(); // <-- agregar aquí
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

  const fetchDirectivas = async () => {
    const snapshot = await getDocs(collection(db, "directiva"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setDirectivas(list);
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

    try {
      if (editingDirectivaId) {
        await updateDoc(
          doc(db, "directiva", editingDirectivaId),
          directivaForm
        );
        toast.success("Directiva actualizada correctamente");
        setEditingDirectivaId(null);
      } else {
        await setDoc(doc(collection(db, "directiva")), directivaForm);
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

      fetchDirectivas();
    } catch (error) {
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
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              <h2 className="text-black font-semibold mb-2">
                Agregar nueva directiva
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Presidente */}
                <input
                  type="text"
                  placeholder="RUT Presidente"
                  value={directivaForm.presidente.rut}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      presidente: {
                        ...directivaForm.presidente,
                        rut: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre completo Presidente"
                  value={directivaForm.presidente.nombre}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      presidente: {
                        ...directivaForm.presidente,
                        nombre: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />

                {/* Vicepresidente */}
                <input
                  type="text"
                  placeholder="RUT Vicepresidente"
                  value={directivaForm.vicepresidente.rut}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      vicepresidente: {
                        ...directivaForm.vicepresidente,
                        rut: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre completo Vicepresidente"
                  value={directivaForm.vicepresidente.nombre}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      vicepresidente: {
                        ...directivaForm.vicepresidente,
                        nombre: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />

                {/* Secretario */}
                <input
                  type="text"
                  placeholder="RUT Secretario(a)"
                  value={directivaForm.secretario.rut}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      secretario: {
                        ...directivaForm.secretario,
                        rut: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre completo Secretario(a)"
                  value={directivaForm.secretario.nombre}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      secretario: {
                        ...directivaForm.secretario,
                        nombre: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />

                {/* Consejero */}
                <input
                  type="text"
                  placeholder="RUT Consejero(a) 1"
                  value={directivaForm.consejero1.rut}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      consejero1: {
                        ...directivaForm.consejero1,
                        rut: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Nombre completo Consejero(a) 1"
                  value={directivaForm.consejero1.nombre}
                  onChange={(e) =>
                    setDirectivaForm({
                      ...directivaForm,
                      consejero1: {
                        ...directivaForm.consejero1,
                        nombre: e.target.value,
                      },
                    })
                  }
                  className="px-3 py-2 w-full text-black"
                  required
                />

                {/* Fechas */}
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
                  className="px-3 py-2 w-full text-black "
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
                  className="px-3 py-2 w-full text-black"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Guardar directiva
              </button>
            </form>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-300 mt-10">
            <h2 className="text-black font-semibold mb-4">
              Directivas registradas:
            </h2>
            {directivas.length === 0 ? (
              <p className="text-gray-500">
                No hay directivas registradas aún.
              </p>
            ) : (
              <ul className="space-y-4">
                {directivas.map((dir, index) => (
                  <li
                    key={dir.id}
                    className="bg-white p-4 rounded shadow border border-gray-200"
                  >
                    <div className="text-gray-800 space-y-2">
                      <div className="text-blue-600 font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <strong>Presidente:</strong>{" "}
                        {dir.presidente?.nombre || "N/A"} (
                        {dir.presidente?.rut || "N/A"})
                      </div>
                      <div>
                        <strong>Vicepresidente:</strong>{" "}
                        {dir.vicepresidente?.nombre || "N/A"} (
                        {dir.vicepresidente?.rut || "N/A"})
                      </div>
                      <div>
                        <strong>Secretario(a):</strong>{" "}
                        {dir.secretario?.nombre || "N/A"} (
                        {dir.secretario?.rut || "N/A"})
                      </div>
                      <div>
                        <strong>Consejero(a) 1:</strong>{" "}
                        {dir.consejero1?.nombre || "N/A"} (
                        {dir.consejero1?.rut || "N/A"})
                      </div>
                      <div>
                        <strong>Inicio:</strong> {dir.fechaInicio || "N/A"} —{" "}
                        <strong>Fin:</strong> {dir.fechaFin || "N/A"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleEditDirectiva(dir)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
