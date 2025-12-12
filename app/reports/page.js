// app/reports/page.js
import ReportsDashboard from "./_components/ReportsDashboard";
import { fetchReportsBundle } from "./_lib/reports-queries";

export const metadata = {
  title: "Reportes",
  description: "Ingresos, productos vendidos y detalle de órdenes del kiosko",
};

export const revalidate = 0;

const TZ_OFFSET = "-06:00"; // America/Mexico_City (sin DST en la práctica actual)

// YYYY-MM-DD de hoy en CDMX (sin libs externas)
function todayLocalISO() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

function addDays(yyyyMmDd, deltaDays) {
  // Interpretamos la fecha como CDMX a medianoche.
  const dt = new Date(`${yyyyMmDd}T00:00:00${TZ_OFFSET}`);
  dt.setDate(dt.getDate() + deltaDays);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeRange(searchParams) {
  const preset = searchParams?.preset;

  const today = todayLocalISO();

  if (preset === "today") return { from: today, to: today, preset };
  if (preset === "yesterday") {
    const y = addDays(today, -1);
    return { from: y, to: y, preset };
  }
  if (preset === "7d") {
    return { from: addDays(today, -6), to: today, preset };
  }
  if (preset === "30d") {
    return { from: addDays(today, -29), to: today, preset };
  }

  // manual
  const from = (searchParams?.from || "").slice(0, 10);
  const to = (searchParams?.to || "").slice(0, 10);

  // fallback: 7 días
  if (!from || !to)
    return { from: addDays(today, -6), to: today, preset: "7d" };

  return { from, to, preset: "custom" };
}

function toUtcBoundsISO({ from, to }) {
  // 00:00:00 a 23:59:59.999 en hora local CDMX
  const fromIso = new Date(`${from}T00:00:00${TZ_OFFSET}`).toISOString();
  const toIso = new Date(`${to}T23:59:59.999${TZ_OFFSET}`).toISOString();
  return { fromIso, toIso };
}

export default async function ReportsPage({ searchParams }) {
  const sp = await searchParams;
  const range = normalizeRange(sp);
  const { fromIso, toIso } = toUtcBoundsISO(range);

  const bundle = await fetchReportsBundle({
    from: range.from,
    to: range.to,
    fromIso,
    toIso,
    ordersLimit: 200,
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-text-soft">
          Reportes
        </p>
        <h1 className="text-2xl font-semibold text-text-main">
          Cafetería — Reportes
        </h1>
        <p className="text-sm text-text-muted">
          Ingresos por día (00:00–23:59 CDMX), productos vendidos para compras y
          detalle de órdenes.
        </p>
      </header>

      <ReportsDashboard initialRange={range} initialBundle={bundle} />
    </div>
  );
}
