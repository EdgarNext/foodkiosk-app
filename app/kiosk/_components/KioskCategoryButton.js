'use client';

export default function KioskCategoryButton({ category, active, onSelect }) {
  return (
    <button
      type="button"
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
        active
          ? "border-brand bg-brand/15 text-brand font-semibold shadow-[0_0_0_2px_rgba(0,0,0,0.04)]"
          : "border-border-subtle hover:border-border-strong text-text-main"
      }`}
      onClick={() => onSelect(category.id)}
    >
      <div className="w-10 h-10 shrink-0 rounded-lg bg-surface border border-border-subtle overflow-hidden flex items-center justify-center">
        <img
          src={category.icon}
          alt={category.name}
          className="w-8 h-8 object-contain"
        />
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold leading-tight truncate">
          {category.name}
        </p>
      </div>
    </button>
  );
}
