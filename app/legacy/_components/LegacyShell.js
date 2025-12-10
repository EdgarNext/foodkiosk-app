'use client';

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import LegacyCategoryButton from "./LegacyCategoryButton";
import LegacyProductCard from "./LegacyProductCard";
import { useLegacyOrderStore } from "../_lib/useLegacyOrderStore";

export default function LegacyShell({ categories, products }) {
  const router = useRouter();
  const setCatalog = useLegacyOrderStore((state) => state.setCatalog);
  const activeCategoryId = useLegacyOrderStore(
    (state) => state.activeCategoryId
  );
  const setActiveCategoryId = useLegacyOrderStore(
    (state) => state.setActiveCategoryId
  );
  const categoriesFromStore = useLegacyOrderStore((state) => state.categories);
  const productsFromStore = useLegacyOrderStore((state) => state.products);
  const cart = useLegacyOrderStore((state) => state.cart);
  const addToCart = useLegacyOrderStore((state) => state.addToCart);
  const removeFromCart = useLegacyOrderStore((state) => state.removeFromCart);
  const clearCart = useLegacyOrderStore((state) => state.clearCart);
  const total = useLegacyOrderStore((state) => state.total);
  const lastAction = useLegacyOrderStore((state) => state.lastAction);
  const setLastAction = useLegacyOrderStore((state) => state.setLastAction);

  const filtered = useMemo(() => {
    const source = productsFromStore?.length ? productsFromStore : products;
    if (!activeCategoryId) return source ?? [];
    return (source ?? []).filter((p) => p.categoryId === activeCategoryId);
  }, [products, productsFromStore, activeCategoryId]);

  useEffect(() => {
    setCatalog({ categories, products });
  }, [categories, products, setCatalog]);

  const handleAdd = (product) => {
    addToCart(product);
    setLastAction(`Agregado: ${product.name}`);
  };

  const handleRemove = (productId) => {
    removeFromCart(productId);
  };

  const handleClear = () => {
    clearCart();
    setLastAction("");
  };

  const handleOpenConfirm = () => {
    if (cart.length === 0) {
      setLastAction("Agrega productos a la orden para continuar");
      return;
    }
    router.push("/legacy/confirm", { scroll: false });
  };

  return (
    <div className="flex flex-col xl:flex-row xl:items-start gap-4 lg:gap-6 w-full px-3 md:px-4">
      {/* Categorías (izquierda) */}
      <aside className="xl:w-64 w-full xl:w-[240px] space-y-3 order-2 xl:order-1 sticky top-[96px] lg:top-[108px] max-h-[calc(100vh-120px)]">
        <div className="p-4 rounded-2xl border border-border-subtle bg-surface shadow-sm h-full overflow-auto">
          <p className="text-xs text-text-soft mb-3">Categorías</p>
          <div className="space-y-2">
            {categoriesFromStore.map((category) => (
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

              <button
                className="w-full py-2 rounded-lg bg-brand text-brand-on font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleOpenConfirm}
                disabled={cart.length === 0}
                type="button"
              >
                Enviar orden
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
