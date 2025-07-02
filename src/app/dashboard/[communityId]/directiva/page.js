"use client";

import { useEffect, useState } from "react";
import {
  getDocs,
  collection,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../../lib/firebase";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

export default function Directiva() {
  const [activeTab, setActiveTab] = useState("socios");
  const [socios, setSocios] = useState([]);
  const [directivas, setDirectivas] = useState([]);
  const [filtroAño, setFiltroAño] = useState("Todos");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Buscar por email como ID en authorizedUsers
          const userRef = doc(db, "authorizedUsers", user.email);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            console.warn("No se encontró el usuario en authorizedUsers.");
            return;
          }

          const { communityId } = userSnap.data();

          // Filtrar socios por communityId
          const sociosQuery = query(
            collection(db, "authorizedUsers"),
            where("communityId", "==", communityId)
          );
          const sociosSnapshot = await getDocs(sociosQuery);
          const sociosList = sociosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
         // Para cada socio, buscamos el nombre de su comunidad
const sociosConNombreComunidad = await Promise.all(
  sociosList.map(async (socio) => {
    let nombreComunidad = "";
    try {
      const comunidadDoc = await getDoc(doc(db, "comunidades", socio.communityId));
      if (comunidadDoc.exists()) {
        nombreComunidad = comunidadDoc.data().nombre || "";
      }
    } catch (e) {
      console.warn("Error obteniendo comunidad:", e);
    }
    return { ...socio, nombreComunidad };
  })
);

setSocios(sociosConNombreComunidad);


          // Filtrar directiva por communityId
          const directivaQuery = query(
            collection(db, "directiva"),
            where("communityId", "==", communityId)
          );
          const directivaSnapshot = await getDocs(directivaQuery);
          const directivaList = directivaSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          directivaList.sort(
            (a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)
          );
          setDirectivas(directivaList);
        } catch (error) {
          console.error("Error al obtener datos por comunidad:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Años únicos para filtro
  const añosUnicos = [
    ...new Set(
      directivas
        .map((dir) => new Date(dir.fechaInicio).getFullYear())
        .filter(Boolean)
    ),
  ].sort((a, b) => b - a);

  const directivasFiltradas =
    filtroAño === "Todos"
      ? directivas
      : directivas.filter(
          (dir) =>
            new Date(dir.fechaInicio).getFullYear().toString() === filtroAño
        );

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-extralight text-center text-black mb-10">
        Estructura Comunitaria
      </h1>

      {/* Switch Tabs */}
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
            <BuildingOfficeIcon className="w-5 h-5" />
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
            <UserGroupIcon className="w-5 h-5" />
            Socios
          </button>
        </div>
      </div>

      {/* SOCIOS */}
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
                    <div>
                      <span className="font-semibold">Comunidad:</span>{" "}
                       <span className="italic text-gray-600">{socio.nombreComunidad || "Comunidad desconocida"}</span>
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

      {/* DIRECTIVA */}
      {activeTab === "directiva" && (
        <div className="bg-gray-100 p-6 rounded-lg shadow-2xl border border-gray-400 max-w-4xl mx-auto">
          <h2 className="text-black font-semibold mb-4">
            Directivas registradas:
          </h2>

          {añosUnicos.length > 0 && (
            <div className="mb-6 flex items-center gap-4">
              <label htmlFor="filtroAño" className="text-sm font-medium text-black">
                Filtrar por año de inicio:
              </label>
              <select
                id="filtroAño"
                value={filtroAño}
                onChange={(e) => setFiltroAño(e.target.value)}
                className="px-3 py-2 border border-gray-400 rounded text-black"
              >
                <option value="Todos">Todas</option>
                {añosUnicos.map((año) => (
                  <option key={año} value={año}>
                    {año}
                  </option>
                ))}
              </select>
            </div>
          )}

          {directivasFiltradas.length === 0 ? (
            <p className="text-gray-500">
              No hay directivas registradas para este año.
            </p>
          ) : (
            <ul className="space-y-4">
              {directivasFiltradas.map((dir, index) => (
                <li
                  key={dir.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                >
                  <div className="text-gray-800 space-y-2">
                    <div className="text-blue-600 font-bold">#{index + 1}</div>
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
                      <strong>Período:</strong> {dir.fechaInicio || "N/A"} —{" "}
                      {dir.fechaFin || "N/A"}
                    </div>
                     {/* 👇 Mostrar nombre de la comunidad al final */}
              <div className="mt-6 text-center text-gray-600 italic">
                Comunidad: {directivasFiltradas[0].comunidadNombre || "Nombre no disponible"}
              </div>
                  </div>
                </li>
              ))}
            </ul>
            
          )}
        </div>
      )}
    </div>
  );
}
