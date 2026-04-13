"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/inventory", label: "Inventario" },
  { href: "/inventory/comida/disponibles", label: "Nuestra Comida" },
  { href: "/shopping/comida", label: "Compras" },
  { href: "/admin", label: "Admin" },
  { href: "/shopping/recommend", label: "Recomendar" },
];

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileTopMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Abrir menu"
        className="ios-top-menu-trigger"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path strokeLinecap="round" d="M5 7h14" />
          <path strokeLinecap="round" d="M5 12h14" />
          <path strokeLinecap="round" d="M5 17h14" />
        </svg>
      </button>

      {open ? (
        <div className="ios-top-menu-panel">
          {LINKS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`ios-top-menu-link ${active ? "ios-top-menu-link-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
