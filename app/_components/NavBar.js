'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/legacy", label: "Legacy" },
  { href: "/products", label: "Productos" },
  { href: "/products/manage", label: "Cargar catálogo" },
  { href: "/orders", label: "Órdenes" },
  { href: "/ajustes", label: "Ajustes" }
];

export default function NavBar() {
  const pathname = usePathname();

  const activeLink = links.reduce((best, link) => {
    const matches = link.href === "/"
      ? pathname === "/" || pathname === ""
      : pathname === link.href || pathname.startsWith(`${link.href}/`);

    if (!matches) return best;

    if (!best || link.href.length > best.href.length) return link;
    return best;
  }, null);

  const isActive = (href) => activeLink?.href === href;

  return (
    <nav className="flex items-center gap-3 overflow-x-auto text-sm">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 rounded-full whitespace-nowrap transition-colors ${
            isActive(link.href)
              ? "bg-brand text-brand-on border border-brand"
              : "bg-app-soft border border-transparent hover:border-border-strong"
          }`}
          aria-current={isActive(link.href) ? "page" : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
