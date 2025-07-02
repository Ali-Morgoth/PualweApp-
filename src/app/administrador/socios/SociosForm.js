"use client";

import { useEffect, useState, useRef } from "react";
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
import { db } from "@/app/lib/firebase";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";

export default function SociosForm() {
  const [form, setForm] = useState({
    rut: "",
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    email: "",
    añoIngreso: "",
  });
  const [editingEmail, setEditingEmail] = useState(null);
  const [socios, setSocios] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [communityId, setCommunityId] = useState(null);
  const [communityName, setCommunityName] = useState("");
  const formRef = useRef(null);

  // Nueva función para obtener el nombre de comunidad por su id
  const fetchCommunityNameById = async (id) => {
    if (!id) return "";
    try {
      const communityDocSnap = await getDoc(doc(db, "comunidades", id));
      if (communityDocSnap.exists()) {
        const communityData = communityDocSnap.data();
        return communityData.nombre || "";
      }
      return "";
    } catch {
      return "";
    }
  };

  const fetchSocios = async (communityId) => {
    if (!communityId) return;

    const q = query(
      collection(db, "authorizedUsers"),
      where("communityId", "==", communityId)
    );
    const snapshot = await getDocs(q);
    const usersRaw = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Para cada socio, traemos el nombre de su comunidad para mostrar
    const usersWithCommunityName = await Promise.all(
      usersRaw.map(async (user) => {
        const nombreComunidad = await fetchCommunityNameById(user.communityId);
        return { ...user, communityName: nombreComunidad };
      })
    );

    setSocios(usersWithCommunityName);
  };

  useEffect(() => {
    const fetchCommunity = async () => {
      const { auth } = await import("@/app/lib/firebase");
      auth.onAuthStateChanged(async (user) => {
        if (!user) return;

        try {
          const userDocSnap = await getDoc(
            doc(db, "authorizedUsers", user.email)
          );
          if (!userDocSnap.exists()) return;

          const userData = userDocSnap.data();
          const communityId = userData.communityId;
          setCommunityId(communityId);

          if (!communityId) return;

          const communityDocRef = doc(db, "comunidades", communityId);
          const communityDocSnap = await getDoc(communityDocRef);

          if (communityDocSnap.exists()) {
            const communityData = communityDocSnap.data();
            setCommunityName(communityData.nombre || "");
          }

          await fetchSocios(communityId);
        } catch (error) {
          console.error("Error obteniendo comunidad:", error);
        }
      });
    };

    fetchCommunity();
  }, []);

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
    const formWithCommunity = { ...form, communityId };

    if (editingEmail) {
      await updateDoc(
        doc(db, "authorizedUsers", editingEmail),
        formWithCommunity
      );
      setEditingEmail(null);
      toast.success("Socio actualizado correctamente");
    } else {
      await setDoc(docRef, formWithCommunity);
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
    setSelectedDate(null);
    await fetchSocios(communityId);
  };

  const handleDeleteSocio = async (id) => {
    if (confirm("¿Seguro que deseas eliminar este socio?")) {
      await deleteDoc(doc(db, "authorizedUsers", id));
      toast.success("Socio eliminado correctamente");
      await fetchSocios(communityId);
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
    setSelectedDate(new Date(`${socio.añoIngreso}-01-01`));
    setEditingEmail(socio.email);
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-10">
      {/* Formulario */}
      <div
        className="bg-gray-100 p-6 rounded-lg shadow-xl border border-gray-300 max-w-4xl mx-auto"
        ref={formRef}
      >
        <form onSubmit={handleAddAuthorizedUser} className="space-y-4">
          <h2 className="text-black font-semibold mb-2">
            {editingEmail ? "Editar socio" : "Agregar nuevo socio"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Rut"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              className="px-3 py-2 text-black"
              required
            />
            <input
              type="text"
              placeholder="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="px-3 py-2 text-black"
              required
            />
            <input
              type="text"
              placeholder="Primer Apellido"
              value={form.primerApellido}
              onChange={(e) =>
                setForm({ ...form, primerApellido: e.target.value })
              }
              className="px-3 py-2 text-black"
              required
            />
            <input
              type="text"
              placeholder="Segundo Apellido"
              value={form.segundoApellido}
              onChange={(e) =>
                setForm({ ...form, segundoApellido: e.target.value })
              }
              className="px-3 py-2 text-black"
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="col-span-full px-3 py-2 text-black"
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
              className="px-3 py-2 text-black"
            />
            <div className="flex items-center col-span-full space-x-2 ml-4">
              <label className="text-black font-medium whitespace-nowrap">
                Comunidad:
              </label>
              <input
                type="text"
                value={communityName}
                readOnly
                disabled
                className="px-3 py-2 text-black bg-gray-200 cursor-not-allowed w-auto min-w-[150px]"
                placeholder="Comunidad"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingEmail ? "Guardar cambios" : "Agregar socio"}
          </button>
        </form>
      </div>

      {/* Lista de socios */}
      <div className="bg-gray-100 p-6 rounded-lg shadow-xl border border-gray-300 max-w-4xl mx-auto">
        <h2 className="text-black font-semibold mb-4">Socios registrados:</h2>
        {socios.length === 0 ? (
          <p className="text-gray-500">No hay socios registrados aún.</p>
        ) : (
          <ul className="space-y-4">
            {socios.map((socio, index) => (
              <li
                key={socio.id}
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow border border-gray-200"
              >
                <div className="text-gray-800">
                  <p>
                    <strong>#{index + 1}</strong>
                  </p>
                  <p>
                    <strong>Nombre:</strong> {socio.nombre}{" "}
                    {socio.primerApellido} {socio.segundoApellido}
                  </p>
                  <p>
                    <strong>Rut:</strong> {socio.rut}
                  </p>
                  <p>
                    <strong>Año Ingreso:</strong> {socio.añoIngreso}
                  </p>
                  <p>
                    <strong>Comunidad:</strong> {socio.communityName || "—"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEditSocio(socio)} title="Editar">
                    <PencilIcon className="w-5 h-5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteSocio(socio.id)}
                    title="Eliminar"
                  >
                    <TrashIcon className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
