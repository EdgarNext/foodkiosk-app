'use server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function missingConfigError() {
  return "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY";
}

function defaultHeaders(extra = {}) {
  if (!supabaseKey) return extra;
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extra
  };
}

async function parseResponse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text || res.statusText;
  }
}

function buildAndFilter(from, to) {
  const filters = [];
  if (from) filters.push(`created_at.gte.${from}`);
  if (to) filters.push(`created_at.lte.${to}`);
  return filters.length ? `(${filters.join(",")})` : null;
}

function normalizeDateInput(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function aggregateOrders(raw) {
  const orders = Array.isArray(raw) ? raw : [];
  const totalOrders = orders.length;
  const totalCents = orders.reduce(
    (acc, order) => acc + Number(order.total_cents ?? 0),
    0
  );
  const subtotalCents = orders.reduce(
    (acc, order) => acc + Number(order.subtotal_cents ?? 0),
    0
  );

  const avgCents = totalOrders > 0 ? Math.round(totalCents / totalOrders) : 0;

  const topItemsMap = new Map();
  const dailyTotalsMap = new Map();
  orders.forEach((order) => {
    const created = order.created_at ? new Date(order.created_at) : null;
    const dateKey = created && !Number.isNaN(created.getTime())
      ? created.toISOString().slice(0, 10)
      : "sin-fecha";
    const currentDay = dailyTotalsMap.get(dateKey) || { totalCents: 0, orders: 0 };
    currentDay.totalCents += Number(order.total_cents ?? 0);
    currentDay.orders += 1;
    dailyTotalsMap.set(dateKey, currentDay);

    const items = Array.isArray(order.kiosk_order_items)
      ? order.kiosk_order_items
      : [];
    items.forEach((item) => {
      const key = item.product_name || item.product_id || "item";
      const current = topItemsMap.get(key) || {
        name: item.product_name || "Producto",
        quantity: 0,
        totalCents: 0
      };
      current.quantity += Number(item.quantity ?? 0);
      current.totalCents += Number(item.total_price_cents ?? 0);
      topItemsMap.set(key, current);
    });
  });

  const topItems = Array.from(topItemsMap.values())
    .sort((a, b) => b.totalCents - a.totalCents)
    .slice(0, 5);

  const dailyTotals = Array.from(dailyTotalsMap.entries())
    .map(([date, info]) => ({
      date,
      totalCents: info.totalCents,
      orders: info.orders
    }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const breakdownByStatus = orders.reduce((acc, order) => {
    const status = order.status || "unknown";
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    totalOrders,
    totalCents,
    subtotalCents,
    avgTicketCents: avgCents,
    topItems,
    dailyTotals,
    breakdownByStatus,
    orders
  };
}

export async function fetchOrderReports({ from, to }) {
  if (!supabaseUrl || !supabaseKey) {
    return { error: missingConfigError(), data: null };
  }

  const fromIso = normalizeDateInput(from);
  const toIso = normalizeDateInput(to);
  const params = new URLSearchParams({
    select: "*,kiosk_order_items(*)",
    order: "created_at.desc"
  });
  const andFilter = buildAndFilter(fromIso, toIso);
  if (andFilter) params.set("and", andFilter);

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/kiosk_orders?${params.toString()}`,
      {
        headers: defaultHeaders({
          Accept: "application/json"
        }),
        cache: "no-store"
      }
    );

    if (!res.ok) {
      const detail = await parseResponse(res);
      return { error: `No se pudieron obtener las órdenes: ${detail}`, data: null };
    }

    const data = await res.json();
    return { error: null, data: aggregateOrders(data) };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      data: null
    };
  }
}

export async function getOrderReportsAction(prevState, formData) {
  const from = formData.get("from");
  const to = formData.get("to");
  const result = await fetchOrderReports({ from, to });

  if (result.error) {
    return { ...prevState, error: result.error };
  }

  return {
    error: null,
    data: result.data,
    from,
    to
  };
}
