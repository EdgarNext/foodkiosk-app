import TicketPrintClient from "./TicketPrintClient";
import { getLegacyOrderWithItems } from "../../_lib/getLegacyOrder";

export const revalidate = 0;

function toCents(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function buildTicket(order) {
  const items = Array.isArray(order.kiosk_order_items)
    ? order.kiosk_order_items.map((item) => {
        const quantity = Number(item.quantity ?? 0) || 0;
        const unitPriceCents = toCents(item.unit_price_cents);
        const totalPriceCents = toCents(
          item.total_price_cents,
          unitPriceCents * quantity
        );

        return {
          name: item.product_name ?? "Producto",
          quantity,
          unitPriceCents,
          totalPriceCents,
          sku: item.product_sku ?? null
        };
      })
    : [];

  const computedSubtotal = items.reduce(
    (acc, item) => acc + (item.totalPriceCents || 0),
    0
  );

  const subtotalCents = toCents(order.subtotal_cents, computedSubtotal);
  const totalCents = toCents(order.total_cents, subtotalCents);

  return {
    orderId: order.id,
    folio: order.folio ?? order.id,
    createdAt: order.created_at,
    items,
    subtotalCents,
    totalCents
  };
}

export default async function TicketPage(props) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  const orderId = resolvedParams?.orderId;
  const autoPrint = resolvedSearchParams?.justCreated === "1";
  const redirectPath = "/legacy";

  const { data, error } = await getLegacyOrderWithItems(orderId);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="max-w-md w-full rounded-xl border border-border-subtle bg-white shadow-sm p-6 text-center space-y-3">
          <p className="text-lg font-semibold">No se pudo cargar el ticket</p>
          <p className="text-sm text-text-muted">{error}</p>
          <a
            href="/legacy"
            className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border-subtle text-sm font-semibold text-text-main"
          >
            Volver
          </a>
        </div>
      </div>
    );
  }

  const ticket = data ? buildTicket(data) : null;

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="max-w-md w-full rounded-xl border border-border-subtle bg-white shadow-sm p-6 text-center space-y-3">
          <p className="text-lg font-semibold">Ticket no disponible</p>
          <p className="text-sm text-text-muted">
            No encontramos información para la orden solicitada.
          </p>
          <a
            href="/legacy"
            className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-lg border border-border-subtle text-sm font-semibold text-text-main"
          >
            Volver
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4 py-10">
      <TicketPrintClient
        ticket={ticket}
        autoPrint={autoPrint}
        redirectPath={autoPrint ? redirectPath : null}
      />
    </div>
  );
}
