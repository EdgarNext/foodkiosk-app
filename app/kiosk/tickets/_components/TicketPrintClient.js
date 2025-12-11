"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

export default function TicketPrintClient({
  ticket,
  autoPrint = false,
  onFinishOrder = null
}) {
  const printedRef = useRef(false);
  const router = useRouter();

  const handleGoHome = () => {
    onFinishOrder?.();
    router.replace("/kiosk?newOrder=1");
  };

  useEffect(() => {
    if (!autoPrint || printedRef.current) return;
    printedRef.current = true;

    const timer = setTimeout(() => {
      window.print();
    }, 150);

    return () => clearTimeout(timer);
  }, [autoPrint]);

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
              Tiket: {ticket.ticketNumber ?? ticket.folio ?? ticket.orderId ?? "N/A"}
            </p>
            {formattedDate ? (
              <p className="ticket__meta">{formattedDate}</p>
            ) : null}
          </div>

          <div className="ticket__items">
            {ticket.items?.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="ticket__item">
                <div className="ticket__item-row">
                  <span className="ticket__item-name">
                    {item.quantity} x {item.name}
                  </span>
                  <span className="ticket__item-total">
                    {(item.totalPriceCents / 100).toLocaleString("es-MX", {
                      style: "currency",
                      currency: "MXN"
                    })}
                  </span>
                </div>
                <div className="ticket__item-row ticket__item-row--muted">
                  <span>
                    {item.unitPriceCents
                      ? (item.unitPriceCents / 100).toLocaleString("es-MX", {
                          style: "currency",
                          currency: "MXN"
                        })
                      : ""}
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

          <div className="ticket__footer">
            <p>Paga este tiket en caja.</p>
            <p>No es comprobante fiscal.</p>
            {ticket.customerName ? (
              <p>Cliente: {ticket.customerName}</p>
            ) : null}
            {ticket.serviceLocation ? (
              <p>Área/Mesa: {ticket.serviceLocation}</p>
            ) : null}
            <p className="ticket__thanks">Gracias por su pedido</p>
          </div>
        </div>

        <div className="print-actions">
          <button
            type="button"
            className="print-actions__button"
            onClick={() => window.print()}
          >
            Imprimir tiket
          </button>
          <button
            type="button"
            className="print-actions__button print-actions__button--primary"
            onClick={handleGoHome}
          >
            Todo listo / Nuevo pedido
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
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ticket__thanks {
          margin-top: 6px;
          font-weight: 600;
          color: #111827;
        }

        .print-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          width: 100%;
          max-width: 320px;
        }

        .print-actions__button {
          flex: 1;
          padding: 14px 16px;
          font-size: 15px;
          font-weight: 700;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          background: #fff;
          color: #111827;
          cursor: pointer;
        }

        .print-actions__button--primary {
          background: var(--color-brand, #2563eb);
          color: var(--color-brand-on, #fff);
          border-color: var(--color-brand, #2563eb);
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
