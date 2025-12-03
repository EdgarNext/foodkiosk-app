import ProductCard from "./_components/ProductCard";
import { getProducts } from "./_lib/getProducts";

export const metadata = {
  title: "Productos | Kiosko de alimentos",
  description: "Catálogo de productos alimenticios"
};

export const revalidate = 0;

export default async function ProductsPage() {
  const { data, error, fromSupabase } = await getProducts();
  const products = Array.isArray(data) ? data : [];

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-text-soft">Catálogo</p>
            <h1 className="text-2xl font-semibold">Productos</h1>
          </div>
          <span className="text-sm text-text-muted">
            {products.length} items
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-full border border-border-subtle text-text-muted">
            Fuente: {fromSupabase ? "Supabase" : "Demo local"}
          </span>
        </div>
        {error ? (
          <div className="rounded-lg border border-border-subtle bg-app-soft px-3 py-2 text-sm text-text-muted">
            No se pudo leer desde Supabase ({error}). Mostrando datos de
            ejemplo.
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
