import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import ClientWrapper from "../app/components/Loader/ClientWrapper"; // Asegúrate de importar bien

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Pualwe Intranet",
  description: "Comunidad Kiyemtuain - Compartiendo saberes ancestrales",
  icons: {
    icon: [
      { url: "/logo_kiyemtuain_bg.png" },
      { url: "/favicon-32x32.ico" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        {/* FAVICON para pestaña del navegador */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
       

      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientWrapper>{children}</ClientWrapper>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
