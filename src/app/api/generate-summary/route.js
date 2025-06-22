// api/generate-summary/route.js
import { NextResponse } from 'next/server';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase'; // No necesitas ref, getDownloadURL si el archivoURL ya está en el doc
import openai from '@/app/lib/openai';
import { extractTextFromPdf } from '@/app/lib/pdfExtractor'; // Asegúrate de que esta importación sea correcta

const normalizeTexto = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export async function POST(req) {
  const { titulo } = await req.json();
  const tituloNormalizado = normalizeTexto(titulo);

  const snapshot = await getDocs(collection(db, 'libros'));

  let libroEncontrado = null;
  let libroId = null;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tituloDoc = normalizeTexto(data.titulo);
    if (tituloDoc === tituloNormalizado) {
      libroEncontrado = data;
      libroId = docSnap.id;
    }
  });

  if (!libroEncontrado || !libroId) {
    return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
  }

  // Si ya tiene resumen, lo retorna directamente (tu lógica actual, está bien)
  if (libroEncontrado.resumen) {
    return NextResponse.json({ resumen: libroEncontrado.resumen });
  }

  // Si no tiene resumen, procede a generarlo
  try {
    const url = libroEncontrado.archivoURL;

    if (!url) {
        return NextResponse.json({ error: 'URL del archivo PDF no disponible en el libro.' }, { status: 500 });
    }

    const response = await fetch(url);
    if (!response.ok) {
      // Intenta obtener más detalles del error si la respuesta no es OK
      const errorText = await response.text();
      console.error(`Error al descargar PDF (Status: ${response.status}):`, errorText);
      return NextResponse.json({ error: `No se pudo descargar el PDF desde Storage: ${response.statusText}` }, { status: response.status });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    const fragmento = await extractTextFromPdf(buffer); // Aquí se usa la función modificada
    
    if (!fragmento || fragmento.trim().length === 0) {
        return NextResponse.json({ error: 'No se pudo extraer texto significativo del PDF.' }, { status: 500 });
    }

    const prompt = `Resume el siguiente texto en 5 líneas:\n\n${fragmento}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      temperature: 0.7, // Añadir temperature para controlar la creatividad
      max_tokens: 200, // Limitar los tokens de salida para el resumen
    });

    const resumen = completion.choices[0].message.content;

    // Guarda el resumen en Firestore
    await updateDoc(doc(db, 'libros', libroId), { resumen });

    return NextResponse.json({ resumen });
  } catch (err) {
    console.error('Error procesando resumen:', err);
    return NextResponse.json({ error: 'Error procesando PDF o IA. Revise los logs del servidor.' }, { status: 500 });
  }
}