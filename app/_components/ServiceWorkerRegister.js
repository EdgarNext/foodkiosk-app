'use client';

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const shouldRegister =
      process.env.NODE_ENV === "production" ||
      window.location.hostname === "localhost";

    if (!shouldRegister) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.info("[PWA] Service worker registrado:", registration.scope);
      })
      .catch((error) => {
        console.error("[PWA] No se pudo registrar el service worker", error);
      });
  }, []);

  return null;
}
