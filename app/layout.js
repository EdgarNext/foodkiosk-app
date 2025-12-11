// app/layout.js
import "./globals.css";
import ServiceWorkerRegister from "./_components/ServiceWorkerRegister";
import AppHeader from "./_components/AppHeader";

export const metadata = {
  title: "Kiosko de alimentos",
  description: "Toma de pedidos rápida y clara para tu negocio de comida",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/maskable-icon.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  appleWebApp: {
    capable: true,
    title: "Kiosko de alimentos",
    statusBarStyle: "black-translucent"
  }
};

export const viewport = {
  themeColor: "#0f172a"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-app text-text-main">
        <ServiceWorkerRegister />
        <div className="min-h-screen flex flex-col">
          <AppHeader />

          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
