'use client';

export default function OfflineContent() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6 py-12">
      <div className="max-w-md space-y-3">
        <p className="text-sm font-semibold text-brand">Modo sin conexión</p>
        <h1 className="text-2xl font-semibold">Parece que no hay internet</h1>
        <p className="text-sm text-text-muted">
          Puedes seguir revisando lo que ya cargó. Cuando vuelvas a tener
          conexión, intenta recargar para enviar pedidos o actualizar datos.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          className="px-4 py-2 rounded-lg bg-brand text-white font-medium shadow"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
        <a
          href="/"
          className="px-4 py-2 rounded-lg border border-border-subtle text-text-main font-medium"
        >
          Ir al inicio
        </a>
      </div>

      <style>{`
        .text-brand { color: #f97316; }
        .bg-brand { background-color: #f97316; }
        .text-text-muted { color: #94a3b8; }
        .text-text-main { color: #e2e8f0; }
        body { background: #0f172a; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
        a { text-decoration: none; }
        .border-border-subtle { border-color: rgba(226, 232, 240, 0.2); }
        .shadow { box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
      `}</style>
    </div>
  );
}
