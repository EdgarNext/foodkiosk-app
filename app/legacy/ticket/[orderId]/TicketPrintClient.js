"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

export default function TicketPrintClient({
  ticket,
  autoPrint = false,
  redirectPath = null,
  redirectDelayMs = 2000
}) {
  const printedRef = useRef(false);
  const router = useRouter();

  const handleGoHome = () => {
    if (redirectPath) {
      router.push(redirectPath);
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    } else {
      router.push("/legacy");
    }
  };

  useEffect(() => {
    if (!autoPrint || printedRef.current) return;
    printedRef.current = true;

    const timer = setTimeout(() => {
      window.print();

      if (redirectPath) {
        setTimeout(() => {
          router.push(redirectPath);
        }, redirectDelayMs);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [autoPrint, redirectPath, redirectDelayMs, router]);

  const createdAt = ticket?.createdAt;

  const formattedDate = useMemo(() => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("es-MX", { hour12: false });
  }, [createdAt]);

  if (!ticket) return null;

  return (
    <>
      <div className="ticket-shell">
        <div className="ticket">
          <div className="ticket__header">
            <p className="ticket__title">Ticket de pedido</p>
            <p className="ticket__folio">
              Folio: {ticket.folio ?? ticket.orderId ?? "N/A"}
            </p>
            {formattedDate ? (
              <p className="ticket__meta">{formattedDate}</p>
            ) : null}
          </div>

          <div className="ticket__items">
            {ticket.items?.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="ticket__item">
                <div className="ticket__item-row">
                  <span className="ticket__item-name">{item.name}</span>
                  <span className="ticket__item-total">
                    {(item.totalPriceCents / 100).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN"
                    })}
                  </span>
                </div>
                <div className="ticket__item-row ticket__item-row--muted">
                  <span>
                    {item.quantity} x{" "}
                    {(item.unitPriceCents / 100).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN"
                    })}
                  </span>
                  {item.sku ? <span>SKU: {item.sku}</span> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="ticket__totals">
            <div className="ticket__total-row">
              <span>Subtotal</span>
              <span>
                {(ticket.subtotalCents / 100).toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN"
                })}
              </span>
            </div>
            <div className="ticket__total-row ticket__total-row--strong">
              <span>Total</span>
              <span>
                {(ticket.totalCents / 100).toLocaleString("es-MX", {
                  style: "currency",
                  currency: "MXN"
                })}
              </span>
            </div>
          </div>

          <p className="ticket__footer">Gracias por su pedido</p>
        </div>

        <div className="print-actions">
          <button
            type="button"
            className="print-actions__button"
            onClick={() => window.print()}
          >
            Imprimir
          </button>
          <button
            type="button"
            className="print-actions__button print-actions__button--ghost"
            onClick={handleGoHome}
          >
            Volver
          </button>
        </div>
      </div>

      <style jsx global>{`
        @page {
          size: auto;
          margin: 0;
        }

        body {
          margin: 0;
          background: #f5f5f5;
        }

        .ticket-shell {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .ticket {
          width: 80mm;
          box-sizing: border-box;
          background: #ffffff;
          color: #111827;
          padding: 12px 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
          font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        .ticket__header {
          text-align: center;
          margin-bottom: 12px;
        }

        .ticket__title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .ticket__folio {
          margin: 2px 0;
          font-size: 14px;
          font-weight: 600;
        }

        .ticket__meta {
          margin: 0;
          font-size: 12px;
          color: #6b7280;
        }

        .ticket__items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ticket__item {
          border-bottom: 1px dashed #e5e7eb;
          padding-bottom: 8px;
        }

        .ticket__item:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
        }

        .ticket__item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        .ticket__item-row--muted {
          color: #6b7280;
          font-size: 12px;
          margin-top: 2px;
        }

        .ticket__item-name {
          font-weight: 600;
          padding-right: 8px;
        }

        .ticket__item-total {
          font-weight: 600;
        }

        .ticket__totals {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 14px;
        }

        .ticket__total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ticket__total-row--strong {
          font-weight: 700;
        }

        .ticket__footer {
          text-align: center;
          font-size: 12px;
          color: #6b7280;
          margin-top: 10px;
          margin-bottom: 0;
        }

        .print-actions {
          display: flex;
          gap: 8px;
        }

        .print-actions__button {
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #111827;
          cursor: pointer;
        }

        .print-actions__button--ghost {
          background: transparent;
        }

        @media print {
          body {
            background: #ffffff;
          }

          .ticket-shell {
            min-height: auto;
            padding: 0;
          }

          .ticket {
            box-shadow: none;
            border: none;
            width: 80mm;
            margin: 0;
            padding: 10px;
          }

          .print-actions {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
