import { getKioskData } from "./_lib/getKioskData";
import KioskFlow from "./_components/KioskFlow";

export const metadata = {
  title: "Kiosko",
  description: "Selecciona productos y visualiza tu orden"
};

export const revalidate = 0;

export default async function KioskPage() {
  const { categories, products } = await getKioskData();

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-text-soft uppercase tracking-wide">
          Kiosko
        </p>
        <h1 className="text-2xl font-semibold">Selección de productos</h1>
        <p className="text-sm text-text-muted">
          Arma tu pedido y genera tu ticket para pagar en caja.
        </p>
      </div>

      <KioskFlow categories={categories} products={products} />
    </div>
  );
}
