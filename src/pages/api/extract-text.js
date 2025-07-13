export const runtime = 'nodejs';
import { db } from "../../app/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import fetch from "node-fetch";
import pdf from "pdf-parse";

export default async function handler(req, res) {
  const { id, archivoURL } = req.query;

  if (!id || !archivoURL) {
    return res.status(400).json({ error: "Faltan parámetros id o archivoURL" });
  }

  try {
    // Descargar PDF
    const response = await fetch(archivoURL);
    if (!response.ok) {
      return res.status(400).json({ error: "Error descargando el PDF" });
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extraer texto
    const data = await pdf(buffer);

    // Guardar texto en Firestore (campo textoExtraido)
    const libroRef = doc(db, "libros", id);
    await updateDoc(libroRef, { textoExtraido: data.text });

    res.status(200).json({ message: "Texto extraído y guardado", textLength: data.text.length });
  } catch (error) {
    console.error("Error extrayendo texto:", error);
    res.status(500).json({ error: "Error extrayendo texto" });
  }
}
