"use client";

import { useState } from "react";

const FIXED_CONFIG = {
  host: "192.168.2.251",
  deviceId: "local_printer",
  timeoutMs: 60000
};

const SAMPLE_XML = `
<epos-print>
  <text>Prueba directa desde kiosk setup</text>
  <feed line="3"/>
  <cut type="partial"/>
</epos-print>
`.trim();

export default function PrinterTestClient() {
  const [status, setStatus] = useState(null); // { level, message }
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    setIsSending(true);
    setStatus(null);
    try {
      const url = `http://${FIXED_CONFIG.host}/cgi-bin/epos/service.cgi?devid=${FIXED_CONFIG.deviceId}&timeout=${FIXED_CONFIG.timeoutMs}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: SAMPLE_XML
      });
      const text = await resp.text();
      const ok = text.includes('success="true"');
      setStatus({
        level: ok ? "ok" : "warn",
        message: ok
          ? "Impresión enviada correctamente."
          : "La impresora respondió con un error. Revisa la conexión o el dispositivo."
      });
    } catch (err) {
      setStatus({
        level: "error",
        message: `No se pudo conectar a la impresora: ${String(err)}`
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="p-4 bg-surface border border-border-subtle rounded-2xl shadow-sm space-y-3">
      <div>
        <p className="text-sm text-text-soft uppercase tracking-wide">
          Prueba directa (IP fija)
        </p>
        <h3 className="text-lg font-semibold">Enviar print a 192.168.2.251</h3>
        <p className="text-sm text-text-muted">
          Usa el endpoint ePOS de Epson con config fija para depurar conectividad.
        </p>
      </div>

      {status ? (
        <div
          className={`text-sm border rounded-lg px-3 py-2 ${
            status.level === "ok"
              ? "border-green-400 text-green-700"
              : status.level === "warn"
              ? "border-yellow-400 text-yellow-700"
              : "border-red-400 text-red-700"
          }`}
        >
          {status.message}
        </div>
      ) : null}

      <pre className="bg-app border border-border-subtle rounded-lg p-3 text-xs overflow-auto">
        {SAMPLE_XML}
      </pre>

      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="inline-flex items-center px-4 py-2 rounded-lg bg-brand text-brand-on font-semibold text-sm disabled:opacity-60"
      >
        {isSending ? "Enviando..." : "Enviar prueba a 192.168.2.251"}
      </button>
    </section>
  );
}
