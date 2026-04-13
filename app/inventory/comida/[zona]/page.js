import { notFound } from "next/navigation";
import FoodFilterBar from "@/components/inventory/FoodFilterBar";
import FoodZonePills from "@/components/inventory/FoodZonePills";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import Link from "next/link";
import { FOOD_SUBCATEGORIES, applyInventoryFilters, getStockPriority, isLowStock } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const ZONE_META = {
  lacena: {
    label: "Lacena",
    tone: "border-amber-200 bg-amber-50",
    description: "Zona seca para granos, conservas y basicos de cocina.",
  },
  nevera: {
    label: "Nevera",
    tone: "border-sky-200 bg-sky-50",
    description: "Parte superior para frescos de uso diario.",
  },
  congelador: {
    label: "Congelador",
    tone: "border-indigo-200 bg-indigo-50",
    description: "Parte inferior para reservas congeladas.",
  },
};

export default async function FoodZonePage({ params, searchParams }) {
  const zone = params.zona;
  const availableOnly = (searchParams?.available_only || "") === "1";

  if (!FOOD_SUBCATEGORIES.includes(zone)) {
    notFound();
  }

  const items = await getAllItems();
  const zoneItems = items.filter((item) => item.categoria_principal === "comida" && item.subcategoria === zone);
  const filteredBase = applyInventoryFilters(zoneItems, {
    ...(searchParams || {}),
  });
  const filtered = availableOnly
    ? filteredBase.filter((item) => typeof item.cantidad_actual === "number" && item.cantidad_actual >= 1)
    : filteredBase;
  const lowStockCount = zoneItems.filter((item) => isLowStock(item)).length;
  const criticalCount = zoneItems.filter((item) => getStockPriority(item) === "critical").length;
  const mediumCount = zoneItems.filter((item) => getStockPriority(item) === "medium").length;
  const zoneMeta = ZONE_META[zone];

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zona de comida</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{zoneMeta.label}</h1>
            <p className="mt-1 text-sm text-slate-600">{zoneMeta.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-xl border px-3 py-2 text-xs font-semibold ${zoneMeta.tone}`}>{zoneItems.length} items</span>
            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {lowStockCount} bajos
            </span>
            {criticalCount > 0 ? (
              <span className="rounded-xl border border-rose-700 bg-rose-600 px-3 py-2 text-xs font-semibold text-white">
                {criticalCount} criticos
              </span>
            ) : null}
            {mediumCount > 0 ? (
              <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                {mediumCount} medios
              </span>
            ) : null}
          </div>
        </div>
        <div className="mt-4">
          <FoodZonePills activeZone={zone} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vista</span>
          <Link
            href={`/inventory/comida/${zone}${(() => {
              const p = new URLSearchParams();
              if (searchParams?.search) p.set("search", searchParams.search);
              if (searchParams?.low_stock === "1") p.set("low_stock", "1");
              const q = p.toString();
              return q ? `?${q}` : "";
            })()}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !availableOnly ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Ver todo
          </Link>
          <Link
            href={`/inventory/comida/${zone}${(() => {
              const p = new URLSearchParams();
              if (searchParams?.search) p.set("search", searchParams.search);
              if (searchParams?.low_stock === "1") p.set("low_stock", "1");
              p.set("available_only", "1");
              const q = p.toString();
              return q ? `?${q}` : "";
            })()}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              availableOnly ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Ver solo disponibles
          </Link>
        </div>
        <div className="mt-3">
          <Link href={`/shopping/comida?subcategoria=${encodeURIComponent(zone)}&low_stock=1`} className="inline-flex rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            Ver solo bajos y reponer
          </Link>
        </div>
      </section>

      <FoodFilterBar
        searchParams={searchParams || {}}
        clearHref={availableOnly ? `/inventory/comida/${zone}?available_only=1` : `/inventory/comida/${zone}`}
      />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Showroom de {zoneMeta.label}</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">No hay items para estos filtros.</p>
            <p className="mt-1 text-sm text-slate-500">Limpia el filtro o cambia de zona desde las pestañas superiores.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => (
              <InventoryItemCard key={item.id} item={item} variant="showroom" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
