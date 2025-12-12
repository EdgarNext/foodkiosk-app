// app/(admin)/printer-setup/_lib/printer-actions.js
"use server";

import { createClient } from "@/app/_lib/supabase/server";

export async function getPrinterConfig() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("printer_config")
    .select("*")
    .single();

  if (error) {
    // si no existe, regresas defaults
    return {
      host: "",
      deviceId: "local_printer",
      timeoutMs: 60000,
      enabled: true,
    };
  }
  return {
    ...data,
    deviceId: data.device_id ?? data.deviceId ?? "local_printer",
    timeoutMs: data.timeout_ms ?? data.timeoutMs ?? 60000,
  };
}

export async function savePrinterConfig(config) {
  const supabase = await createClient();

  const payload = {
    ...config,
    device_id: config.deviceId ?? config.device_id ?? "local_printer",
    timeout_ms: config.timeoutMs ?? config.timeout_ms ?? 60000,
  };

  console.log("[printer-setup] saving payload", payload);

  const { data, error } = await supabase
    .from("printer_config")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("savePrinterConfig error", error);
    throw new Error("No se pudo guardar la configuración.");
  }
  return {
    ...data,
    deviceId: data.device_id ?? data.deviceId ?? "local_printer",
    timeoutMs: data.timeout_ms ?? data.timeoutMs ?? 60000,
  };
}

export async function logPrintResult(logEntry) {
  const supabase = await createClient();
  const { error } = await supabase.from("printer_logs").insert(logEntry);
  if (error) {
    console.error("logPrintResult error", error);
  }
}

export async function getRecentPrinterLogs() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("printer_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return data ?? [];
}
