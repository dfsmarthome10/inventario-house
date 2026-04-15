import { notFound } from "next/navigation";
import Link from "next/link";
import FoodFilterBar from "@/components/inventory/FoodFilterBar";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import { applyInventoryFilters, getStockPriority, isLowStock } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";
import { GABINETE_SUBCATEGORIES, GABINETE_ZONE_KEY_TO_SLUG, GABINETE_ZONE_SLUG_TO_KEY, getGabineteSubcategoryLabel } from "@/lib/gabinete";

export const dynamic = "force-dynamic";

const ZONE_META = {
  gavetero_principal: {
    tone: "border-violet-200 bg-violet-50",
    description: "Backlog de reparacion, coleccion, recuerdos y proyectos pausados.",
  },
  gavetero_1: {
    tone: "border-slate-200 bg-slate-50",
    description: "Drilling, driving, tornilleria y herramientas base de construccion.",
  },
  gavetero_2: {
    tone: "border-amber-200 bg-amber-50",
    description: "Acabados de concreto, precision y trabajo manual fino.",
  },
  gavetero_3: {
    tone: "border-cyan-200 bg-cyan-50",
    description: "Centro de tecnologia, energia, DIY y electronica.",
  },
  gavetero_4: {
    tone: "border-slate-200 bg-slate-50",
    description: "Espacio reservado, aun pendiente de poblar.",
  },
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

export default async function GabineteZonePage({ params, searchParams }) {
  const zoneSlug = params.zona;
  const zone = GABINETE_ZONE_SLUG_TO_KEY[zoneSlug];
  const availableOnly = (searchParams?.available_only || "") === "1";

  if (!zone) {
    notFound();
  }

  const items = await getAllItems();
  const zoneItems = items.filter((item) => item.categoria_principal === "gabinete" && item.subcategoria === zone);
  const filteredBase = applyInventoryFilters(zoneItems, {
    ...(searchParams || {}),
  });
  const filtered = availableOnly
    ? filteredBase.filter((item) => typeof item.cantidad_actual === "number" && item.cantidad_actual >= 1)
    : filteredBase;

  const lowStockCount = zoneItems.filter((item) => isLowStock(item)).length;
  const criticalCount = zoneItems.filter((item) => getStockPriority(item) === "critical").length;
  const directCount = zoneItems.filter((item) => (item.container_type || "direct_item") === "direct_item").length;
  const boxCount = zoneItems.filter((item) => ["thematic_box", "sub_box"].includes(item.container_type || "")).length;
  const systemCount = zoneItems.filter((item) => Boolean(item.sistema_logico)).length;
  const zoneMeta = ZONE_META[zone];

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Gabinete</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{getGabineteSubcategoryLabel(zone)}</h1>
            <p className="mt-1 text-sm text-slate-600">{zoneMeta.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`rounded-xl border px-3 py-2 text-xs font-semibold ${zoneMeta.tone}`}>{zoneItems.length} items</span>
            <span className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{lowStockCount} bajos</span>
            {criticalCount > 0 ? (
              <span className="rounded-xl border border-rose-700 bg-rose-600 px-3 py-2 text-xs font-semibold text-white">{criticalCount} criticos</span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/inventory/gabinete" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
            Volver al hub gabinete
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Gavetero</span>
          {GABINETE_SUBCATEGORIES.map((key) => (
            <Link
              key={key}
              href={`/inventory/gabinete/${GABINETE_ZONE_KEY_TO_SLUG[key]}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                key === zone ? "border-violet-700 bg-violet-700 text-white" : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
              }`}
            >
              {getGabineteSubcategoryLabel(key)}
            </Link>
          ))}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p className="font-semibold">Contenedores</p>
            <p className="mt-1">{boxCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p className="font-semibold">Items directos</p>
            <p className="mt-1">{directCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <p className="font-semibold">Sistemas logicos</p>
            <p className="mt-1">{systemCount}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vista</span>
          <Link
            href={`/inventory/gabinete/${zoneSlug}${buildQuery(searchParams, { available_only: null })}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              !availableOnly ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            Ver todo
          </Link>
          <Link
            href={`/inventory/gabinete/${zoneSlug}${buildQuery(searchParams, { available_only: "1" })}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              availableOnly ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Ver solo disponibles
          </Link>
        </div>
      </section>

      <FoodFilterBar searchParams={searchParams || {}} clearHref={availableOnly ? `/inventory/gabinete/${zoneSlug}?available_only=1` : `/inventory/gabinete/${zoneSlug}`} />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Showroom de {getGabineteSubcategoryLabel(zone)}</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{filtered.length}</span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">Sin items visibles para estos filtros.</p>
            <p className="mt-1 text-sm text-slate-500">Puedes limpiar filtros o cambiar de gavetero.</p>
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
