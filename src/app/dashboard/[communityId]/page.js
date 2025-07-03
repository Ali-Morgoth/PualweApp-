"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  NewspaperIcon,
  CalendarDateRangeIcon,
} from "@heroicons/react/24/outline";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [communityName, setCommunityName] = useState("");
  const [communityRut, setCommunityRut] = useState("");
  const [communityId, setCommunityId] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login"); // Redirige si no está autenticado
        return;
      }

      const userDoc = await getDoc(doc(db, "authorizedUsers", user.email));
      if (userDoc.exists()) {
        const { communityId } = userDoc.data();
        setCommunityId(communityId);

        if (communityId) {
          const communityDoc = await getDoc(
            doc(db, "comunidades", communityId)
          );
          if (communityDoc.exists()) {
            const { nombre, rut } = communityDoc.data();
            setCommunityName(nombre);
            setCommunityRut(rut);
          }
        }
      }
    });

    return () => unsubscribe(); // Limpieza al desmontar
  }, []);

  const buttons = [
    {
      label: "Directiva/Socios",
      path: "directiva",
      icon: <UserGroupIcon className="w-6 h-6" />,
    },
    {
      label: "Documentos",
      path: "documentos",
      icon: <DocumentTextIcon className="w-6 h-6" />,
    },
    {
      label: "Tesorería",
      path: "tesoreria",
      icon: <CurrencyDollarIcon className="w-6 h-6" />,
    },
    {
      label: "Libros",
      path: "libros",
      icon: <BookOpenIcon className="w-6 h-6" />,
    },
    {
      label: "Proyectos",
      path: "proyectos",
      icon: <NewspaperIcon className="w-6 h-6" />,
    },
    {
      label: "Eventos",
      path: "eventos",
      icon: <CalendarDateRangeIcon className="w-6 h-6" />,
    },
  ];

  return (
    <>
      <div className="text-center mt-6 mb-5">
        <h1 className="text-3xl font-extralight text-black">
          Panel administrativo
        </h1>
        <div className="text-center my-8 min-h-[72px] flex justify-center items-center">
          {communityName ? (
            <div className="inline-block bg-blue-600 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2 rounded-full shadow-md shadow-pink-500/40 text-white fade-in-up">
              <p className="text-lg font-semibold">Comunidad {communityName}</p>
              {communityRut && (
                <p className="text-xs font-bold">RUT: {communityRut}</p>
              )}
            </div>
          ) : (
            <div className="h-[72px]"></div> // reserva el espacio mientras carga
          )}
        </div>
      </div>

      <div className="flex justify-center px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {buttons.map((btn) => (
            <label key={btn.label} className="flex justify-center">
              <input type="radio" name="dashboard" className="sr-only peer" />
              <div
                onClick={() => {
                  if (communityId) {
                    router.push(`/dashboard/${communityId}/${btn.path}`);
                  }
                }}
                className="radio-tile flex flex-col items-center justify-center gap-2 p-4 w-28 h-28 md:w-36 md:h-36 rounded-lg border-2 border-gray-300 bg-white shadow-lg cursor-pointer hover:border-[#14fed3] peer-checked:border-blue-600 peer-checked:text-blue-600 transition-all"
              >
                <div className="text-gray-600 peer-checked:text-blue-600">
                  {btn.icon}
                </div>
                <span className="text-sm text-gray-700 peer-checked:text-blue-600">
                  {btn.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   UserGroupIcon,
//   DocumentTextIcon,
//   CurrencyDollarIcon,
//   BookOpenIcon,
//   NewspaperIcon,
//   CalendarDateRangeIcon,
// } from "@heroicons/react/24/outline";
// import { auth, db } from "../../lib/firebase";
// import { doc, getDoc } from "firebase/firestore";

// export default function Dashboard() {
//   const router = useRouter();
//   const [communityName, setCommunityName] = useState("");
//   const [communityRut, setCommunityRut] = useState("");
//   const [communityId, setCommunityId] = useState("");

//   useEffect(() => {
//     const fetchCommunity = async () => {
//       const user = auth.currentUser;
//       if (!user) return;

//       const userDoc = await getDoc(doc(db, "authorizedUsers", user.email));
//       if (userDoc.exists()) {
//         const { communityId } = userDoc.data();
//         setCommunityId(communityId);

//         if (communityId) {
//           const communityDoc = await getDoc(doc(db, "comunidades", communityId));
//           if (communityDoc.exists()) {
//             const { nombre, rut } = communityDoc.data();
//             setCommunityName(nombre);
//             setCommunityRut(rut);
//           }
//         }
//       }
//     };

//     fetchCommunity();
//   }, []);

//   const buttons = [
//     { label: "Directiva/Socios", path: "directiva", icon: <UserGroupIcon className="w-6 h-6" /> },
//     { label: "Documentos", path: "documentos", icon: <DocumentTextIcon className="w-6 h-6" /> },
//     { label: "Tesorería", path: "tesoreria", icon: <CurrencyDollarIcon className="w-6 h-6" /> },
//     { label: "Libros", path: "libros", icon: <BookOpenIcon className="w-6 h-6" /> },
//     { label: "Proyectos", path: "proyectos", icon: <NewspaperIcon className="w-6 h-6" /> },
//     { label: "Eventos", path: "eventos", icon: <CalendarDateRangeIcon className="w-6 h-6" /> },
//   ];

//   return (
//     <>
//       <div className="text-center mt-6 mb-5">
//         <h1 className="text-3xl font-extralight text-black">Panel administrativo</h1>
//         {communityName && (
//           <div className="text-center mb-8">
//             <div className="inline-block bg-blue-600 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-6 py-2 rounded-full shadow-md shadow-pink-500/40 text-white">
//               <p className="text-lg font-semibold">Comunidad {communityName}</p>
//               {communityRut && <p className="text-xs font-bold">RUT: {communityRut}</p>}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="flex justify-center px-4">
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
//           {buttons.map((btn) => (
//             <label key={btn.label} className="flex justify-center">
//               <input type="radio" name="dashboard" className="sr-only peer" />
//               <div
//                 onClick={() => {
//                   if (communityId) {
//                     router.push(`/dashboard/${communityId}/${btn.path}`);
//                   }
//                 }}
//                 className="radio-tile flex flex-col items-center justify-center gap-2 p-4 w-28 h-28 md:w-36 md:h-36 rounded-lg border-2 border-gray-300 bg-white shadow-lg cursor-pointer hover:border-[#14fed3] peer-checked:border-blue-600 peer-checked:text-blue-600 transition-all"
//               >
//                 <div className="text-gray-600 peer-checked:text-blue-600">{btn.icon}</div>
//                 <span className="text-sm text-gray-700 peer-checked:text-blue-600">{btn.label}</span>
//               </div>
//             </label>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// }
