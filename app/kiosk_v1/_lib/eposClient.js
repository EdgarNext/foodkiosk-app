'use client';

// Utilidades para ePOS-Print (Epson) desde el cliente.

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildEposSoap({ bodyXml }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
  <s:Body>
    ${bodyXml}
  </s:Body>
</s:Envelope>`;
}

export function buildEposPrintXml({ text, feedLines = 2, cutType = "feed" }) {
  const safe = escapeXml(text).replace(/\n/g, "&#10;");
  return `<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
  <text>${safe}&#10;</text>
  <feed line="${feedLines}"/>
  <cut type="${cutType}"/>
</epos-print>`;
}

function padRight(s, n) {
  return (s + " ".repeat(n)).slice(0, n);
}
function padLeft(s, n) {
  return (" ".repeat(n) + s).slice(-n);
}
function center(s, width = 32) {
  const str = String(s);
  const left = Math.max(0, Math.floor((width - str.length) / 2));
  return " ".repeat(left) + str;
}
function formatItemLine(qty, name, amount) {
  const left = `${qty} x ${name}`.slice(0, 22);
  const right = `$${Number(amount).toFixed(2)}`;
  return padRight(left, 22) + padLeft(right, 10);
}

export function buildProTicketSoap({
  devid = "local_printer",
  timeoutMs = 60000,
  header = "CC La Cafeteria",
  subtitle = "Kiosko",
  orderNo = "N/A",
  items = [],
  payment = "PAGA EN CAJA",
  tagline = "Operación impecable, cada día."
}) {
  const total = items.reduce(
    (acc, it) => acc + Number(it.qty ?? 0) * Number(it.price ?? 0),
    0
  );

  const lines = [];
  lines.push(center(header));
  lines.push(center(subtitle));
  lines.push("");
  lines.push("--------------------------------");
  lines.push(`PEDIDO:  #${orderNo}`);
  lines.push(
    `FECHA:   ${new Date().toLocaleDateString("es-MX", { timeZone: "America/Chihuahua" })}`
  );
  lines.push(
    `HORA:    ${new Date().toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Chihuahua"
    })}`
  );
  lines.push("--------------------------------");

  items.forEach((it) => {
    const qty = Number(it.qty ?? 0);
    const price = Number(it.price ?? 0);
    lines.push(formatItemLine(qty, it.name ?? "Producto", qty * price));
  });

  lines.push("--------------------------------");
  lines.push(padRight("TOTAL A PAGAR:", 22) + padLeft(`$${total.toFixed(2)}`, 10));
  lines.push(`PAGO: ${payment}`);
  lines.push("");
  lines.push(center(tagline));

  const bodyXml = buildEposPrintXml({
    text: lines.join("\n"),
    feedLines: 2,
    cutType: "feed"
  });

  return buildEposSoap({ bodyXml });
}

export async function sendEposToPrinter({ host, devid, timeoutMs, soapXml }) {
  const url = `http://${host}/cgi-bin/epos/service.cgi?devid=${encodeURIComponent(
    devid
  )}&timeout=${Math.floor(timeoutMs)}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/xml; charset=utf-8" },
    body: soapXml
  });
  const text = await resp.text();
  return parseEposResponse(text);
}

export function parseEposResponse(xmlText) {
  const success = /success="true"/.test(xmlText);
  const codeMatch = xmlText.match(/code="([^"]*)"/);
  const statusMatch = xmlText.match(/status="([^"]*)"/);

  const code = codeMatch ? codeMatch[1] : "";
  const status = statusMatch ? Number(statusMatch[1]) : null;

  return { success, code, status, raw: xmlText };
}

export const EPOS_DEFAULTS = {
  host: "192.168.2.251",
  devid: "local_printer",
  timeoutMs: 60000
};
