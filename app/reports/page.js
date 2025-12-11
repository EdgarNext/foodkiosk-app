import ReportsDashboard from "./_components/ReportsDashboard";
import { fetchOrderReports } from "./_lib/getOrderReports";

export const metadata = {
  title: "Reportes",
  description: "Indicadores y detalle de órdenes del kiosko"
};

export const revalidate = 0;

function defaultRange() {
  const now = new Date();
  const end = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59
    )
  );
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10)
  };
}

export default async function ReportsPage() {
  const { from, to } = defaultRange();
  const initialResult = await fetchOrderReports({ from, to });
  const initialState = {
    error: initialResult.error,
    data: initialResult.data,
    from,
    to
  };

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-text-soft uppercase tracking-wide">
          Reportes
        </p>
        <h1 className="text-2xl font-semibold">Órdenes del kiosko</h1>
        <p className="text-sm text-text-muted">
          Explora ventas, ticket promedio y productos destacados.
        </p>
      </div>

      <ReportsDashboard initialState={initialState} />
    </div>
  );
}
