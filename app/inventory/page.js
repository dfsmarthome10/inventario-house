import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import InventoryFilterBar from "@/components/inventory/InventoryFilterBar";
import Link from "next/link";
import { applyInventoryFilters, buildInventorySummary, getCategoryOptionsFromItems } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const PRIMARY_CATEGORIES = ["comida", "casa", "gabinete", "herramientas"];

const CATEGORY_HUB_META = {
  comida: {
    title: "Comida",
    href: "/inventory/comida",
    description: "Nevera, congelador y lacena.",
    tone: "border-emerald-200 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
  },
  casa: {
    title: "Casa",
    href: "/inventory/casa",
    description: "Aseo, mantenimiento y consumibles del hogar.",
    tone: "border-cyan-200 bg-cyan-50",
    badge: "bg-cyan-100 text-cyan-700",
  },
  gabinete: {
    title: "Gabinete",
    href: "/inventory/gabinete",
    description: "Gaveteros, zonas y contenedores del taller.",
    tone: "border-violet-200 bg-violet-50",
    badge: "bg-violet-100 text-violet-700",
  },
  herramientas: {
    title: "Herramientas",
    href: "/inventory/herramientas",
    description: "Categoria logica de herramientas, sin depender del gavetero.",
    tone: "border-sky-200 bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
  },
};

export default async function InventoryPage({ searchParams }) {
  const items = await getAllItems();
  const filtered = applyInventoryFilters(items, searchParams || {});
  const options = getCategoryOptionsFromItems(items);
  const summary = buildInventorySummary(items);
  const orderedMainCategoryOptions = [
    ...PRIMARY_CATEGORIES.filter((category) => options.mainCategories.includes(category)),
    ...options.mainCategories.filter((category) => !PRIMARY_CATEGORIES.includes(category)),
  ];

  const legacyCategories = ["cajas", "otros"]
    .map((key) => ({ key, count: summary.byMainCategory[key] || 0 }))
    .filter((entry) => entry.count > 0);

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inventario</h1>
        <p className="mt-1 text-sm text-slate-600">Explora por categoria principal o usa filtros para buscar rapido lo que necesitas.</p>
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        {PRIMARY_CATEGORIES.map((key) => {
          const meta = CATEGORY_HUB_META[key];
          return (
            <Link key={key} href={meta.href} className={`rounded-3xl border p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md ${meta.tone}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{meta.title}</p>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
                  {summary.byMainCategory[key] || 0}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">{meta.description}</p>
            </Link>
          );
        })}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
              <Link href="/shopping/history" className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                Historial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {legacyCategories.length > 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Categorias heredadas</h2>
          <p className="mt-1 text-xs text-slate-500">Disponibles para consulta desde filtros, sin protagonismo como hubs principales.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {legacyCategories.map((category) => (
              <Link
                key={category.key}
                href={`/inventory?categoria_principal=${encodeURIComponent(category.key)}`}
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
              >
                {category.key} ({category.count})
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <InventoryFilterBar
        searchParams={searchParams || {}}
        mainCategoryOptions={orderedMainCategoryOptions}
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
