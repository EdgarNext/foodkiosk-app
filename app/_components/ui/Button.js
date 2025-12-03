// app/_components/ui/Button.js
"use client";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-4 py-3 text-base active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-brand text-brand-on shadow-md hover:bg-brand-strong",
  secondary:
    "bg-surface text-text-main border border-border-subtle hover:border-border-strong",
  ghost:
    "bg-transparent text-text-main hover:bg-app-soft border border-transparent",
  destructive: "bg-danger text-brand-on shadow-md hover:brightness-95",
  success: "bg-success text-brand-on shadow-md hover:brightness-95",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variantClasses = variants[variant] ?? variants.primary;

  return (
    <button className={`${base} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
