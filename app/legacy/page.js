import LegacyShell from "./_components/LegacyShell";
import { getLegacyData } from "./_lib/getLegacyData";

export const metadata = {
  title: "Legacy React Quiosco",
  description: "Vista integrada de la app React legacy"
};

export const revalidate = 0;

export default async function LegacyPage() {
  const { categories, products } = await getLegacyData();

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-text-soft uppercase tracking-wide">
          Legacy
        </p>
        <h1 className="text-2xl font-semibold">React Quiosco</h1>
        <p className="text-sm text-text-muted">
          Vista embebida usando los datos y assets de la app React original.
        </p>
      </div>

      <LegacyShell categories={categories} products={products} />
    </div>
  );
}
