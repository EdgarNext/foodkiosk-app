'use client';

import Image from "next/image";

export default function LegacyCategoryButton({
  category,
  active,
  onSelect
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
        active
          ? "border-brand bg-brand-soft text-brand-on"
          : "border-border-subtle bg-surface hover:border-border-strong"
      }`}
    >
      <Image
        src={category.icon}
        alt={category.name}
        width={32}
        height={32}
        className="w-8 h-8 object-contain"
        loading="lazy"
      />
      <span className="text-sm font-semibold">{category.name}</span>
    </button>
  );
}
