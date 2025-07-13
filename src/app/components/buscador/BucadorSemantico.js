"use client";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function BuscadorSemantico() {
  const [query, setQuery] = useState("");       // Estado para guardar texto del input
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!query) return;                         // No buscar si input vacío
    setLoading(true);

    try {
      // Añadimos timestamp para evitar cache en la petición
      const timestamp = Date.now();
      const res = await fetch(`/api/buscador?q=${encodeURIComponent(query)}&t=${timestamp}`);
      const data = await res.json();
      setResultados(data);
    } catch (error) {
      setResultados({ error: "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-xl sm:text-xl font-bold mb-4 text-gray-800 text-center">Buscador semántico IA</h2>

      <div className="mb-8">
        {/* Input con botón integrado */}
        <div className="input-buscador-container">
          <input
            type="text"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-buscador pr-12" // espacio a la derecha para el botón
            onKeyDown={(e) => { if (e.key === 'Enter') buscar(); }}
          />
          <label className="input-buscador-label">Ej: cosmovisión mapuche, historia...</label>
          <button
            onClick={buscar}
            disabled={loading || !query.trim()}
            className="absolute right-3 top-2.5 text-white hover:text-indigo-400 transition"
            aria-label="Buscar"
          >
            <MagnifyingGlassIcon className={`h-6 w-6 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {Array.isArray(resultados) && resultados.length > 0 && (
      <div className="pr-1">
      <ul className="space-y-4 ">
          {resultados.map((libro) => {
            const porcentaje = (libro.similitud * 100).toFixed(2);
            return (
              <li
                key={libro.id}
                className="p-4 border border-gray-200  rounded-lg shadow-sm hover:shadow-md transition bg-[#112223]"
              >
                <h3 className="text-lg font-semibold text-[#ffff]">{libro.titulo}</h3>
                <p className="text-white mt-1">Categoria: {libro.descripcion}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white font-medium">Similitud</span>
                    <span className="text-[#14fed3] font-semibold">{porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#14fed3] h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        </div>
      )}

      {!Array.isArray(resultados) && resultados?.error && (
        <p className="text-red-600 font-semibold mt-4 text-center">{resultados.error}</p>
      )}
    </div>
  );
}
