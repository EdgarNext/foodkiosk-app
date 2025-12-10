'use client';

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { submitLegacyOrder } from "../_lib/createOrder";
import { useLegacyOrderStore } from "../_lib/useLegacyOrderStore";

const initialState = { success: false, error: null, orderId: null, folio: null };

export default function LegacyConfirmModal() {
  const router = useRouter();
  const cart = useLegacyOrderStore((state) => state.cart);
  const total = useLegacyOrderStore((state) => state.total);
  const clearCart = useLegacyOrderStore((state) => state.clearCart);
  const setLastAction = useLegacyOrderStore((state) => state.setLastAction);

  const [state, formAction] = useActionState(submitLegacyOrder, initialState);
  const [printData, setPrintData] = useState(null);
  const [printedAt, setPrintedAt] = useState(null);
  const [hasPrinted, setHasPrinted] = useState(false);

  const subtotalCents = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + Math.round((item.price ?? 0) * 100) * (item.quantity ?? 1),
        0
      ),
    [cart]
  );

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

    return {
      subtotal_cents: subtotalCents,
      discount_cents: 0,
      tax_cents: 0,
      total_cents: subtotalCents,
      items,
      source: "kiosk"
    };
  }, [cart, subtotalCents]);

  useEffect(() => {
    if (state?.success && !hasPrinted) {
      const now = new Date();
      setPrintedAt(now);
      setPrintData({
        folio: state.folio,
        orderId: state.orderId,
        total_cents: payload.total_cents,
        subtotal_cents: payload.subtotal_cents,
        items: payload.items,
        timestamp: now
      });
      setHasPrinted(true);
      setLastAction(
        state.folio ? `Orden enviada (folio ${state.folio})` : "Orden enviada"
      );
      if (typeof window !== "undefined") {
        setTimeout(() => window.print(), 150);
      }
      clearCart();
    }
  }, [state, hasPrinted, clearCart, setLastAction]);

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-2xl border border-border-subtle overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-soft">
              Confirmar pedido
            </p>
            <p className="text-lg font-semibold">Revisa tu orden</p>
          </div>
          <button
            className="text-sm text-text-muted hover:text-text-main"
            onClick={handleClose}
          >
            Cerrar
          </button>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-auto">
          {state?.error ? (
            <div className="text-sm text-danger border border-danger/40 bg-danger/10 rounded-lg px-3 py-2">
              {state.error}
            </div>
          ) : null}
          {cart.length === 0 ? (
            <p className="text-sm text-text-muted">
              No hay productos en la orden.
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 border-b border-border-subtle pb-3"
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
            ))
          )}
        </div>
        <div className="p-4 border-t border-border-subtle space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Total</span>
            <span>
              {total.toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN"
              })}
            </span>
          </div>
          {state?.success && printData ? (
            <div className="space-y-2">
              <div className="text-sm text-success font-semibold">
                Orden enviada. Folio: {printData.folio ?? "N/A"}
              </div>
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-lg bg-brand text-brand-on font-semibold"
                onClick={handleClose}
              >
                Cerrar
              </button>
            </div>
          ) : (
            <form action={formAction} className="flex items-center justify-end gap-2 pt-2">
              <input type="hidden" name="payload" value={JSON.stringify(payload)} />
              <button
                type="button"
                className="px-3 py-2 text-sm rounded-lg border border-border-subtle text-text-main hover:border-border-strong"
                onClick={handleClose}
              >
                Volver a editar
              </button>
              <SubmitButton disabled={cart.length === 0} />
            </form>
          )}
        </div>
      </div>

      {printData ? (
        <>
          <div className="legacy-print-ticket">
            <p className="text-center text-base font-semibold">
              Ticket de pedido
            </p>
            <p className="text-center text-sm">Folio: {printData.folio ?? "N/A"}</p>
            <p className="text-center text-xs text-text-muted">
              {printedAt
                ? printedAt.toLocaleString("es-MX", {
                    hour12: false
                  })
                : ""}
            </p>
            <div className="mt-3 space-y-2">
              {printData.items.map((item, idx) => (
                <div key={`${item.product_name}-${item.product_id}-${idx}`} className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">{item.product_name}</span>
                    <span>
                      {(item.total_price_cents / 100).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN"
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-text-muted flex justify-between">
                    <span>
                      {item.quantity} x{" "}
                      {(item.unit_price_cents / 100).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN"
                      })}
                    </span>
                    {item.product_sku ? <span>SKU: {item.product_sku}</span> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-border-subtle pt-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  {(printData.subtotal_cents / 100).toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN"
                  })}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {(printData.total_cents / 100).toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN"
                  })}
                </span>
              </div>
            </div>
          </div>
          <style jsx global>{`
            @media print {
              html,
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: auto;
              }
              body * {
                visibility: hidden !important;
              }
              .legacy-print-ticket {
                position: fixed !important;
                inset: 0;
                padding: 16px;
                width: 100%;
                box-sizing: border-box;
                height: auto;
                font-family: "Inter", system-ui, -apple-system, sans-serif;
                background: white;
                color: #111827;
                visibility: visible !important;
                page-break-after: avoid;
              }
              .legacy-print-ticket * {
                visibility: visible !important;
              }
            }
          `}</style>
        </>
      ) : null}
    </div>
  );
}

function SubmitButton({ disabled }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="px-3 py-2 text-sm rounded-lg bg-brand text-brand-on font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
      disabled={disabled || pending}
    >
      {pending ? "Enviando..." : "Confirmar pedido"}
    </button>
  );
}
