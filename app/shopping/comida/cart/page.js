import Link from "next/link";
import ShoppingCartPanel from "@/components/shopping/ShoppingCartPanel";
import { getOrCreateOpenFoodSession, getSessionCart } from "@/lib/shoppingRepository";
import { confirmPurchaseAction, removeCartLineAction, updateCartLineAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ShoppingComidaCartPage() {
  let session = null;
  let cart = { lines: [] };
  let setupError = "";

  try {
    session = await getOrCreateOpenFoodSession();
    cart = await getSessionCart(session.id);
  } catch (error) {
    setupError = error instanceof Error ? error.message : "Shopping mode is not ready.";
  }

  if (setupError) {
    return (
      <main className="space-y-5">
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Carrito comida</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Configuracion pendiente</h1>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">{setupError}</pre>
          <div className="mt-4">
            <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver a compras comida
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Carrito dedicado</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Carrito · Comida</h1>
            <p className="mt-1 text-sm text-slate-600">Revisa lineas, ajusta impuesto/precio/cantidad y confirma compra sin scroll excesivo.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">Scope: comida</span>
            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">Sesion {session.id}</span>
            <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Seguir comprando
            </Link>
            <Link href="/shopping/casa/cart" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Ir a carrito casa
            </Link>
          </div>
        </div>
      </section>

      <ShoppingCartPanel
        lines={cart.lines}
        updateLineAction={updateCartLineAction}
        removeLineAction={removeCartLineAction}
        confirmPurchaseAction={confirmPurchaseAction}
        heading="Carrito de comida"
        subtitle="Inventario solo cambia cuando presionas Comprado."
        scopeBadge="Comida"
        continueShoppingHref="/shopping/comida"
        switchScopeHref="/shopping/casa/cart"
        switchScopeLabel="Cambiar a carrito casa"
        stickyTotals
      />
    </main>
  );
}
