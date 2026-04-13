import { notFound } from "next/navigation";
import Link from "next/link";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import InventoryFilterBar from "@/components/inventory/InventoryFilterBar";
import FoodFilterBar from "@/components/inventory/FoodFilterBar";
import FoodZonePills from "@/components/inventory/FoodZonePills";
import { FOOD_SUBCATEGORIES, applyInventoryFilters, getCategoryOptionsFromItems, getStockPriority, isLowStock } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const TITLES = {
  cajas: "Hub de cajas",
  herramientas: "Hub de herramientas",
  comida: "Hub de comida",
  otros: "Hub de otros",
};

export default async function InventoryCategoryPage({ params, searchParams }) {
  const categoria = params.categoria;
  const items = await getAllItems();
  const options = getCategoryOptionsFromItems(items);

  if (!options.mainCategories.includes(categoria)) {
    notFound();
  }

  const filters = {
    ...(searchParams || {}),
    categoria_principal: categoria,
  };
  const filtered = applyInventoryFilters(items, filters);
  const foodFiltered = filtered.filter((item) => item.categoria_principal === "comida");
  const foodAll = items.filter((item) => item.categoria_principal === "comida");

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{TITLES[categoria]}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {categoria === "comida"
            ? "Gestiona lacena, nevera y congelador con filtros rapidos."
            : "Vista enfocada por categoria principal."}
        </p>
      </section>

      <InventoryFilterBar
        searchParams={searchParams || {}}
        fixedMainCategory={categoria}
        mainCategoryOptions={options.mainCategories}
        foodSubcategoryOptions={options.foodSubcategories}
      />

      {categoria === "comida" ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Food hub</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Navegacion rapida por zonas</h2>
                  <p className="mt-1 text-sm text-slate-600">Entradas directas para escaneo NFC y exploracion manual.</p>
                </div>
                <div className="grid min-w-[150px] grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-slate-900">{foodAll.length}</p>
                    <p className="text-slate-500">Total comida</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-rose-700">{foodAll.filter((item) => isLowStock(item)).length}</p>
                    <p className="text-slate-500">Stock bajo</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/shopping/comida" className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Entrar a modo compra
                </Link>
              </div>
              <div className="mt-4">
                <FoodZonePills />
              </div>
              <div className="mt-3 rounded-2xl border border-cyan-200 bg-white p-3">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Nevera (arriba)</p>
                  <p className="mt-1 text-xs text-slate-600">Lacteos, embutidos y productos de uso frecuente.</p>
                </div>
                <div className="my-2 h-px bg-slate-200" />
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Congelador (abajo)</p>
                  <p className="mt-1 text-xs text-slate-600">Reservas congeladas y alimentos de largo plazo.</p>
                </div>
              </div>
            </div>

            <FoodFilterBar searchParams={searchParams || {}} clearHref="/inventory/comida" />

            {FOOD_SUBCATEGORIES.map((zone) => {
              const zoneItems = foodFiltered.filter((item) => item.subcategoria === zone);
              const preview = zoneItems.slice(0, 4);
              const lowStock = zoneItems.filter((item) => isLowStock(item)).length;
              const critical = zoneItems.filter((item) => getStockPriority(item) === "critical").length;

              return (
                <div key={zone} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{zone}</h2>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{zoneItems.length}</span>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">{lowStock} bajos</span>
                      {critical > 0 ? <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-medium text-white">{critical} criticos</span> : null}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/inventory/comida/${zone}${searchParams?.search ? `?search=${encodeURIComponent(searchParams.search)}` : ""}${searchParams?.low_stock === "1" ? `${searchParams?.search ? "&" : "?"}low_stock=1` : ""}`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Abrir zona
                      </Link>
                      <Link
                        href={`/shopping/comida?subcategoria=${encodeURIComponent(zone)}&low_stock=1`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Reponer
                      </Link>
                    </div>
                  </div>
                  {zoneItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin items en esta zona.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {preview.map((item) => <InventoryItemCard key={item.id} item={item} variant="showroom" />)}
                    </div>
                  )}
                </div>
              );
            })}

            {foodFiltered.some((item) => !item.subcategoria) ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Sin zona</h2>
                <div className="grid gap-3">
                  {foodFiltered.filter((item) => !item.subcategoria).map((item) => <InventoryItemCard key={item.id} item={item} />)}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No hay items para esta categoria con los filtros actuales.</p>
          ) : (
            <div className="grid gap-3">{filtered.map((item) => <InventoryItemCard key={item.id} item={item} />)}</div>
          )}
        </section>
      )}
    </main>
  );
}
