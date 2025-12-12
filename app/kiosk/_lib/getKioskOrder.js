'use server';

import { createClient } from "@/app/_lib/supabase/server";

function normalizeOrder(raw) {
  if (!raw) return null;
  const items = Array.isArray(raw.kiosk_order_items)
    ? raw.kiosk_order_items.sort((a, b) => {
        const aDate = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const bDate = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return aDate - bDate;
      })
    : [];

  return { ...raw, kiosk_order_items: items };
}

export async function getKioskOrderWithItems(orderId) {
  if (!orderId) {
    return { data: null, error: "orderId requerido" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("kiosk_orders")
    .select("*, kiosk_order_items(*)")
    .eq("id", orderId)
    .single();

  if (error) {
    return {
      data: null,
      error: error.message || "No se pudo obtener la orden"
    };
  }

  return { data: normalizeOrder(data), error: null };
}
