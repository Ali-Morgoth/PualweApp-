"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { UserGroupIcon, UsersIcon } from "@heroicons/react/24/solid";

export default function Directiva() {
  const [activeTab, setActiveTab] = useState("socios"); // 'socios' o 'directiva'
  const [socios, setSocios] = useState([]);
  const [directiva, setDirectiva] = useState([]);
  const [filtroAño, setFiltroAño] = useState("Todos");

  useEffect(() => {
    const fetchSocios = async () => {
      const snapshot = await getDocs(collection(db, "authorizedUsers"));
      const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSocios(users);
    };

    const fetchDirectiva = async () => {
      const snapshot = await getDocs(collection(db, "directiva"));
      const miembros = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDirectiva(miembros);
    };

    fetchSocios();
    fetchDirectiva();
  }, []);

  const añosUnicos = [
    ...new Set(directiva.map((miembro) => miembro.año).filter(Boolean)),
  ];

  const directivaFiltrada =
    filtroAño === "Todos"
      ? directiva
      : directiva.filter((m) => m.año === filtroAño);

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-extralight text-center text-black mb-10">
        Estructura Comunitaria
      </h1>

      {/* Switch Tabs con animación e iconos */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-200 rounded-full p-1 shadow-inner">
          <button
            onClick={() => setActiveTab("directiva")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ${
              activeTab === "directiva"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-300"
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
            Directiva
          </button>
          <button
            onClick={() => setActiveTab("socios")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ${
              activeTab === "socios"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-700 hover:bg-gray-300"
            }`}
          >
            <UsersIcon className="w-5 h-5" />
            Socios
          </button>
        </div>
      </div>

      {/* CONTENIDO SOCIOS */}
      {activeTab === "socios" && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-400 max-w-4xl mx-auto">
          <h2 className="text-black font-semibold mb-4">Socios registrados:</h2>
          {socios.length === 0 ? (
            <p className="text-gray-500">No hay socios registrados aún.</p>
          ) : (
            <ul className="space-y-4">
              {socios.map((socio, index) => (
                <li
                  key={socio.id}
                  className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300"
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

                  <CheckCircleIcon
                    className="w-6 h-6 text-green-600"
                    title="Socio verificado"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* CONTENIDO DIRECTIVA */}
      {activeTab === "directiva" && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-400 max-w-4xl mx-auto">
          <h2 className="text-black font-semibold mb-4">
            Miembros de la directiva:
          </h2>
          {directivaFiltrada.length === 0 ? (
            <p className="text-gray-500">No hay registros para este año.</p>
          ) : (
            <ul className="space-y-4">
              {directivaFiltrada.map((m, i) => (
                <li
                  key={m.id}
                  className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                >
                  <div className="text-gray-800">
                    <span className="font-semibold text-blue-600 mr-2">
                      #{i + 1}
                    </span>
                    {m.nombre} {m.apellidoPaterno} {m.apellidoMaterno} -{" "}
                    <span className="italic">{m.cargo}</span>
                  </div>
                  <div className="text-sm text-gray-500">{m.año}</div>
                </li>
              ))}
            </ul>
          )}

          {/* Filtro por año */}
          {añosUnicos.length > 0 && (
            <div className="mt-6 flex items-center gap-4">
              <label htmlFor="filtroAño" className="text-sm font-medium">
                Filtrar por año:
              </label>
              <select
                id="filtroAño"
                value={filtroAño}
                onChange={(e) => setFiltroAño(e.target.value)}
                className="px-3 py-2 border border-gray-400 rounded"
              >
                <option value="Todos">Todos</option>
                {añosUnicos.map((año) => (
                  <option key={año} value={año}>
                    {año}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
