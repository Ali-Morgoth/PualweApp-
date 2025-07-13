import { collection, getDocs } from "firebase/firestore";
import { db } from "../../app/lib/firebase";
import fetch from "node-fetch";

const EMBEDDING_URL =
  "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction";

const HUGGINGFACE_TOKEN = process.env.HUGGINGFACE_API_KEY;

async function getEmbedding(text) {
  const response = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: [text] }),
  });

  const raw = await response.text();

  if (!response.ok) {
    console.error("Error de API HuggingFace:", raw);
    throw new Error("Error al obtener embedding: " + raw);
  }

  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data) || !Array.isArray(data[0])) {
      throw new Error("Respuesta inválida del modelo.");
    }
    return data[0];
  } catch (err) {
    console.error("Error al parsear JSON:", raw);
    throw new Error("Error al parsear embedding: " + raw);
  }
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

function normalizeText(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function handler(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Falta parámetro de búsqueda" });

  try {
    const searchEmbedding = await getEmbedding(q);

    const snapshot = await getDocs(collection(db, "libros"));
    const libros = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo,
        descripcion: data.categoria || "",
        autor: data.autor,
        archivoURL: data.archivoURL,
        texto: `${data.titulo} ${data.autor} ${data.categoria}`.slice(0, 512),
      };
    });

    const queryWords = normalizeText(q).split(" ");

    const textosConBusqueda = libros.filter((libro) => {
      const texto = normalizeText(`${libro.titulo} ${libro.autor} ${libro.descripcion}`);
      return queryWords.some((word) => texto.includes(word));
    });

    const librosAComparar = textosConBusqueda.length > 0 ? textosConBusqueda : libros;

    const resultados = await Promise.all(
      librosAComparar.map(async (libro) => {
        const libroEmbedding = await getEmbedding(libro.texto);
        const similitud = cosineSimilarity(searchEmbedding, libroEmbedding);
        return { ...libro, similitud };
      })
    );

    const topResultados = resultados
      .sort((a, b) => b.similitud - a.similitud)
      .slice(0, 10);

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json(topResultados);
  } catch (error) {
    console.error("Error en búsqueda semántica:", error);
    res.status(500).json({ error: "Error al buscar libros." });
  }
}
