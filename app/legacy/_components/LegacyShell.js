'use client';

import { useMemo, useState } from "react";
import LegacyCategoryButton from "./LegacyCategoryButton";
import LegacyProductCard from "./LegacyProductCard";

export default function LegacyShell({ categories, products }) {
  const [activeCategoryId, setActiveCategoryId] = useState(
    categories[0]?.id ?? null
  );
  const [lastAction, setLastAction] = useState("");
  const [cart, setCart] = useState([]);

  const filtered = useMemo(() => {
    if (!activeCategoryId) return products;
    return products.filter((p) => p.categoryId === activeCategoryId);
  }, [products, activeCategoryId]);

  const total = useMemo(
    () =>
      cart.reduce(
        (acc, item) => acc + (item.price ?? 0) * (item.quantity ?? 1),
        0
      ),
    [cart]
  );

  const handleAdd = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity ?? 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setLastAction(`Agregado: ${product.name}`);
  };

  const handleRemove = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClear = () => {
    setCart([]);
    setLastAction("");
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-start gap-4 lg:gap-6 w-full px-3 md:px-4">
      {/* Categorías (izquierda) */}
      <aside className="xl:w-64 w-full xl:w-[240px] space-y-3 order-2 xl:order-1 sticky top-[96px] lg:top-[108px] max-h-[calc(100vh-120px)]">
        <div className="p-4 rounded-2xl border border-border-subtle bg-surface shadow-sm h-full overflow-auto">
          <p className="text-xs text-text-soft mb-3">Categorías</p>
          <div className="space-y-2">
            {categories.map((category) => (
              <LegacyCategoryButton
                key={category.id}
                category={category}
                active={category.id === activeCategoryId}
                onSelect={setActiveCategoryId}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Productos (centro) */}
      <section className="flex-1 min-w-0 flex flex-col gap-3 order-1 xl:order-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {filtered.length} productos
          </p>
          {lastAction ? (
            <span className="text-xs px-2 py-1 rounded-full bg-success-soft text-success border border-success/40">
              {lastAction}
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
          {filtered.map((product) => (
            <LegacyProductCard
              key={product.id}
              product={product}
              onAdd={() => handleAdd(product)}
            />
          ))}
        </div>
      </section>

      {/* Orden (derecha) */}
      <aside className="xl:w-72 w-full xl:w-[280px] order-3 sticky top-[96px] lg:top-[108px] max-h-[calc(100vh-120px)]">
        <div className="p-4 rounded-2xl border border-border-subtle bg-surface shadow-sm space-y-3 h-full overflow-auto">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Orden</p>
            <button
              className="text-xs text-text-muted hover:text-text-main"
              onClick={handleClear}
              disabled={cart.length === 0}
            >
              Limpiar
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-text-muted">Aún no hay productos.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 border-b border-border-subtle pb-2"
                >
                  <div className="min-w-0">
                    <p className="font-medium leading-tight truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {item.quantity} x{" "}
                      {Number(item.price ?? 0).toLocaleString("es-MX", {
                        style: "currency",
                        currency: "MXN"
                      })}
                    </p>
                  </div>
                  <button
                    className="text-xs text-destructive hover:underline"
                    onClick={() => handleRemove(item.id)}
                  >
                    Quitar
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between pt-1 text-sm font-semibold">
                <span>Total</span>
                <span>
                  {total.toLocaleString("es-MX", {
                    style: "currency",
                    currency: "MXN"
                  })}
                </span>
              </div>

              <button className="w-full py-2 rounded-lg bg-brand text-brand-on font-semibold text-sm">
                Enviar orden
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
