import TicketPrintContainer from "../_components/TicketPrintContainer";
import { getKioskOrderWithItems } from "../../_lib/getKioskOrder";

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
    ticketNumber: order.folio ?? order.id,
    createdAt: order.created_at,
    items,
    subtotalCents,
    totalCents,
    customerName: order.customer_name ?? null,
    serviceLocation: order.service_location ?? null
  };
}

export default async function TicketPage(props) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;

  const orderId = resolvedParams?.orderId;
  const skipAutoPrint = resolvedSearchParams?.skipAutoPrint === "1";
  const autoPrint = skipAutoPrint ? false : resolvedSearchParams?.justCreated === "1" || true;

  const { data, error } = await getKioskOrderWithItems(orderId);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="max-w-md w-full rounded-xl border border-border-subtle bg-white shadow-sm p-6 text-center space-y-3">
          <p className="text-lg font-semibold">No se pudo cargar el tiket</p>
          <p className="text-sm text-text-muted">{error}</p>
          <a
            href="/kiosk"
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
          <p className="text-lg font-semibold">Tiket no disponible</p>
          <p className="text-sm text-text-muted">
            No encontramos información para la orden solicitada.
          </p>
          <a
            href="/kiosk"
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
      <div id="kiosk-ticket-root" className="w-full flex items-center justify-center">
        <TicketPrintContainer
          ticket={ticket}
          autoPrint={autoPrint}
          redirectPath="/kiosk"
        />
      </div>
    </div>
  );
}
