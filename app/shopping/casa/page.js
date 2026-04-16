import Link from "next/link";
import ShoppingCartSummaryCard from "@/components/shopping/ShoppingCartSummaryCard";
import QuickCartDrawer from "@/components/shopping/QuickCartDrawer";
import ThumbnailImage from "@/components/common/ThumbnailImage";
import { getOrCreateOpenHouseSession, getHouseCatalog, getSessionCart } from "@/lib/shoppingRepository";
import { getHouseSubcategoryLabel, HOUSE_SUBCATEGORIES } from "@/lib/house";
import { groupHouseItemsByLane, getHouseShoppingLaneKey, getHouseShoppingLaneLabel, HOUSE_LANE_META } from "@/lib/houseShoppingLanes";
import { addToCasaCartAction, confirmCasaPurchaseAction, createHouseItemFromShoppingAction, removeCasaCartLineAction, updateCasaCartLineAction } from "./actions";

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

function getSelectedLane(searchParams = {}) {
  const lane = typeof searchParams.lane === "string" ? searchParams.lane : "";
  return Object.prototype.hasOwnProperty.call(HOUSE_LANE_META, lane) ? lane : "";
}

function ShoppingStatusBanner({ searchParams }) {
  const status = typeof searchParams?.status === "string" ? searchParams.status : "";
  const id = typeof searchParams?.id === "string" ? searchParams.id : "";
  const duplicateId = typeof searchParams?.duplicate_id === "string" ? searchParams.duplicate_id : "";

  if (!status) {
    return null;
  }

  if (status === "created" && id) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Item {id} creado correctamente.
      </div>
    );
  }

  if (status === "created_and_added" && id) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Item {id} creado y agregado al carrito.
      </div>
    );
  }

  if (status === "duplicate") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Ya existe un item con nombre similar en esta subcategoria.
        {duplicateId ? (
          <>
            {" "}
            <Link href={`/item/${encodeURIComponent(duplicateId)}`} className="font-semibold underline underline-offset-2">
              Ver {duplicateId}
            </Link>
          </>
        ) : null}
      </div>
    );
  }

  return null;
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

  const selectedLane = getSelectedLane(searchParams || {});
  const catalogLaneFiltered = selectedLane
    ? catalog.filter((item) => getHouseShoppingLaneKey(item) === selectedLane)
    : catalog;
  const groupedCatalog = groupHouseItemsByLane(catalogLaneFiltered);

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
            <Link href="/shopping/casa/cart" className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              Ver carrito
            </Link>
            <QuickCartDrawer
              scopeLabel="Casa"
              scopeTone="bg-cyan-100 text-cyan-700"
              lines={cart.lines}
              updateLineAction={updateCasaCartLineAction}
              removeLineAction={removeCasaCartLineAction}
              confirmPurchaseAction={confirmCasaPurchaseAction}
              fullCartHref="/shopping/casa/cart"
              continueHref="/shopping/casa"
            />
            <span className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700">Sesion {session.id}</span>
          </div>
        </div>
      </section>

      <ShoppingStatusBanner searchParams={searchParams || {}} />

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

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pasillo</span>
            <select name="lane" defaultValue={selectedLane} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Todos</option>
              {Object.entries(HOUSE_LANE_META).map(([laneKey, meta]) => (
                <option key={laneKey} value={laneKey}>
                  {meta.label}
                </option>
              ))}
            </select>
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

      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900">Nuevo item de casa</h2>
            <p className="text-xs text-slate-500">Crea rapido un item cuando no exista y opcionalmente agrégalo al carrito.</p>
          </div>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            Creacion rapida
          </span>
        </div>
        <form action={createHouseItemFromShoppingAction} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_0.9fr_auto] lg:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Nombre *</span>
            <input
              type="text"
              name="nombre"
              required
              defaultValue={typeof searchParams?.search === "string" ? searchParams.search : ""}
              placeholder="Ej: Gel antibacterial"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Subcategoria *</span>
            <select
              name="subcategoria"
              required
              defaultValue={typeof searchParams?.subcategoria === "string" ? searchParams.subcategoria : "aseo_casa"}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              {HOUSE_SUBCATEGORIES.map((sub) => (
                <option key={sub} value={sub}>
                  {getHouseSubcategoryLabel(sub)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cant. para carrito</span>
            <input type="number" min="1" name="quantity_to_buy" defaultValue="1" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Precio actual</span>
            <input type="number" min="0" step="0.01" name="purchase_price" defaultValue="0" className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
            Crear item
          </button>
          <label className="sm:col-span-2 lg:col-span-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <input type="checkbox" name="add_to_cart" value="1" defaultChecked className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm text-slate-700">Agregar automaticamente al carrito despues de crear</span>
          </label>
          <label className="sm:col-span-2 lg:col-span-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <input type="checkbox" name="tax_applies" value="1" className="h-4 w-4 rounded border-slate-300" />
            <span className="text-sm text-slate-700">Aplica impuesto 11.5% para esta linea inicial</span>
          </label>
          <label className="sm:col-span-2 lg:col-span-5 flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Thumbnail URL (opcional)</span>
            <input type="url" name="thumbnail_url" placeholder="https://..." className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" />
          </label>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Catalogo de casa</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{catalogLaneFiltered.length} items</span>
        </div>

          {catalogLaneFiltered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
              <p className="text-sm font-medium text-slate-700">No hay items para esos filtros.</p>
              <p className="mt-1 text-sm text-slate-500">Ajusta busqueda, subcategoria o pasillo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedCatalog.map((laneGroup) => (
                <section key={laneGroup.laneKey} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{laneGroup.laneLabel}</h3>
                      <p className="text-xs text-slate-500">{laneGroup.laneDescription}</p>
                    </div>
                    <span className="rounded-full border border-white bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {laneGroup.items.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {laneGroup.items.map((item) => (
                      <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3">
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
                              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
                                Stock: {formatQuantity(item)}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                                {getHouseSubcategoryLabel(item.subcategoria) || item.subcategoria || "sin subcategoria"}
                              </span>
                              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-medium text-cyan-700">
                                {getHouseShoppingLaneLabel(getHouseShoppingLaneKey(item))}
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
                </section>
              ))}
            </div>
          )}
        </div>

        <ShoppingCartSummaryCard
          scopeLabel="Casa"
          scopeTone="bg-cyan-100 text-cyan-700"
          cart={cart}
          cartHref="/shopping/casa/cart"
          continueHref="/shopping/casa"
        />
      </section>
    </main>
  );
}
