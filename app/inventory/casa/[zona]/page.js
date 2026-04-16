import { notFound } from "next/navigation";
import Link from "next/link";
import FoodFilterBar from "@/components/inventory/FoodFilterBar";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import { applyInventoryFilters, getStockPriority, isLowStock } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";
import { getHouseSubcategoryLabel, HOUSE_ZONE_KEY_TO_SLUG, HOUSE_ZONE_SLUG_TO_KEY } from "@/lib/house";
import { groupHouseItemsByLane } from "@/lib/houseShoppingLanes";

export const dynamic = "force-dynamic";

const TONE_META = {
  aseo_casa: "border-cyan-200 bg-cyan-50",
  aseo_personal: "border-emerald-200 bg-emerald-50",
  mejoras_casa: "border-indigo-200 bg-indigo-50",
};

const DESC_META = {
  aseo_casa: "Productos de limpieza para piso, bano, cocina y superficies.",
  aseo_personal: "Higiene diaria y cuidado personal para el hogar.",
  mejoras_casa: "Repuestos y consumibles utiles para mantenimiento domestico.",
};

function buildQuery(searchParams, extras = {}) {
  const p = new URLSearchParams();
  if (searchParams?.search) p.set("search", searchParams.search);
  if (searchParams?.low_stock === "1") p.set("low_stock", "1");
  if (searchParams?.available_only === "1") p.set("available_only", "1");
  Object.entries(extras).forEach(([key, value]) => {
    if (value === null || value === "") {
      p.delete(key);
    } else {
      p.set(key, value);
    }
  });
  const q = p.toString();
  return q ? `?${q}` : "";
}

export default async function CasaZonePage({ params, searchParams }) {
  const zoneSlug = params.zona;
  const zone = HOUSE_ZONE_SLUG_TO_KEY[zoneSlug];
  const availableOnly = (searchParams?.available_only || "") === "1";

  if (!zone) {
    notFound();
  }

  const items = await getAllItems();
  const zoneItems = items.filter((item) => item.categoria_principal === "casa" && item.subcategoria === zone);
  const filteredBase = applyInventoryFilters(zoneItems, {
    ...(searchParams || {}),
  });
  const filtered = availableOnly
    ? filteredBase.filter((item) => typeof item.cantidad_actual === "number" && item.cantidad_actual >= 1)
    : filteredBase;
  const groupedByLane = groupHouseItemsByLane(filtered);
  const lowStockCount = zoneItems.filter((item) => isLowStock(item)).length;
  const criticalCount = zoneItems.filter((item) => getStockPriority(item) === "critical").length;
  const mediumCount = zoneItems.filter((item) => getStockPriority(item) === "medium").length;

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zona casa</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{getHouseSubcategoryLabel(zone)}</h1>
            <p className="mt-1 text-sm text-slate-600">{DESC_META[zone]}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-xl border px-3 py-2 text-xs font-semibold ${TONE_META[zone]}`}>{zoneItems.length} items</span>
            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{lowStockCount} bajos</span>
            {criticalCount > 0 ? (
              <span className="rounded-xl border border-rose-700 bg-rose-600 px-3 py-2 text-xs font-semibold text-white">{criticalCount} criticos</span>
            ) : null}
            {mediumCount > 0 ? (
              <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{mediumCount} medios</span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/inventory/casa" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Volver al hub casa</Link>
          <Link href={`/shopping/casa?subcategoria=${encodeURIComponent(zone)}&low_stock=1`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Reponer bajo stock</Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Subcategoria</span>
          {Object.entries(HOUSE_ZONE_KEY_TO_SLUG).map(([key, slug]) => (
            <Link
              key={key}
              href={`/inventory/casa/${slug}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                key === zone ? "border-slate-900 bg-slate-900 text-white" : "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
              }`}
            >
              {getHouseSubcategoryLabel(key)}
            </Link>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vista</span>
          <Link
            href={`/inventory/casa/${zoneSlug}${buildQuery(searchParams, { available_only: null })}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !availableOnly ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Ver todo
          </Link>
          <Link
            href={`/inventory/casa/${zoneSlug}${buildQuery(searchParams, { available_only: "1" })}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              availableOnly ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Ver solo disponibles
          </Link>
        </div>
      </section>

      <FoodFilterBar searchParams={searchParams || {}} clearHref={availableOnly ? `/inventory/casa/${zoneSlug}?available_only=1` : `/inventory/casa/${zoneSlug}`} />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Showroom de {getHouseSubcategoryLabel(zone)}</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">No hay items para estos filtros.</p>
            <p className="mt-1 text-sm text-slate-500">Limpia filtros o cambia de subcategoria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedByLane.map((laneGroup) => (
              <section key={laneGroup.laneKey} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">{laneGroup.laneLabel}</h3>
                    <p className="text-xs text-slate-500">{laneGroup.laneDescription}</p>
                  </div>
                  <span className="rounded-full border border-white bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                    {laneGroup.items.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {laneGroup.items.map((item) => (
                    <InventoryItemCard key={item.id} item={item} variant="showroom" />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
