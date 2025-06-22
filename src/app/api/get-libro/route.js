import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

const normalizeTexto = (text) =>
  text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const titulo = searchParams.get('titulo');

  const librosRef = collection(db, 'libros');
  const snapshot = await getDocs(librosRef);

  // Si pidieron todos los títulos
  if (titulo === '__todos__') {
    const titulos = snapshot.docs.map(doc => doc.data().titulo).filter(Boolean);
    return NextResponse.json(titulos);
  }

  const tituloNormalizado = normalizeTexto(titulo);
  let libroEncontrado = null;

  snapshot.forEach((doc) => {
    const data = doc.data();
    const tituloLibro = normalizeTexto(data.titulo);
    if (tituloLibro === tituloNormalizado) {
      libroEncontrado = { id: doc.id, ...data };
    }
  });

  if (!libroEncontrado) {
    return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
  }

  return NextResponse.json(libroEncontrado);
}
