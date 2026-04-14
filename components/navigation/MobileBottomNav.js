"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function TabIcon({ type, active = false }) {
  const className = active ? "text-slate-900" : "text-slate-500";

  if (type === "shopping") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h15l-1.2 9.5a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 9" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (type === "food") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="6" y="3.5" width="12" height="17" rx="2.5" />
        <path d="M6 11.5h12" />
        <path d="M10 7.5h4" />
        <path d="M10 15.5h4" />
      </svg>
    );
  }

  if (type === "back") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
      </svg>
    );
  }

  if (type === "inventory") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M8 9h8" />
        <path d="M8 13h8" />
      </svg>
    );
  }

  if (type === "admin") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l2.5 2.7 3.6-.6.6 3.6L21.5 12l-2.8 3.3-.6 3.6-3.6-.6L12 21l-2.5-2.7-3.6.6-.6-3.6L2.5 12l2.8-3.3.6-3.6 3.6.6L12 3z" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    );
  }

  return type === "home" ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-current" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10.5L12 4l8.5 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 9.8V20h11V9.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20v-4.8h4V20" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5l8-6 8 6" />
      <path d="M6 9.8V20h12V9.8" />
    </svg>
  );
}

export default function MobileBottomNav() {
  const pathname = usePathname();
  const shoppingActive = isActive(pathname, "/shopping");
  const inventoryActive = isActive(pathname, "/inventory");
  const homeActive = isActive(pathname, "/");
  const adminActive = isActive(pathname, "/admin");
  const foodActive = isActive(pathname, "/inventory/comida/disponibles");

  return (
    <div className="ios-bottom-nav md:hidden">
      <div className="ios-bottom-shell">
        <Link href="/shopping" className={`ios-bottom-tab ${shoppingActive ? "ios-bottom-tab-active" : ""}`}>
          <TabIcon type="shopping" active={shoppingActive} />
          <span>Compra</span>
        </Link>

        <Link href="/inventory" className={`ios-bottom-tab ${inventoryActive ? "ios-bottom-tab-active" : ""}`}>
          <TabIcon type="inventory" active={inventoryActive} />
          <span>Inventario</span>
        </Link>

        <Link href="/" className={`ios-home-pill ${homeActive ? "ios-home-pill-active" : ""}`} aria-label="Inicio">
          <TabIcon type="home" active />
        </Link>

        <Link href="/inventory/comida/disponibles" className={`ios-bottom-tab ${foodActive ? "ios-bottom-tab-active" : ""}`}>
          <TabIcon type="food" active={foodActive} />
          <span>Nuestra</span>
        </Link>

        <Link href="/admin" className={`ios-bottom-tab ${adminActive ? "ios-bottom-tab-active" : ""}`}>
          <TabIcon type="admin" active={adminActive} />
          <span>Admin</span>
        </Link>
      </div>
    </div>
  );
}
