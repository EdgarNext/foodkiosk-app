'use client';

import Image from "next/image";
import Button from "../../_components/ui/Button";

export default function LegacyProductCard({ product, onAdd }) {
  const price = Number(product.price ?? 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN"
  });

  return (
    <div className="rounded-xl border border-border-subtle bg-surface overflow-hidden flex flex-col shadow-sm">
      <div className="relative aspect-[4/3] bg-app-soft max-h-48">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1536px) 240px, (min-width: 1280px) 240px, (min-width: 1024px) 220px, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-2"
          priority={false}
        />
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-sm font-semibold leading-tight min-h-[40px]">
          {product.name}
        </p>
        <p className="text-base font-semibold text-brand">{price}</p>
        <Button
          variant="secondary"
          className="w-full py-2 text-sm"
          onClick={onAdd}
        >
          Agregar
        </Button>
      </div>
    </div>
  );
}
