// app/_components/ui/Card.js
export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-surface border border-border-subtle rounded-xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle }) {
  return (
    <div className="px-4 pt-4 pb-2">
      {title && (
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      )}
      {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
    </div>
  );
}

export function CardBody({ children, className = "" }) {
  return <div className={`px-4 pb-4 ${className}`}>{children}</div>;
}
