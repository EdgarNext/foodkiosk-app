export default function AppHeader() {
  return (
    <header className="app-navbar print-hidden bg-app-soft border-b border-border-subtle px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-soft border border-border-subtle flex items-center justify-center text-base font-bold text-text-main">
          Logo
        </div>
        <h1 className="text-xl font-semibold tracking-tight">CC La Cafeteria</h1>
      </div>
    </header>
  );
}
