import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import InventoryFilterBar from "@/components/inventory/InventoryFilterBar";
import Link from "next/link";
import { applyInventoryFilters, buildInventorySummary, getCategoryOptionsFromItems } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

export default async function InventoryPage({ searchParams }) {
  const items = await getAllItems();
  const filtered = applyInventoryFilters(items, searchParams || {});
  const options = getCategoryOptionsFromItems(items);
  const summary = buildInventorySummary(items);

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventario</h1>
        <p className="mt-1 text-sm text-slate-600">Explora todos los items con busqueda y filtros por categoria, zona y nivel de stock.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-rose-600">Critico</p>
            <p className="mt-1 text-lg font-semibold text-rose-700">{summary.stockPriority.critical}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-rose-600">Alto</p>
            <p className="mt-1 text-lg font-semibold text-rose-700">{summary.stockPriority.high}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-amber-700">Medio</p>
            <p className="mt-1 text-lg font-semibold text-amber-800">{summary.stockPriority.medium}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-600">Atajos</p>
            <div className="mt-1 flex flex-wrap gap-1">
              <Link href="/inventory?low_stock=1" className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                Bajo stock
              </Link>
              <Link href="/shopping/comida?low_stock=1" className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                Reponer comida
              </Link>
              <Link href="/shopping/casa?low_stock=1" className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                Reponer casa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <InventoryFilterBar
        searchParams={searchParams || {}}
        mainCategoryOptions={options.mainCategories}
        foodSubcategoryOptions={options.foodSubcategories}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Resultados</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{filtered.length} items</span>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No se encontraron items con esos filtros.</p>
        ) : (
          <div className="grid gap-3">{filtered.map((item) => <InventoryItemCard key={item.id} item={item} />)}</div>
        )}
      </section>
    </main>
  );
}
