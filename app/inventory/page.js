import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import InventoryFilterBar from "@/components/inventory/InventoryFilterBar";
import { applyInventoryFilters, getCategoryOptionsFromItems } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

export default async function InventoryPage({ searchParams }) {
  const items = await getAllItems();
  const filtered = applyInventoryFilters(items, searchParams || {});
  const options = getCategoryOptionsFromItems(items);

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventario</h1>
        <p className="mt-1 text-sm text-slate-600">Explora todos los items con busqueda y filtros por categoria, zona y nivel de stock.</p>
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
