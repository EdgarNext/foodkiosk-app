// app/(admin)/printer-setup/_components/PrinterSetupClient.jsx
"use client";

import { useState, useTransition } from "react";
import { savePrinterConfig, logPrintResult } from "../_lib/printer-actions";

const DEFAULT_TEST_TEXT = `Ticket de prueba
Kafena Kiosk
Operación impecable, cada día.`;

function buildBasicXml(text) {
  return `
<epos-print>
  <text>
${text}
  </text>
  <feed line="3"/>
  <cut type="partial"/>
</epos-print>
`.trim();
}

export default function PrinterSetupClient({ initialConfig, initialLogs }) {
  const safeConfig =
    initialConfig && typeof initialConfig === "object"
      ? initialConfig
      : {
          host: "",
          deviceId: "local_printer",
          timeoutMs: 60000,
        };

  if (!initialConfig) {
    console.warn(
      "[PrinterSetup] initialConfig es null/undefined; usando valores por defecto"
    );
  }

  const [config, setConfig] = useState(safeConfig);
  const [logs, setLogs] = useState(initialLogs || []);
  const [testText, setTestText] = useState(DEFAULT_TEST_TEXT);
  const [status, setStatus] = useState(null); // { level: 'ok'|'warn'|'error', message: string }
  const [isPending, startTransition] = useTransition();

  const handleSaveConfig = () => {
    startTransition(async () => {
      try {
        const saved = await savePrinterConfig(config);
        setConfig(saved);
        setStatus({ level: "ok", message: "Configuración guardada." });
      } catch (e) {
        setStatus({ level: "error", message: e.message });
      }
    });
  };

  const sendToPrinter = async (xml) => {
    if (!config?.host) {
      setStatus({
        level: "error",
        message: "Configura la IP de la impresora primero.",
      });
      return;
    }

    const url = `http://${config.host}/cgi-bin/epos/service.cgi?devid=${config.deviceId}&timeout=${config.timeoutMs}`;

    const startedAt = new Date().toISOString();

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: xml,
      });

      const text = await resp.text();

      // Epson ePOS XML response incluye print result, error code, printer status, etc. :contentReference[oaicite:9]{index=9}
      const success = text.includes('success="true"');

      const logEntry = {
        type: "test_basic",
        success,
        raw_response: text,
        started_at: startedAt,
      };

      // log en el server
      await logPrintResult(logEntry);
      setLogs((prev) => [logEntry, ...prev]);

      if (success) {
        setStatus({ level: "ok", message: "Impresión enviada correctamente." });
      } else {
        setStatus({
          level: "warn",
          message: "La impresora respondió con error. Revisa los logs.",
        });
      }
    } catch (err) {
      const logEntry = {
        type: "test_basic",
        success: false,
        raw_response: String(err),
        started_at: startedAt,
      };
      await logPrintResult(logEntry);
      setLogs((prev) => [logEntry, ...prev]);

      setStatus({
        level: "error",
        message: "No se pudo conectar con la impresora. Verifica IP y red.",
      });
    }
  };

  const handlePrintBasic = () => {
    const xml = buildBasicXml(testText);
    sendToPrinter(xml);
  };

  return (
    <div className="space-y-6">
      {/* Estado */}
      {status && (
        <div
          className={`text-sm border rounded p-2 ${
            status.level === "ok"
              ? "border-green-400 text-green-700"
              : status.level === "warn"
              ? "border-yellow-400 text-yellow-700"
              : "border-red-400 text-red-700"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Configuración */}
      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Datos de conexión</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium">IP / Host</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={config.host || ""}
              onChange={(e) =>
                setConfig((c) => ({ ...c, host: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Device ID</label>
            <input
              className="border rounded px-2 py-1 w-full"
              value={config.deviceId || "local_printer"}
              onChange={(e) =>
                setConfig((c) => ({ ...c, deviceId: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium">Timeout (ms)</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-full"
              value={config.timeoutMs || 60000}
              onChange={(e) =>
                setConfig((c) => ({ ...c, timeoutMs: Number(e.target.value) }))
              }
            />
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isPending}
          className="mt-2 inline-flex items-center px-3 py-1 rounded text-sm border"
        >
          {isPending ? "Guardando..." : "Guardar configuración"}
        </button>
      </section>

      {/* Ticket de prueba */}
      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Ticket de prueba (básico)</h2>
        <textarea
          className="border rounded w-full min-h-[120px] px-2 py-1 text-sm"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
        />
        <button
          onClick={handlePrintBasic}
          className="inline-flex items-center px-3 py-1 rounded text-sm border"
        >
          Imprimir ticket básico
        </button>
        {/* Aquí luego agregamos botón para ticket profesional */}
      </section>

      {/* Logs (vista rápida) */}
      <section className="border rounded p-4 space-y-3">
        <h2 className="font-semibold">Logs recientes</h2>
        <div className="max-h-64 overflow-auto text-xs">
          {logs.length === 0 && <p className="text-gray-500">Sin logs aún.</p>}
          {logs.map((log, idx) => (
            <div key={idx} className="border-b py-1">
              <div>
                <span className="font-mono">{log.started_at}</span>{" "}
                <span className="ml-2">
                  {log.success ? "✅" : "❌"} {log.type}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-[10px] text-gray-500 mt-1">
                {log.raw_response?.slice(0, 300)}
                {log.raw_response && log.raw_response.length > 300 ? "..." : ""}
              </pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
