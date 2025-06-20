"use client";
import { useRouter } from "next/navigation";

export default function PublicLibraryBox() {
  const router = useRouter();

  return (
    <div className="p-6 bg-[#87cec1] shadow-lg rounded-lg text-center w-70">
      <h2 className="text-2xl font-serif mb-4 text-white">Biblioteca Pública</h2>
      <button onClick={() => router.push("/biblioteca")} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Ver Biblioteca
      </button>
    </div>
  );
}
