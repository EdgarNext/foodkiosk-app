'use client';

export default function KioskProductCard({ product, onAdd }) {
  return (
    <div className="border border-border-subtle rounded-xl bg-surface shadow-sm overflow-hidden flex flex-col">
      <div className="h-40 w-full bg-muted flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain p-2"
        />
      </div>
      <div className="p-3 space-y-2 flex-1 flex flex-col">
        <p className="text-sm font-semibold leading-tight">{product.name}</p>
        <p className="text-sm text-text-muted">
          {Number(product.price ?? 0).toLocaleString("es-MX", {
            style: "currency",
            currency: "MXN"
          })}
        </p>
        <div className="flex-1" />
        <button
          type="button"
          className="w-full py-2 rounded-lg bg-brand text-brand-on font-semibold text-sm"
          onClick={onAdd}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
