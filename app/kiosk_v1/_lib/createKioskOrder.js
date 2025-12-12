'use server';

import { createClient } from "@/app/_lib/supabase/server";

function parsePayload(formData) {
  const payloadRaw = formData.get("payload");
  if (!payloadRaw) return { error: "Payload vacío" };
  try {
    const payload = JSON.parse(payloadRaw);
    return { payload };
  } catch {
    return { error: "Payload inválido" };
  }
}

function buildOrderPayload(payload) {
  const {
    subtotal_cents,
    discount_cents = 0,
    tax_cents = 0,
    total_cents,
    customer_name,
    customer_note,
    service_type,
    service_location
  } = payload;

  return {
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
}

function buildItemsPayload(orderId, items) {
  return items.map((item) => {
    const unit = Number(item.unit_price_cents ?? 0);
    const qty = Number(item.quantity ?? 1);
    return {
      order_id: orderId,
      product_id: item.product_id || null,
      product_name: item.product_name,
      product_sku: item.product_sku || null,
      category_id: item.category_id || null,
      quantity: qty,
      unit_price_cents: unit,
      total_price_cents: Number(item.total_price_cents ?? unit * qty),
      notes: item.notes || null,
      metadata: item.metadata || {}
    };
  });
}

async function persistOrder(payload) {
  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    return { success: false, error: "La orden no tiene items" };
  }

  const supabase = await createClient();

  const orderPayload = buildOrderPayload(payload);
  const { data: order, error: orderError } = await supabase
    .from("kiosk_orders")
    .insert(orderPayload)
    .select()
    .single();

  if (orderError || !order) {
    return {
      success: false,
      error:
        orderError?.message ||
        "No se pudo crear la orden en Supabase (kiosk_orders)"
    };
  }

  const itemsPayload = buildItemsPayload(order.id, payload.items);

  const { error: itemsError } = await supabase
    .from("kiosk_order_items")
    .insert(itemsPayload);

  if (itemsError) {
    return {
      success: false,
      error:
        itemsError?.message ||
        "Items no guardados en Supabase (kiosk_order_items)"
    };
  }

  const normalizedItems = itemsPayload.map((it) => ({
    name: it.product_name,
    qty: it.quantity,
    unit_price_cents: it.unit_price_cents,
    total_price_cents: it.total_price_cents,
    sku: it.product_sku ?? null
  }));

  return {
    success: true,
    error: null,
    orderId: order.id,
    folio: order.folio,
    subtotal_cents: order.subtotal_cents,
    total_cents: order.total_cents,
    items: normalizedItems
  };
}

export async function createKioskOrder(prevState, formData) {
  const { payload, error } = parsePayload(formData);
  if (error) return { success: false, error };

  try {
    return await persistOrder(payload);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// Server action invocable desde el cliente
export async function createKioskOrderDirect(payload) {
  if (!payload) return { success: false, error: "Payload vacío" };
  try {
    return await persistOrder(payload);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
