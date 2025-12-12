// app/reports/_components/ReportsDashboard.js
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  LabelList,
} from "recharts";

function cn(...xs) {
  return xs.filter(Boolean).join(" ");
}

/**
 * Paleta ejecutiva + inspiracional (sin gritar).
 * - Indigo: confiable / ejecutivo
 * - Emerald: positivo / crecimiento
 * - Slate: neutros formales
 */
const CHART = {
  grid: "rgba(148, 163, 184, 0.35)", // slate-400
  axis: "rgba(100, 116, 139, 1)", // slate-500
  text: "rgba(15, 23, 42, 0.9)", // slate-900
  tooltipBg: "rgba(2, 6, 23, 0.92)", // slate-950
  tooltipText: "rgba(248, 250, 252, 1)", // slate-50
  primary: "rgba(79, 70, 229, 1)", // indigo-600
  primarySoft: "rgba(79, 70, 229, 0.18)",
  good: "rgba(16, 185, 129, 1)", // emerald-500
  goodSoft: "rgba(16, 185, 129, 0.18)",
  neutralBar: "rgba(51, 65, 85, 0.85)", // slate-700
};

function money(cents) {
  const n = Number(cents || 0) / 100;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n);
}

function moneyFromMXN(v) {
  // v ya viene en MXN (no cents)
  const n = Number(v || 0);
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n);
}

