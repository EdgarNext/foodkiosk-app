import PrinterSetupClient from "./_components/PrinterSetupClient";
import PrinterTestClient from "./_components/PrinterTestClient";

export const metadata = {
  title: "Configurar impresora",
  description: "Ajusta la impresora térmica del kiosko"
};

export const revalidate = 0;

export default function PrinterSetupPage() {
  const initialConfig = null; // TODO: cargar configuración almacenada si aplica

  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-text-soft uppercase tracking-wide">
          Administración
        </p>
        <h1 className="text-2xl font-semibold">Configurar impresora</h1>
        <p className="text-sm text-text-muted">
          Define el destino de impresión y prueba la salida del tiket.
        </p>
      </div>

      <PrinterSetupClient initialConfig={initialConfig} />
      <PrinterTestClient />
    </div>
  );
}
