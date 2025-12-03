'use client';

import { useEffect, useState } from "react";

export default function OrderActions() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [message]);

  const handleSave = () => {
    setMessage("Orden guardada (ejemplo)");
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      <button className="w-full py-3 text-lg bg-brand text-white rounded-lg font-semibold">
        Enviar a cocina
      </button>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 text-sm py-2 rounded-lg border border-border-subtle bg-app-soft"
        >
          Guardar orden
        </button>
        <button className="flex-1 text-sm py-2 rounded-lg border border-border-subtle bg-surface-strong text-destructive">
          Cancelar
        </button>
      </div>

      {message ? (
        <div
          className="mt-1 rounded-lg bg-success-soft text-success px-3 py-2 text-sm font-medium"
          role="status"
          aria-live="polite"
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
