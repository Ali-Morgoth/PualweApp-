// /app/dashboard/page.js
"use client";

import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  NewspaperIcon,
  CalendarDateRangeIcon,
} from "@heroicons/react/24/outline";

export default function Dashboard() {
  const router = useRouter();

  const buttons = [
    { label: "Directiva/Socios", path: "/dashboard/directiva", icon: <UserGroupIcon className="w-6 h-6" /> },
    { label: "Documentos", path: "/dashboard/documentos", icon: <DocumentTextIcon className="w-6 h-6" /> },
    { label: "Tesorería", path: "/dashboard/tesoreria", icon: <CurrencyDollarIcon className="w-6 h-6" /> },
    { label: "Libros", path: "/dashboard/libros", icon: <BookOpenIcon className="w-6 h-6" /> },
    { label: "Proyectos", path: "/dashboard/proyectos", icon: <NewspaperIcon className="w-6 h-6" /> },
    { label: "Eventos", path: "/dashboard/eventos", icon: <CalendarDateRangeIcon className="w-6 h-6" /> },
  ];

  return (
    <>
      <div className="text-center mt-6 mb-4">
        <h1 className="text-3xl font-extralight text-black">Panel administrativo</h1>
      </div>

      <div className="flex justify-center px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {buttons.map((btn) => (
            <label key={btn.label} className="flex justify-center">
              <input type="radio" name="dashboard" className="sr-only peer" />
              <div
                onClick={() => router.push(btn.path)}
                className="radio-tile flex flex-col items-center justify-center gap-2 p-4 w-28 h-28 md:w-36 md:h-36 rounded-lg border-2 border-gray-300 bg-white shadow-lg cursor-pointer hover:border-[#14fed3] peer-checked:border-blue-600 peer-checked:text-blue-600 transition-all"
              >
                <div className="text-gray-600 peer-checked:text-blue-600">{btn.icon}</div>
                <span className="text-sm text-gray-700 peer-checked:text-blue-600">{btn.label}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
