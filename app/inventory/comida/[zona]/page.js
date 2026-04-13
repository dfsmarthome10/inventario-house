import Link from "next/link";
import { notFound } from "next/navigation";
import InventoryFilterBar from "@/components/inventory/InventoryFilterBar";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import { FOOD_SUBCATEGORIES, applyInventoryFilters, getCategoryOptionsFromItems } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const ZONE_LABELS = {
  lacena: "Lacena",
  nevera: "Nevera",
  congelador: "Congelador",
};

export default async function FoodZonePage({ params, searchParams }) {
  const zone = params.zona;

  if (!FOOD_SUBCATEGORIES.includes(zone)) {
    notFound();
  }

  const items = await getAllItems();
  const options = getCategoryOptionsFromItems(items);
  const filtered = applyInventoryFilters(items, {
    ...(searchParams || {}),
    categoria_principal: "comida",
    subcategoria: zone,
  });

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{ZONE_LABELS[zone]}</h1>
            <p className="mt-1 text-sm text-slate-600">Landing NFC para zona de comida. Muestra solo items de esta zona.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOOD_SUBCATEGORIES.map((zoneKey) => (
              <Link
                key={zoneKey}
                href={`/inventory/comida/${zoneKey}`}
                className={`rounded-xl px-3 py-2 text-sm font-medium ${zoneKey === zone ? "bg-ink text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {ZONE_LABELS[zoneKey]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InventoryFilterBar
        searchParams={searchParams || {}}
        fixedMainCategory="comida"
        fixedSubcategory={zone}
        mainCategoryOptions={options.mainCategories}
        foodSubcategoryOptions={options.foodSubcategories}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Items en {ZONE_LABELS[zone]}</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No hay items en esta zona con los filtros actuales.</p>
        ) : (
          <div className="grid gap-3">{filtered.map((item) => <InventoryItemCard key={item.id} item={item} />)}</div>
        )}
      </section>
    </main>
  );
}

