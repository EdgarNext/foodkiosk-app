'use client';

import { useActionState, useMemo, useState } from "react";
import { getOrderReportsAction } from "../_lib/getOrderReports";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const currencyFmt = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN"
});

export default function ReportsDashboard({ initialState }) {
  const [state, formAction] = useActionState(getOrderReportsAction, initialState);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const summary = state?.data;
  const from = state?.from;
  const to = state?.to;

  const totals = useMemo(() => {
    if (!summary) return null;
    return {
      totalOrders: summary.totalOrders,
      total: currencyFmt.format((summary.totalCents ?? 0) / 100),
      avg: currencyFmt.format((summary.avgTicketCents ?? 0) / 100)
    };
  }, [summary]);

  const dailyChartData = useMemo(() => {
    if (!summary?.dailyTotals) return [];
    return summary.dailyTotals.map((d) => ({
      date: d.date,
      label: new Date(d.date).toLocaleDateString("es-MX", {
        month: "short",
        day: "numeric"
      }),
      total: Math.round((d.totalCents ?? 0) / 100),
      orders: d.orders ?? 0
    }));
  }, [summary]);

  const topItemsData = useMemo(() => {
    if (!summary?.topItems) return [];
    return summary.topItems.map((item) => ({
      name: item.name,
      total: Math.round((item.totalCents ?? 0) / 100),
      quantity: item.quantity ?? 0
    }));
  }, [summary]);

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-surface border border-border-subtle rounded-2xl shadow-sm"
      >
        <div className="space-y-1">
          <label className="text-sm font-semibold text-text-main">
            Desde
          </label>
          <input
            type="date"
            name="from"
            defaultValue={from ?? ""}
            className="w-full rounded-lg border border-border-subtle bg-app px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-text-main">Hasta</label>
          <input
            type="date"
            name="to"
            defaultValue={to ?? ""}
            className="w-full rounded-lg border border-border-subtle bg-app px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-brand text-brand-on font-semibold text-sm"
          >
            Actualizar
          </button>
        </div>
      </form>

      {state?.error ? (
        <div className="p-4 border border-danger/40 bg-danger/10 rounded-xl text-danger">
          {state.error}
        </div>
      ) : null}

      {summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard title="Órdenes" value={totals?.totalOrders ?? 0} />
          <SummaryCard title="Ingreso total" value={totals?.total ?? "$0.00"} />
          <SummaryCard title="Ticket promedio" value={totals?.avg ?? "$0.00"} />
        </div>
      ) : null}

      {dailyChartData.length ? (
        <div className="p-4 bg-surface border border-border-subtle rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Ingresos por día</h3>
            <span className="text-xs text-text-soft">últimos resultados</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ left: -20 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(v) => currencyFmt.format(v)}
                />
                <Tooltip
                  formatter={(val) => currencyFmt.format(val)}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return `${label} · ${item?.orders ?? 0} ordenes`;
                  }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {topItemsData.length ? (
        <div className="p-4 bg-surface border border-border-subtle rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Productos destacados</h3>
            <span className="text-xs text-text-soft">Top por ingreso</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItemsData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={12}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(v) => currencyFmt.format(v)}
                />
                <Tooltip
                  formatter={(val) => currencyFmt.format(val)}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return `${label} · ${item?.quantity ?? 0} uds`;
                  }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e5e7eb",
                    fontSize: 12
                  }}
                />
                <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {summary?.orders?.length ? (
        <div className="p-4 bg-surface border border-border-subtle rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Órdenes recientes</h3>
            <span className="text-xs text-text-soft">
              {summary.orders.length} registros
            </span>
          </div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-text-soft border-b border-border-subtle">
                  <th className="py-2 pr-3">Folio</th>
                  <th className="py-2 pr-3">Fecha</th>
                  <th className="py-2 pr-3">Estado</th>
                  <th className="py-2 pr-3">Pago</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-border-subtle/60 last:border-0 cursor-pointer ${
                      selectedOrderId === order.id ? "bg-brand/5" : ""
                    }`}
                    onClick={() =>
                      setSelectedOrderId(
                        selectedOrderId === order.id ? null : order.id
                      )
                    }
                  >
                    <td className="py-2 pr-3 font-semibold">#{order.folio}</td>
                    <td className="py-2 pr-3 text-text-muted">
                      {new Date(order.created_at).toLocaleString("es-MX", {
                        hour12: false
                      })}
                    </td>
                    <td className="py-2 pr-3 text-text-muted">{order.status}</td>
                    <td className="py-2 pr-3 text-text-muted">
                      {order.payment_status}
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">
                      {currencyFmt.format((order.total_cents ?? 0) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedOrderId ? (
            <OrderDetail
              order={summary.orders.find((o) => o.id === selectedOrderId)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="p-4 bg-surface border border-border-subtle rounded-2xl shadow-sm">
      <p className="text-xs text-text-soft uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function OrderDetail({ order }) {
  if (!order) return null;

  const items = Array.isArray(order.kiosk_order_items)
    ? order.kiosk_order_items
    : [];

  return (
    <div className="mt-4 border border-border-subtle rounded-2xl p-4 bg-app">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-soft">Detalle de orden</p>
          <h4 className="text-lg font-semibold">
            Folio #{order.folio} · {order.status}
          </h4>
        </div>
        <div className="text-sm text-text-muted">
          {currencyFmt.format((order.total_cents ?? 0) / 100)}
        </div>
      </div>
      <p className="text-xs text-text-muted mt-1">
        {new Date(order.created_at).toLocaleString("es-MX", { hour12: false })}
      </p>
      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border border-border-subtle rounded-lg px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold truncate">{item.product_name}</p>
                <p className="text-xs text-text-muted">
                  {item.quantity} x{" "}
                  {currencyFmt.format((item.unit_price_cents ?? 0) / 100)}
                </p>
              </div>
              <p className="font-semibold">
                {currencyFmt.format((item.total_price_cents ?? 0) / 100)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted mt-2">
          No se encontraron productos para esta orden.
        </p>
      )}
    </div>
  );
}
