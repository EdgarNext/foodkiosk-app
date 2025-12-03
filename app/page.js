// app/page.js
import Button from "./_components/ui/Button";
import Card, { CardHeader, CardBody } from "./_components/ui/Card";
import OrderActions from "./_components/OrderActions";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col md:flex-row">
      {/* Columna izquierda: categorías y productos */}
      <section className="flex-1 p-3 md:p-4 flex flex-col gap-3 bg-app">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Haz tu pedido</h2>
          <span className="text-sm text-text-soft">
            Toca un producto para agregarlo
          </span>
        </div>

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Combos", "Hamburguesas", "Snacks", "Bebidas", "Postres"].map(
            (cat) => (
              <button
                key={cat}
                className="whitespace-nowrap px-3 py-2 rounded-full bg-brand-soft text-text-main text-sm border border-transparent hover:border-border-strong"
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Grid productos dummy */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="flex flex-col gap-2">
              <CardBody className="flex flex-col gap-2">
                <div className="aspect-video rounded-lg bg-app-soft" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Combo #{idx + 1}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Hamburguesa, papas y bebida.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold">$120.00</span>
                  <Button variant="primary" className="px-3 py-2 text-sm">
                    Agregar
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Columna derecha: resumen de pedido */}
      <aside className="w-full md:w-[340px] lg:w-[380px] border-t md:border-t-0 md:border-l border-border-subtle bg-surface-strong p-3 md:p-4 flex flex-col gap-3">
        <Card className="flex-1 flex flex-col">
          <CardHeader
            title="Tu pedido"
            subtitle="Revisa antes de enviar a cocina"
          />
          <CardBody className="flex-1 flex flex-col justify-between gap-3">
            {/* Items dummy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">Combo Clásico</p>
                  <p className="text-xs text-text-muted">1 x $120.00</p>
                </div>
                <span className="font-semibold">$120.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">Refresco grande</p>
                  <p className="text-xs text-text-muted">1 x $35.00</p>
                </div>
                <span className="font-semibold">$35.00</span>
              </div>
            </div>

            {/* Totales */}
            <div className="space-y-1 border-t border-border-subtle pt-3 text-sm">
              <div className="flex justify-between text-text-soft">
                <span>Subtotal</span>
                <span>$155.00</span>
              </div>
              <div className="flex justify-between text-text-soft">
                <span>IVA</span>
                <span>$24.80</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>$179.80</span>
              </div>
            </div>

            {/* Botones acciones */}
            <OrderActions />
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
