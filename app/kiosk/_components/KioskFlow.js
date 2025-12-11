'use client';

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import KioskShell from "./KioskShell";
import { useKioskOrderStore } from "../_lib/useKioskOrderStore";
import { createKioskOrder } from "../_lib/createKioskOrder";
import { useFormStatus } from "react-dom";

const initialState = {
  success: false,
  error: null,
  orderId: null,
  folio: null
};

export default function KioskFlow({ categories, products }) {
  const router = useRouter();
  const [step, setStep] = useState("select");
  const [isPrinting, setIsPrinting] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [serviceLocation, setServiceLocation] = useState("");
  const newOrderParam = useSearchParams()?.get("newOrder");
  const handledNewOrderRef = useRef(false);

  const cart = useKioskOrderStore((state) => state.cart);
  const total = useKioskOrderStore((state) => state.total);
  const clearCart = useKioskOrderStore((state) => state.clearCart);
  const resetFlow = useKioskOrderStore((state) => state.resetFlow);

  const [state, formAction] = useActionState(createKioskOrder, initialState);

  const payload = useMemo(() => {
    const items = cart.map((item) => {
      const unit_price_cents = Math.round((item.price ?? 0) * 100);
      const quantity = item.quantity ?? 1;
      return {
        product_id: item.id || null,
        product_name: item.name,
        product_sku: item.sku || null,
        category_id: item.categoryId || null,
        quantity,
        unit_price_cents,
        total_price_cents: unit_price_cents * quantity
      };
    });

    const subtotal_cents = Math.round(total * 100);

    return {
      subtotal_cents,
      discount_cents: 0,
      tax_cents: 0,
      total_cents: subtotal_cents,
      items,
      source: "kiosk",
      customer_name: customerName || null,
      service_location: serviceLocation || null
    };
  }, [cart, total, customerName, serviceLocation]);

  useEffect(() => {
    if (!state?.success || !state.orderId) return;
    // Navegamos sin limpiar estado; el carrito/step se limpian en un "nuevo pedido"
    router.replace(`/kiosk/tickets/${state.orderId}?justCreated=1`);
  }, [state, router]);

  useEffect(() => {
    if (handledNewOrderRef.current) return;
    if (newOrderParam !== "1") return;
    handledNewOrderRef.current = true;
    resetFlow();
    setStep("select");
    router.replace("/kiosk");
  }, [newOrderParam, resetFlow, router]);

  const isReview = step === "review";
  const hasItems = cart.length > 0;

  return (
    <div className="space-y-4">
      {!isReview ? (
        <KioskShell
          categories={categories}
          products={products}
          onConfirm={() => hasItems && setStep("review")}
        />
      ) : (
        <div className="w-full max-w-5xl mx-auto bg-surface border border-border-subtle rounded-2xl shadow-sm p-4 md:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-col md:flex-row md:items-center">
            <div>
              <p className="text-sm text-text-soft uppercase tracking-wide">
                Resumen de pedido
              </p>
              <h2 className="text-xl font-semibold">
                Con este tiket pagarás en caja. Después prepararemos tu pedido.
              </h2>
            </div>
            <div className="text-sm text-text-muted">
              Total:{" "}
              <span className="font-semibold text-text-main">
                {total.toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN"
                })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 border border-border-subtle rounded-xl p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      Cant: {item.quantity} x{" "}
                      {Number(item.price ?? 0).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN"
                      })}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">
                    {((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString(
                      "es-MX",
                      { style: "currency", currency: "MXN" }
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 border border-border-subtle rounded-xl p-3 bg-muted/40">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">
                  Nombre o apodo (opcional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm"
                  placeholder="Ej: Ana, Mesa 4"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-main">
                  Mesa o área (opcional)
                </label>
                <input
                  type="text"
                  value={serviceLocation}
                  onChange={(e) => setServiceLocation(e.target.value)}
                  className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm"
                  placeholder="Ej: Terraza, Barra"
                />
              </div>

              <div className="pt-2 border-t border-border-subtle space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span>Productos</span>
                  <span>{cart.length}</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    {total.toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN"
                    })}
                  </span>
                </div>
              </div>

              {state?.error ? (
                <div className="text-sm text-danger border border-danger/40 bg-danger/10 rounded-lg px-3 py-2">
                  Ocurrió un problema al generar tu tiket. Intenta de nuevo.
                  <div className="text-xs text-text-muted mt-1">{state.error}</div>
                </div>
              ) : null}

              <form action={formAction} className="space-y-2">
                <input
                  type="hidden"
                  name="payload"
                  value={JSON.stringify(payload)}
                  readOnly
                />
                <div className="flex flex-col gap-2">
                  <button
                  type="button"
                  className="w-full py-2 rounded-lg border border-border-subtle text-sm font-semibold text-text-main"
                  onClick={() => setStep("select")}
                  disabled={state?.success}
                >
                  Volver a editar
                </button>
                  <SubmitButton disabled={!hasItems} onStart={() => setIsPrinting(true)} />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isPrinting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white rounded-xl px-6 py-4 text-center max-w-xs space-y-2 shadow-xl">
            <p className="text-lg font-semibold">Generando tu tiket…</p>
            <p className="text-sm text-text-muted">
              Por favor espera un momento
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SubmitButton({ disabled, onStart }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full py-2 rounded-lg bg-brand text-brand-on font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={disabled || pending}
      onClick={() => {
        if (!disabled && !pending) {
          onStart?.();
        }
      }}
    >
      {pending ? "Generando tu tiket..." : "Generar tiket"}
    </button>
  );
}