function Chip({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-border-subtle/40 text-text-main border-border-subtle",
    good: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    warn: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    bad: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    info: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function statusTone(status) {
  if (status === "completed" || status === "delivered") return "good";
  if (status === "pending") return "warn";
  if (status === "cancelled" || status === "canceled") return "bad";
  return "neutral";
}

function payTone(payment) {
  if (payment === "paid") return "good";
  if (payment === "unpaid") return "warn";
  if (payment === "refunded") return "info";
  return "neutral";
}

function KPI({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-app p-4">
      <div className="text-xs uppercase tracking-wide text-text-soft">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-text-main">{value}</div>
      {hint ? <div className="mt-2 text-xs text-text-muted">{hint}</div> : null}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-text-main text-app"
          : "border border-border-subtle bg-app text-text-main hover:bg-border-subtle/30"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Tooltip “premium” (oscuro elegante)
 */
function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-white/10 px-3 py-2 shadow-xl"
      style={{
        background: CHART.tooltipBg,
        color: CHART.tooltipText,
      }}
    >
      <div className="text-xs opacity-80">{label}</div>
      <div className="mt-1 space-y-1">
        {payload.map((p) => (
          <div
            key={p.dataKey}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-xs opacity-90">{p.name}</span>
            <span className="text-sm font-semibold">
              {formatter ? formatter(p.value, p.dataKey) : String(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * BottomSheet con:
 * - padding inferior extra + safe area
 * - borde/separador visual
 * - footer “sombra” para dar cierre visual
 */
function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-2xl rounded-t-3xl border border-border-subtle bg-app shadow-xl">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-text-soft">
                Detalle
              </div>
              <div className="truncate text-base font-semibold text-text-main">
                {title}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border-subtle bg-app px-3 py-2 text-sm text-text-main hover:bg-border-subtle/30"
            >
              Cerrar
            </button>
          </div>

          <div className="h-px w-full bg-border-subtle" />

          {/* Scroll */}
          <div className="max-h-[70vh] overflow-auto pb-8 pt-3">
            {children}
            {/* espacio extra para que el contenido “termine” con aire */}
            <div className="h-6" />
          </div>
        </div>

        {/* “Cierre visual” inferior + safe-area */}
        <div
          className="h-8"
          style={{
            paddingBottom: "env(safe-area-inset-bottom)",
            background:
              "linear-gradient(to top, rgba(0,0,0,0.06), rgba(0,0,0,0))",
          }}
        />
      </div>
    </div>
  );
}

/**
 * Abrevia etiquetas de productos (para ejes), manteniendo claridad.
 * Ej: "Café Americano Grande" -> "Café Ameri…"
 */
function shortLabel(str, max = 18) {
  const s = String(str || "");
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

export default function ReportsDashboard({ initialRange, initialBundle }) {
  const router = useRouter();
  const [tab, setTab] = useState("income"); // income | products | orders
  const [from, setFrom] = useState(initialRange?.from || "");
  const [to, setTo] = useState(initialRange?.to || "");
  const [preset, setPreset] = useState(initialRange?.preset || "7d");
  const [isPending, startTransition] = useTransition();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const bundle = initialBundle || { ok: false, error: "Sin datos" };

  const dailyChart = useMemo(() => {
    const list = Array.isArray(bundle.daily) ? bundle.daily : [];
    return list.map((d) => ({
      label: d.label,
      revenue: Number(d.revenueCents || 0) / 100,
      orders: Number(d.orders || 0),
    }));
  }, [bundle]);

  const topQtyChart = useMemo(() => {
    const list = Array.isArray(bundle.topByQty) ? bundle.topByQty : [];
    return list.map((p) => ({
      name: p.product_name,
      qty: Number(p.qty || 0),
    }));
  }, [bundle]);

  const topRevenueChart = useMemo(() => {
    const list = Array.isArray(bundle.topByRevenue) ? bundle.topByRevenue : [];
    return list.map((p) => ({
      name: p.product_name,
      revenue: Number(p.revenueCents || 0) / 100,
    }));
  }, [bundle]);

  function pushWithParams(next) {
    const sp = new URLSearchParams();

    if (next.preset && next.preset !== "custom") {
      sp.set("preset", next.preset);
    } else {
      if (next.from) sp.set("from", next.from);
      if (next.to) sp.set("to", next.to);
      sp.set("preset", "custom");
    }

    startTransition(() => {
      router.push(`/reports?${sp.toString()}`);
    });
  }

  function onPreset(p) {
    setPreset(p);
    if (p !== "custom") {
      setFrom("");
      setTo("");
    }
    pushWithParams({ preset: p });
  }

  function onApplyManual() {
    setPreset("custom");
    pushWithParams({ preset: "custom", from, to });
  }

  function openOrder(o) {
    setActiveOrder(o);
    setSheetOpen(true);
  }

  const k = bundle.kpis;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-2xl border border-border-subtle bg-app p-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap gap-2">
            <TabButton
              active={preset === "today"}
              onClick={() => onPreset("today")}
            >
              Hoy
            </TabButton>
            <TabButton
              active={preset === "yesterday"}
              onClick={() => onPreset("yesterday")}
            >
              Ayer
            </TabButton>
            <TabButton active={preset === "7d"} onClick={() => onPreset("7d")}>
              7 días
            </TabButton>
            <TabButton
              active={preset === "30d"}
              onClick={() => onPreset("30d")}
            >
              30 días
            </TabButton>

            <span className="mx-2 hidden h-9 w-px bg-border-subtle md:block" />

            <div className="grid grid-cols-2 gap-2 md:flex md:items-end">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-text-soft">
                  Desde
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-app px-3 py-2 text-sm text-text-main"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-wide text-text-soft">
                  Hasta
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-xl border border-border-subtle bg-app px-3 py-2 text-sm text-text-main"
                />
              </div>
              <button
                type="button"
                onClick={onApplyManual}
                disabled={isPending || !from || !to}
                className={cn(
                  "h-10 rounded-xl px-4 text-sm font-semibold transition md:ml-2",
                  isPending || !from || !to
                    ? "cursor-not-allowed bg-border-subtle/50 text-text-muted"
                    : "bg-text-main text-app hover:opacity-90"
                )}
              >
                {isPending ? "Actualizando…" : "Actualizar"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 md:justify-end">
            <div className="text-xs text-text-muted">
              {bundle?.range?.from && bundle?.range?.to ? (
                <>
                  Rango:{" "}
                  <span className="text-text-main">{bundle.range.from}</span> →{" "}
                  <span className="text-text-main">{bundle.range.to}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === "income"} onClick={() => setTab("income")}>
          Ingresos
        </TabButton>
        <TabButton
          active={tab === "products"}
          onClick={() => setTab("products")}
        >
          Productos
        </TabButton>
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
          Órdenes
        </TabButton>
      </div>

      {/* Error */}
      {!bundle.ok ? (
        <div className="rounded-2xl border border-border-subtle bg-app p-4 text-sm text-rose-700">
          {bundle.error || "No se pudo cargar el reporte."}
        </div>
      ) : null}

      {/* Content */}
      {bundle.ok && tab === "income" ? (
        <section className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <KPI
              label="Ingresos"
              value={k?.revenueLabel || money(k?.revenueCents)}
              hint="Suma de total_cents"
            />
            <KPI
              label="Órdenes"
              value={String(k?.ordersCount || 0)}
              hint="Total de órdenes en el rango"
            />
            <KPI
              label="Ticket promedio"
              value={k?.avgTicketLabel || money(k?.avgTicketCents)}
              hint="Ingresos / órdenes"
            />
            <KPI
              label="Operación"
              value={`${k?.paidCount || 0} pagadas • ${
                k?.printedCount || 0
              } impresas`}
              hint="Lectura rápida de pagos/impresión"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {/* Ingresos */}
            <div className="rounded-2xl border border-border-subtle bg-app p-4 min-w-0">
              <div className="mb-3">
                <div className="text-sm font-semibold text-text-main">
                  Ingresos por día
                </div>
                <div className="text-xs text-text-muted">
                  Tendencia de ingresos (MXN) — visual ejecutivo
                </div>
              </div>

              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyChart}
                    margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
                  >
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: CHART.axis }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 12, fill: CHART.axis }} />
                    <Tooltip
                      content={
                        <ChartTooltip
                          formatter={(v) => money(Math.round(Number(v) * 100))}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Ingresos"
                      stroke={CHART.primary}
                      fill={CHART.primarySoft}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Órdenes */}
            <div className="rounded-2xl border border-border-subtle bg-app p-4 min-w-0">
              <div className="mb-3">
                <div className="text-sm font-semibold text-text-main">
                  Órdenes por día
                </div>
                <div className="text-xs text-text-muted">
                  Volumen operativo (conteo de órdenes)
                </div>
              </div>

              <div className="h-64 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyChart}
                    margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
                  >
                    <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 12, fill: CHART.axis }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: CHART.axis }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="orders"
                      name="Órdenes"
                      fill={CHART.neutralBar}
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {bundle.ok && tab === "products" ? (
        <section className="space-y-3">
          <div className="rounded-2xl border border-border-subtle bg-app p-4">
            <div className="text-sm font-semibold text-text-main">
              Consolidado para compras (cantidad vendida)
            </div>
            <div className="text-xs text-text-muted">
              Clave para inventario: unidades vendidas por producto en el rango.
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {/* Top qty */}
              <div className="rounded-2xl border border-border-subtle bg-app p-4">
                <div className="mb-2 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-text-main">
                      Top por cantidad
                    </div>
                    <div className="text-xs text-text-muted">
                      Etiquetas completas en tooltip + valores visibles
                    </div>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topQtyChart}
                      layout="vertical"
                      margin={{ left: 16, right: 18, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid
                        stroke={CHART.grid}
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: CHART.axis }}
                        allowDecimals={false}
                      />
                      {/* En vez de intentar mostrar nombre completo (se corta),
                          mostramos abreviado + tooltip con el nombre completo */}
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12, fill: CHART.axis }}
                        width={130}
                        tickFormatter={(v) => shortLabel(v, 18)}
                      />
                      <Tooltip
                        content={<ChartTooltip formatter={(v) => String(v)} />}
                        labelFormatter={(lbl) => `Producto: ${lbl}`}
                      />
                      <Bar
                        dataKey="qty"
                        name="Cantidad"
                        fill={CHART.good}
                        radius={[10, 10, 10, 10]}
                      >
                        {/* Valor al final de cada barra */}
                        <LabelList
                          dataKey="qty"
                          position="right"
                          fill={CHART.text}
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top revenue */}
              <div className="rounded-2xl border border-border-subtle bg-app p-4">
                <div className="mb-2">
                  <div className="text-sm font-semibold text-text-main">
                    Top por ingresos
                  </div>
                  <div className="text-xs text-text-muted">
                    Prioridad para estrategia: qué deja más dinero
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topRevenueChart}
                      layout="vertical"
                      margin={{ left: 16, right: 18, top: 10, bottom: 10 }}
                    >
                      <CartesianGrid
                        stroke={CHART.grid}
                        strokeDasharray="3 3"
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 12, fill: CHART.axis }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12, fill: CHART.axis }}
                        width={130}
                        tickFormatter={(v) => shortLabel(v, 18)}
                      />
                      <Tooltip
                        content={
                          <ChartTooltip formatter={(v) => moneyFromMXN(v)} />
                        }
                        labelFormatter={(lbl) => `Producto: ${lbl}`}
                      />
                      <Bar
                        dataKey="revenue"
                        name="Ingresos (MXN)"
                        fill={CHART.primary}
                        radius={[10, 10, 10, 10]}
                      >
                        <LabelList
                          dataKey="revenue"
                          position="right"
                          fill={CHART.text}
                          fontSize={12}
                          formatter={(v) => moneyFromMXN(v)}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tabla para compras */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-border-subtle">
              <table className="w-full text-sm">
                <thead className="bg-border-subtle/20 text-left text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-3 py-2">Producto</th>
                    <th className="px-3 py-2">SKU</th>
                    <th className="px-3 py-2 text-right">Cantidad</th>
                    <th className="px-3 py-2 text-right">Precio prom.</th>
                    <th className="px-3 py-2 text-right">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {(bundle.topByQty || []).map((p) => (
                    <tr key={p.key} className="border-t border-border-subtle">
                      <td className="px-3 py-2 font-medium text-text-main">
                        {p.product_name}
                      </td>
                      <td className="px-3 py-2 text-text-muted">
                        {p.product_sku || "—"}
                      </td>
                      <td className="px-3 py-2 text-right text-text-main">
                        {p.qty}
                      </td>
                      <td className="px-3 py-2 text-right text-text-main">
                        {money(p.avgUnitCents)}
                      </td>
                      <td className="px-3 py-2 text-right text-text-main">
                        {money(p.revenueCents)}
                      </td>
                    </tr>
                  ))}
                  {(bundle.topByQty || []).length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-text-muted" colSpan={5}>
                        No hay productos en el rango seleccionado.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {bundle.ok && tab === "orders" ? (
        <section className="space-y-3">
          <div className="rounded-2xl border border-border-subtle bg-app p-4">
            <div className="text-sm font-semibold text-text-main">
              Órdenes recientes
            </div>
            <div className="text-xs text-text-muted">
              Toca una orden para ver detalle (en mobile abre bottom sheet).
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border-subtle">
              <table className="w-full text-sm">
                <thead className="bg-border-subtle/20 text-left text-xs uppercase tracking-wide text-text-soft">
                  <tr>
                    <th className="px-3 py-2">Folio</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Pago</th>
                    <th className="px-3 py-2">Creada</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(bundle.orders || []).map((o) => (
                    <tr
                      key={o.id}
                      className="cursor-pointer border-t border-border-subtle hover:bg-border-subtle/20"
                      onClick={() => openOrder(o)}
                    >
                      <td className="px-3 py-2 font-semibold text-text-main">
                        #{o.folio}
                      </td>
                      <td className="px-3 py-2">
                        <Chip tone={statusTone(o.status)}>{o.status}</Chip>
                      </td>
                      <td className="px-3 py-2">
                        <Chip tone={payTone(o.payment_status)}>
                          {o.payment_status}
                        </Chip>
                      </td>
                      <td className="px-3 py-2 text-text-muted">
                        {new Date(o.created_at).toLocaleString("es-MX", {
                          timeZone: "America/Mexico_City",
                        })}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-text-main">
                        {money(o.total_cents)}
                      </td>
                    </tr>
                  ))}
                  {(bundle.orders || []).length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-text-muted" colSpan={5}>
                        No hay órdenes en el rango.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          <BottomSheet
            open={sheetOpen}
            onClose={() => setSheetOpen(false)}
            title={activeOrder ? `Orden #${activeOrder.folio}` : "Orden"}
          >
            {activeOrder ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone={statusTone(activeOrder.status)}>
                    {activeOrder.status}
                  </Chip>
                  <Chip tone={payTone(activeOrder.payment_status)}>
                    {activeOrder.payment_status}
                  </Chip>
                  {activeOrder.printed_at ? (
                    <Chip tone="info">impresa</Chip>
                  ) : (
                    <Chip>no impresa</Chip>
                  )}
                  {activeOrder.paid_at ? (
                    <Chip tone="good">con pago</Chip>
                  ) : (
                    <Chip tone="warn">sin pago</Chip>
                  )}
                </div>

                <div className="rounded-2xl border border-border-subtle bg-app p-3 text-sm">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-text-soft">
                        Creada
                      </div>
                      <div className="text-text-main">
                        {new Date(activeOrder.created_at).toLocaleString(
                          "es-MX",
                          {
                            timeZone: "America/Mexico_City",
                          }
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-text-soft">
                        Cliente
                      </div>
                      <div className="text-text-main">
                        {activeOrder.customer_name || "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border-subtle">
                  <table className="w-full text-sm">
                    <thead className="bg-border-subtle/20 text-left text-xs uppercase tracking-wide text-text-soft">
                      <tr>
                        <th className="px-3 py-2">Producto</th>
                        <th className="px-3 py-2 text-right">Cant.</th>
                        <th className="px-3 py-2 text-right">Unit</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeOrder.kiosk_order_items || []).map((it) => (
                        <tr
                          key={it.id}
                          className="border-t border-border-subtle"
                        >
                          <td className="px-3 py-2 font-medium text-text-main">
                            {it.product_name}
                          </td>
                          <td className="px-3 py-2 text-right text-text-main">
                            {it.quantity}
                          </td>
                          <td className="px-3 py-2 text-right text-text-main">
                            {money(it.unit_price_cents)}
                          </td>
                          <td className="px-3 py-2 text-right text-text-main">
                            {money(it.total_price_cents)}
                          </td>
                        </tr>
                      ))}
                      {(activeOrder.kiosk_order_items || []).length === 0 ? (
                        <tr>
                          <td className="px-3 py-4 text-text-muted" colSpan={4}>
                            Sin items.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>

                <div className="grid gap-2 md:grid-cols-4">
                  <div className="rounded-2xl border border-border-subtle bg-app p-3">
                    <div className="text-xs uppercase tracking-wide text-text-soft">
                      Subtotal
                    </div>
                    <div className="text-text-main font-semibold">
                      {money(activeOrder.subtotal_cents)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-app p-3">
                    <div className="text-xs uppercase tracking-wide text-text-soft">
                      Descuento
                    </div>
                    <div className="text-text-main font-semibold">
                      {money(activeOrder.discount_cents)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-app p-3">
                    <div className="text-xs uppercase tracking-wide text-text-soft">
                      Impuestos
                    </div>
                    <div className="text-text-main font-semibold">
                      {money(activeOrder.tax_cents)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border-subtle bg-app p-3">
                    <div className="text-xs uppercase tracking-wide text-text-soft">
                      Total
                    </div>
                    <div className="text-text-main font-semibold">
                      {money(activeOrder.total_cents)}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </BottomSheet>
        </section>
      ) : null}
    </div>
  );
}
