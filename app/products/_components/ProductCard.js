import Card, { CardBody } from "../../_components/ui/Card";
import Button from "../../_components/ui/Button";

export default function ProductCard({ product }) {
  const price = ((Number(product.price_cents ?? 0) || 0) / 100).toFixed(2);
  const categoryLabel =
    product?.category?.name ||
    product?.categories?.name ||
    product?.category ||
    product?.category_name;

  return (
    <Card className="flex flex-col h-full">
      <CardBody className="flex flex-col gap-3">
        <div className="aspect-video rounded-lg bg-app-soft overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">
              Sin imagen
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{product.name}</p>
          {product.description && (
            <p className="text-xs text-text-muted mt-1">
              {product.description}
            </p>
          )}
          {categoryLabel && (
            <p className="text-[11px] uppercase tracking-wide text-text-soft mt-2">
              {categoryLabel}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">${price}</span>
          <Button variant="secondary" className="px-3 py-2 text-sm">
            Agregar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
