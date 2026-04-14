import Link from "next/link";
import ShoppingCartPanel from "@/components/shopping/ShoppingCartPanel";
import ThumbnailImage from "@/components/common/ThumbnailImage";
import { getOrCreateOpenHouseSession, getHouseCatalog, getSessionCart } from "@/lib/shoppingRepository";
import { getHouseSubcategoryLabel, HOUSE_SUBCATEGORIES } from "@/lib/house";
import { addToCasaCartAction, confirmCasaPurchaseAction, removeCasaCartLineAction, updateCasaCartLineAction } from "./actions";

export const dynamic = "force-dynamic";

function formatQuantity(item) {
  if (typeof item.cantidad_actual !== "number") {
    return "N/A";
  }

  return `${item.cantidad_actual}${item.unidad ? ` ${item.unidad}` : ""}`;
}

function buildClearHref(searchParams = {}) {
  const zone = typeof searchParams.subcategoria === "string" ? searchParams.subcategoria : "";
  if (zone && HOUSE_SUBCATEGORIES.includes(zone)) {
    return `/shopping/casa?subcategoria=${encodeURIComponent(zone)}`;
  }
  return "/shopping/casa";
}

export default async function ShoppingCasaPage({ searchParams }) {
  let session = null;
  let catalog = [];
  let cart = { lines: [] };
  let setupError = "";

  try {
    session = await getOrCreateOpenHouseSession();
    catalog = await getHouseCatalog(searchParams || {});
    cart = await getSessionCart(session.id);
  } catch (error) {
    setupError = error instanceof Error ? error.message : "Shopping mode is not ready.";
  }

  if (setupError) {
    return (
      <main className="space-y-5">
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Modo compra casa</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Configuracion pendiente</h1>
          <p className="mt-2 text-sm text-slate-700">Necesitas aplicar la migracion de compras antes de usar esta vista.</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">{setupError}</pre>
          <div className="mt-4">
            <Link href="/inventory/casa" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver al hub casa
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Modo compra</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Compras de casa</h1>
            <p className="mt-1 text-sm text-slate-600">Gestiona reposicion de aseo y mejoras del hogar con confirmacion final.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/inventory/casa" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver al hub casa
            </Link>
            <Link href="/shopping/history?scope=casa" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Historial casa
            </Link>
            <span className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">Sesion {session.id}</span>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <form method="get" className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar item</span>
            <input
              name="search"
              defaultValue={searchParams?.search || ""}
              placeholder="Nombre, alias o ID"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subcategoria</span>
            <select name="subcategoria" defaultValue={searchParams?.subcategoria || ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Todas</option>
              {HOUSE_SUBCATEGORIES.map((sub) => (
                <option key={sub} value={sub}>{getHouseSubcategoryLabel(sub)}</option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <input type="checkbox" name="low_stock" value="1" defaultChecked={searchParams?.low_stock === "1"} className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm text-slate-700">Solo stock bajo</span>
          </label>

          <div className="flex gap-2 sm:col-span-4">
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
              Aplicar filtros
            </button>
            <a href={buildClearHref(searchParams || {})} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Limpiar
            </a>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Catalogo de casa</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{catalog.length} items</span>
          </div>

          {catalog.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <p className="text-sm font-medium text-slate-700">No hay items para esos filtros.</p>
              <p className="mt-1 text-sm text-slate-500">Ajusta la busqueda o subcategoria.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {catalog.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex gap-3">
                    <div className="w-28 shrink-0">
                      <ThumbnailImage
                        src={item.thumbnail_url}
                        label={item.nombre}
                        alt={`Thumbnail de ${item.nombre}`}
                        className="h-24 w-full object-cover"
                        wrapperClassName="mb-0"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.nombre}</p>
                          <p className="text-xs text-slate-500">{item.alias}</p>
                        </div>
                        <span className="rounded-lg border border-white bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                          Stock: {formatQuantity(item)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                          {getHouseSubcategoryLabel(item.subcategoria) || item.subcategoria || "sin subcategoria"}
                        </span>
                      </div>

                      <form action={addToCasaCartAction} className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                        <input type="hidden" name="inventoryItemId" value={item.id} />
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cantidad a comprar</span>
                          <input type="number" name="quantity_to_buy" min="1" defaultValue="1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Precio actual</span>
                          <input type="number" name="purchase_price" min="0" step="0.01" defaultValue="0" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900" />
                        </label>
                        <button type="submit" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                          Agregar
                        </button>
                        <label className="sm:col-span-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                          <input type="checkbox" name="tax_applies" value="1" className="h-4 w-4 rounded border-slate-300" />
                          <span className="text-xs text-slate-700">Aplica impuesto 11.5%</span>
                        </label>
                      </form>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <ShoppingCartPanel
          lines={cart.lines}
          updateLineAction={updateCasaCartLineAction}
          removeLineAction={removeCasaCartLineAction}
          confirmPurchaseAction={confirmCasaPurchaseAction}
        />
      </section>
    </main>
  );
}