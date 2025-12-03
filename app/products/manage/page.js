import CatalogManager from "./CatalogManager";

export const metadata = {
  title: "Cargar catálogo | Kiosko de alimentos",
  description: "Administra categorías y productos en Supabase",
};

export const revalidate = 0;

export default function ManageCatalogPage() {
  return (
    <div className="flex-1 p-4">
      <CatalogManager />
    </div>
  );
}
