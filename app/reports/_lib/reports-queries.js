// app/reports/_lib/reports-queries.js
import { createClient } from "@/app/_lib/supabase/server";

const TZ = "America/Mexico_City";

function moneyFromCents(cents) {
  const n = Number(cents || 0) / 100;
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(n);
}

function dateLabelFromISO(yyyyMmDd) {
  // etiqueta corta "lun 11 dic"
  const d = new Date(`${yyyyMmDd}T12:00:00-06:00`);
  return d.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: TZ,
  });
}

function toLocalDayKey(iso) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

export async function fetchReportsBundle({
  from,
  to,
  fromIso,
  toIso,
}) {
  const supabase = await createClient();

  // Órdenes + items (mínimos campos útiles para reportes)
  let ordersQuery = supabase
    .from("kiosk_orders")
    .select(
      `
      id,
      folio,
      status,
      payment_status,
      subtotal_cents,
      discount_cents,
      tax_cents,
      total_cents,
      customer_name,
      source,
      created_at,
      printed_at,
      paid_at,
      kiosk_order_items (
        id,
        product_id,
        product_name,
        product_sku,
        quantity,
        unit_price_cents,
        total_price_cents
      )
    `
    )
    .gte("created_at", fromIso)
    .lte("created_at", toIso)
    .order("created_at", { ascending: false });

  const { data: orders, error } = await ordersQuery;

  if (error) {
    return {
      ok: false,
      range: { from, to },
      error: error.message || "Error consultando reportes",
      kpis: null,
      daily: [],
      topByQty: [],
      topByRevenue: [],
      orders: [],
    };
  }

  const safeOrders = Array.isArray(orders) ? orders : [];

  // KPIs
  let revenueCents = 0;
  let ordersCount = 0;
  let paidCount = 0;
  let printedCount = 0;

  for (const o of safeOrders) {
    ordersCount += 1;
    revenueCents += Number(o.total_cents || 0);
    if (o.payment_status === "paid") paidCount += 1;
    if (o.printed_at) printedCount += 1;
  }

  const avgTicketCents = ordersCount
    ? Math.round(revenueCents / ordersCount)
    : 0;

  // Ingresos por día (local)
  const dailyMap = new Map(); // day -> { day, label, revenueCents, orders }
  for (const o of safeOrders) {
    const day = toLocalDayKey(o.created_at);
    const existing = dailyMap.get(day) || {
      day,
      label: dateLabelFromISO(day),
      revenueCents: 0,
      orders: 0,
    };
    existing.revenueCents += Number(o.total_cents || 0);
    existing.orders += 1;
    dailyMap.set(day, existing);
  }

  // Rellenar días faltantes del rango (para gráfica continua)
  // (desde from..to inclusive, interpretado como CDMX)
  const fromDt = new Date(`${from}T00:00:00-06:00`);
  const toDt = new Date(`${to}T00:00:00-06:00`);
  const daily = [];
  for (let d = new Date(fromDt); d <= toDt; d.setDate(d.getDate() + 1)) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const key = `${y}-${m}-${dd}`;
    daily.push(
      dailyMap.get(key) || {
        day: key,
        label: dateLabelFromISO(key),
        revenueCents: 0,
        orders: 0,
      }
    );
  }

  // Consolidado de productos (cantidad + ingresos)
  const productMap = new Map(); // key -> { name, sku, qty, revenueCents, avgUnitCents }
  for (const o of safeOrders) {
    const items = Array.isArray(o.kiosk_order_items) ? o.kiosk_order_items : [];
    for (const it of items) {
      const key = it.product_id || it.product_sku || it.product_name;
      const existing = productMap.get(key) || {
        key,
        product_id: it.product_id || null,
        product_name: it.product_name,
        product_sku: it.product_sku || null,
        qty: 0,
        revenueCents: 0,
        unitPriceSamples: [],
      };

      existing.qty += Number(it.quantity || 0);
      existing.revenueCents += Number(it.total_price_cents || 0);
      if (it.unit_price_cents != null)
        existing.unitPriceSamples.push(Number(it.unit_price_cents));
      productMap.set(key, existing);
    }
  }

  const products = Array.from(productMap.values()).map((p) => {
    const avg =
      p.unitPriceSamples.length > 0
        ? Math.round(
            p.unitPriceSamples.reduce((a, b) => a + b, 0) /
              p.unitPriceSamples.length
          )
        : 0;

    return {
      ...p,
      avgUnitCents: avg,
      revenueLabel: moneyFromCents(p.revenueCents),
    };
  });

  const topByQty = [...products].sort((a, b) => b.qty - a.qty);

  const topByRevenue = [...products].sort(
    (a, b) => b.revenueCents - a.revenueCents
  );

  return {
    ok: true,
    range: { from, to },
    kpis: {
      revenueCents,
      revenueLabel: moneyFromCents(revenueCents),
      ordersCount,
      avgTicketCents,
      avgTicketLabel: moneyFromCents(avgTicketCents),
      paidCount,
      printedCount,
    },
    daily,
    topByQty,
    topByRevenue,
    orders: safeOrders,
  };
}
