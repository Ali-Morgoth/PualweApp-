"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import KiyemtuainLoader from "@/app/components/Loader/KiyemtuainLoader";
import { Toaster } from "react-hot-toast";
import SociosForm from "./socios/SociosForm";
import DirectivaForm from "./directiva/DirectivaForm";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";

export default function AdministradorPage() {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("socios");
  const [communityId, setCommunityId] = useState(null);
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push("/");
        return;
      }
      setUser(u);
      const adminSnap = await getDoc(doc(db, "admin", u.email));
      const userDoc = await getDoc(doc(db, "authorizedUsers", u.email));
      if (userDoc.exists()) setCommunityId(userDoc.data().communityId);
      if (adminSnap.exists()) setAuthorized(true);
      const developerSnap = await getDoc(doc(db, "developer", u.email));
      if (developerSnap.exists()) {
        setIsDeveloper(true);
      }
      setLoading(false);
      if (userDoc.exists()) {
        const data = userDoc.data();
        setCommunityId(data.communityId);
        if (data.nombre && data.primerApellido && data.segundoApellido) {
          const nombreCompleto = `${data.nombre} ${data.primerApellido} ${data.segundoApellido}`;
          setFullName(nombreCompleto);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <KiyemtuainLoader />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="text-center text-red-600 text-xl font-semibold">
          Acceso denegado
        </p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-white p-6">
        {communityId && (
          <button
            onClick={() => router.push(`/dashboard/${communityId}`)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Volver</span>
          </button>
        )}
        {isDeveloper && (
          <div className="absolute top-6 right-6">
            <button
              onClick={() => router.push("/administrador/adminmanager")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2"
            >
              <LockClosedIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Dev</span>
            </button>
          </div>
        )}

        <h1 className="text-3xl text-black font-bold text-center mb-2">
          Panel de Administrador
        </h1>
        {fullName && (
          <div className="text-center mb-8">
            <p className="text-lg font-semibold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2 rounded-full shadow-md shadow-pink-500/40 inline-block">
              {fullName}
            </p>
          </div>
        )}

        <div className="flex justify-center mb-8">
          <div className="space-x-2">
            <button
              onClick={() => setActiveTab("socios")}
              className={`px-4 py-2 rounded-2xl ${
                activeTab === "socios"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Socios
            </button>
            <button
              onClick={() => setActiveTab("directiva")}
              className={`px-4 py-2 rounded-2xl ${
                activeTab === "directiva"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              Directiva
            </button>
          </div>
        </div>
        {activeTab === "socios" ? (
          <SociosForm communityId={communityId} />
        ) : (
          <DirectivaForm />
        )}
      </div>
    </>
  );
}
