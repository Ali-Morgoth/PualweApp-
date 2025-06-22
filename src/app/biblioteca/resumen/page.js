// pages/ResumenLibroPage.js
'use client';

import { useState, useEffect } from 'react';

export default function ResumenLibroPage() {
  const [titulo, setTitulo] = useState('');
  const [libro, setLibro] = useState(null);
  const [resumen, setResumen] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [sugerencias, setSugerencias] = useState([]);

  // Limpiar resumen y error al cambiar el título
  useEffect(() => {
    setResumen('');
    setError('');
    setLibro(null);
  }, [titulo]);

  const normalizeTexto = (text) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const buscarLibro = async () => {
    setError('');
    setLibro(null);
    setResumen(''); // Asegurarse de limpiar el resumen anterior
    setCargando(true);

    try {
      const res = await fetch(`/api/get-libro?titulo=${encodeURIComponent(titulo)}`);
      const data = await res.json();

      if (res.ok) {
        setLibro(data);

        if (data.resumen) {
          setResumen(data.resumen);
        } else {
          // Muestra un mensaje más específico cuando se está generando el resumen
          setError('Generando resumen con IA... Esto puede tomar un momento.'); 
          const resumenRes = await fetch('/api/generate-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo }),
          });

          const resumenData = await resumenRes.json();
          if (resumenRes.ok) {
            setResumen(resumenData.resumen);
            setError(''); // Limpiar el mensaje de "generando resumen"
          } else {
            setError(resumenData.error || 'No se pudo generar el resumen.');
          }
        }
      } else {
        setError(data.error || 'Libro no encontrado');
        await cargarSugerencias();
      }
    } catch (err) {
      console.error("Error en buscarLibro:", err); // Log para depuración
      setError('Error al buscar el libro o comunicarse con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const cargarSugerencias = async () => {
    try {
      const res = await fetch('/api/get-libro?titulo=__todos__');
      const data = await res.json();
      if (Array.isArray(data)) {
        setSugerencias(data);
      }
    } catch (err) {
      console.error('Error al obtener sugerencias', err);
    }
  };

  const formatearFecha = (fecha) => {
    if (fecha?.seconds) {
      const date = new Date(fecha.seconds * 1000);
      return date.toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return 'No disponible';
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Buscar resumen de libro</h1>

      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Escribe el título del libro..."
        className="border p-2 w-full rounded mb-4"
      />

      <button
        onClick={buscarLibro}
        disabled={cargando || !titulo}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {cargando ? 'Buscando...' : 'Buscar'}
      </button>

      {cargando && !error && <p className="text-blue-600 mt-4">Cargando...</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}

      {error && sugerencias.length > 0 && (
        <div className="mt-2 bg-yellow-100 text-yellow-800 p-3 rounded">
          <p className="font-semibold">Libros disponibles:</p>
          <ul className="list-disc ml-5 mt-1">
            {sugerencias.map((sugTitle, idx) => ( // Cambié 'titulo' por 'sugTitle' para evitar confusión
              <li key={idx} className="cursor-pointer hover:underline" onClick={() => setTitulo(sugTitle)}>
                {sugTitle}
              </li>
            ))}
          </ul>
        </div>
      )}

      {libro && (
        <div className="mt-6 bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">{libro.titulo}</h2>
          <p className="text-gray-600 mb-2">Autor: {libro.autor}</p>
          <p className="text-sm text-gray-700">Categoría: {libro.categoria}</p>
          {/* <p className="text-sm text-gray-700 mb-4">Fecha: {formatearFecha(libro.fecha)}</p> */}
          <hr />
          <h3 className="mt-4 font-bold text-black">Resumen generado:</h3>
          <p className="mt-2 whitespace-pre-line text-black">{resumen}</p>
        </div>
      )}
    </div>
  );
}