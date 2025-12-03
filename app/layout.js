// app/layout.js
import "./globals.css";
import ServiceWorkerRegister from "./_components/ServiceWorkerRegister";
import NavBar from "./_components/NavBar";

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
          <header className="bg-app-soft border-b border-border-subtle px-4 py-3 flex flex-col gap-2 sticky top-0 z-30">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-tight">
                Kiosko de alimentos
              </h1>
              <span className="text-sm text-text-muted">
                Modo pedido en mostrador
              </span>
            </div>
            <NavBar />
          </header>

          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}
