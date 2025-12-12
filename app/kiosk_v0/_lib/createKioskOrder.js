'use server';

import { submitLegacyOrder } from "../../legacy/_lib/createOrder";

export async function createKioskOrder(prevState, formData) {
  const payload = formData.get("payload");

  if (!payload) {
    return { success: false, error: "Payload vacío" };
  }

  try {
    // Reutilizamos la server action legacy envolviéndola con un FormData nuevo
    const fd = new FormData();
    fd.set("payload", payload);
    return await submitLegacyOrder(prevState, fd);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
