'use server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function missingConfigError() {
  return "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY";
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

export async function getLegacyOrderWithItems(orderId) {
  if (!orderId) {
    return { data: null, error: "orderId requerido" };
  }

  if (!supabaseUrl || !supabaseKey) {
    return { data: null, error: missingConfigError() };
  }

  const searchParams = new URLSearchParams({
    id: `eq.${orderId}`,
    select: "*,kiosk_order_items(*)"
  });

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/kiosk_orders?${searchParams.toString()}`, {
      headers: defaultHeaders({
        Accept: "application/json"
      }),
      cache: "no-store"
    });

    if (!res.ok) {
      const detail = await parseResponse(res);
      return {
        data: null,
        error: `No se pudo obtener la orden (${res.status}): ${detail}`
      };
    }

    const raw = await res.json();
    const order = Array.isArray(raw) ? raw[0] : raw;

    if (!order) {
      return { data: null, error: "Orden no encontrada" };
    }

    const items = Array.isArray(order.kiosk_order_items)
      ? [...order.kiosk_order_items].sort((a, b) => {
          const aDate = a?.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b?.created_at ? new Date(b.created_at).getTime() : 0;
          return aDate - bDate;
        })
      : [];

    return {
      data: { ...order, kiosk_order_items: items },
      error: null
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
