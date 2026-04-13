import { notFound } from "next/navigation";
import Link from "next/link";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import InventoryFilterBar from "@/components/inventory/InventoryFilterBar";
import { FOOD_SUBCATEGORIES, applyInventoryFilters, getCategoryOptionsFromItems } from "@/lib/inventoryFilters";
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
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Mapa rapido de nevera</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link href="/inventory/comida/nevera" className="rounded-lg border border-sky-300 bg-white px-2.5 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50">Landing NFC nevera</Link>
                <Link href="/inventory/comida/congelador" className="rounded-lg border border-indigo-300 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-50">Landing NFC congelador</Link>
                <Link href="/inventory/comida/lacena" className="rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50">Landing NFC lacena</Link>
              </div>
              <div className="mt-2 rounded-2xl border border-cyan-200 bg-white p-3">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Nevera (arriba)</p>
                  <p className="mt-1 text-xs text-slate-600">Coloca aqui alimentos de uso diario y frescos.</p>
                </div>
                <div className="my-2 h-px bg-slate-200" />
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Congelador (abajo)</p>
                  <p className="mt-1 text-xs text-slate-600">Coloca aqui alimentos congelados y reservas.</p>
                </div>
              </div>
            </div>

            {FOOD_SUBCATEGORIES.map((zone) => {
              const zoneItems = filtered.filter((item) => item.subcategoria === zone);

              return (
                <div key={zone} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{zone}</h2>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{zoneItems.length}</span>
                  </div>
                  {zoneItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin items en esta zona.</p>
                  ) : (
                    <div className="grid gap-3">{zoneItems.map((item) => <InventoryItemCard key={item.id} item={item} />)}</div>
                  )}
                </div>
              );
            })}

            {filtered.some((item) => !item.subcategoria) ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-700">Sin zona</h2>
                <div className="grid gap-3">
                  {filtered.filter((item) => !item.subcategoria).map((item) => <InventoryItemCard key={item.id} item={item} />)}
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
