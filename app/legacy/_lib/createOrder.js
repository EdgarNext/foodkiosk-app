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

export async function submitLegacyOrder(prevState, formData) {
  if (!supabaseUrl || !supabaseKey) {
    return { success: false, error: missingConfigError() };
  }

  const payloadRaw = formData.get("payload");
  if (!payloadRaw) {
    return { success: false, error: "Payload vacío" };
  }

  let payload;
  try {
    payload = JSON.parse(payloadRaw);
  } catch (e) {
    return { success: false, error: "Payload inválido" };
  }

  const {
    subtotal_cents,
    discount_cents = 0,
    tax_cents = 0,
    total_cents,
    items,
    customer_name,
    customer_note,
    service_type,
    service_location
  } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    return { success: false, error: "La orden no tiene items" };
  }

  const orderPayload = {
    status: "pending",
    payment_status: "unpaid",
    source: "kiosk",
    subtotal_cents,
    discount_cents,
    tax_cents,
    total_cents,
    customer_name: customer_name || null,
    customer_note: customer_note || null,
    service_type: service_type || null,
    service_location: service_location || null
  };

  try {
    // 1) Crear orden
    const orderRes = await fetch(`${supabaseUrl}/rest/v1/kiosk_orders`, {
      method: "POST",
      headers: defaultHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation"
      }),
      body: JSON.stringify(orderPayload)
    });

    if (!orderRes.ok) {
      const detail = await parseResponse(orderRes);
      return {
        success: false,
        error: `No se pudo crear la orden (${orderRes.status}): ${detail}`
      };
    }

    const orderData = await orderRes.json();
    const order = Array.isArray(orderData) ? orderData[0] : orderData;

    // 2) Insertar items
    const itemsPayload = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_sku: item.product_sku || null,
      category_id: item.category_id || null,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      total_price_cents: item.total_price_cents,
      notes: item.notes || null,
      metadata: item.metadata || {}
    }));

    const itemsRes = await fetch(`${supabaseUrl}/rest/v1/kiosk_order_items`, {
      method: "POST",
      headers: defaultHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=minimal"
      }),
      body: JSON.stringify(itemsPayload)
    });

    if (!itemsRes.ok) {
      const detail = await parseResponse(itemsRes);
      return {
        success: false,
        error: `Items no guardados (${itemsRes.status}): ${detail}`
      };
    }

    return {
      success: true,
      error: null,
      orderId: order.id,
      folio: order.folio
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
