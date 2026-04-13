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

  if (type === "quick") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v4" />
        <path d="M12 17v4" />
        <path d="M3 12h4" />
        <path d="M17 12h4" />
        <path d="M6.5 6.5l2.8 2.8" />
        <path d="M14.7 14.7l2.8 2.8" />
        <path d="M17.5 6.5l-2.8 2.8" />
        <path d="M9.3 14.7l-2.8 2.8" />
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
  const quickActive = isActive(pathname, "/admin/nfc");
  const inventoryActive = isActive(pathname, "/inventory");
  const homeActive = isActive(pathname, "/");
  const adminActive = isActive(pathname, "/admin");

  return (
    <div className="ios-bottom-nav md:hidden">
      <div className="ios-bottom-shell">
        <Link href="/admin/nfc" className={`ios-bottom-tab ${quickActive ? "ios-bottom-tab-active" : ""}`}>
          <TabIcon type="quick" active={quickActive} />
          <span>Quick</span>
        </Link>

        <Link href="/inventory" className={`ios-bottom-tab ${inventoryActive ? "ios-bottom-tab-active" : ""}`}>
          <TabIcon type="inventory" active={inventoryActive} />
          <span>Inventario</span>
        </Link>

        <Link href="/" className={`ios-home-pill ${homeActive ? "ios-home-pill-active" : ""}`} aria-label="Inicio">
          <TabIcon type="home" active />
        </Link>

        <Link href="/admin" className={`ios-bottom-tab ${adminActive ? "ios-bottom-tab-active" : ""}`}>
          <TabIcon type="admin" active={adminActive} />
          <span>Admin</span>
        </Link>

        <Link href="/admin/items/new" className={`ios-bottom-tab ${isActive(pathname, "/admin/items/new") ? "ios-bottom-tab-active" : ""}`}>
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          <span>Nuevo</span>
        </Link>
      </div>
    </div>
  );
}
