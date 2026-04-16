"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
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

  if (type === "inventory") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
        <path d="M8 9h8" />
        <path d="M8 13h8" />
      </svg>
    );
  }

  if (type === "cart") {
    return (
      <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="19" r="1.4" />
        <circle cx="17" cy="19" r="1.4" />
        <path d="M3.5 5h2l1.3 9.2a1.6 1.6 0 0 0 1.6 1.4h8.8a1.6 1.6 0 0 0 1.6-1.3L20 8.5H7.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-current" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 10.5L12 4l8.5 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 9.8V20h11V9.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20v-4.8h4V20" />
    </svg>
  );
}

function CartSelectorSheet({ open, onClose, counts }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-[60] transition ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition ${open ? "opacity-100" : "opacity-0"}`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Selector de carrito"
        className={`absolute bottom-0 left-0 right-0 rounded-t-[2rem] border border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 md:left-1/2 md:right-auto md:w-[min(92vw,44rem)] md:-translate-x-1/2 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Carrito</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Carrito del hogar</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Cerrar
          </button>
        </div>

        <div className="space-y-2">
          <Link
            href="/shopping/comida/cart"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">Carrito · Hogar</p>
              <p className="text-xs text-slate-600">Compra combinada de comida y casa</p>
            </div>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700">{counts.total} lineas</span>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">Comida: {counts.comida}</span>
            <span className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">Casa: {counts.casa}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function MobileBottomNav({ cartBadgeCounts }) {
  const pathname = usePathname();
  const [cartSheetOpen, setCartSheetOpen] = useState(false);

  const shoppingActive = isActive(pathname, "/shopping");
  const inventoryActive = isActive(pathname, "/inventory");
  const homeActive = isActive(pathname, "/");
  const foodActive = isActive(pathname, "/inventory/comida/disponibles");
  const cartActive = isActive(pathname, "/shopping/comida/cart") || isActive(pathname, "/shopping/casa/cart");

  const counts = {
    comida: Number(cartBadgeCounts?.comida_lines || 0),
    casa: Number(cartBadgeCounts?.casa_lines || 0),
    total: Number(cartBadgeCounts?.household_lines || cartBadgeCounts?.total_lines || 0),
  };

  return (
    <>
      <div className="ios-bottom-nav app-bottom-nav">
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

          <button type="button" onClick={() => setCartSheetOpen(true)} className={`ios-bottom-tab ${cartActive ? "ios-bottom-tab-active" : ""}`}>
            <div className="relative">
              <TabIcon type="cart" active={cartActive} />
              {counts.total > 0 ? (
                <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-rose-600 px-1 text-center text-[10px] font-bold leading-4 text-white">
                  {counts.total > 99 ? "99+" : counts.total}
                </span>
              ) : null}
            </div>
            <span>Carrito</span>
          </button>
        </div>
      </div>

      <CartSelectorSheet open={cartSheetOpen} onClose={() => setCartSheetOpen(false)} counts={counts} />
    </>
  );
}

