import Link from "next/link";
import ThumbnailImage from "@/components/common/ThumbnailImage";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const ZONES = ["nevera", "congelador", "lacena"];

const ZONE_META = {
  nevera: {
    title: "Nevera (arriba)",
    description: "Frescos y uso diario.",
    tone: "border-sky-200 bg-sky-50",
    chip: "bg-sky-100 text-sky-700",
  },
  congelador: {
    title: "Congelador (abajo)",
    description: "Reservas congeladas.",
    tone: "border-indigo-200 bg-indigo-50",
    chip: "bg-indigo-100 text-indigo-700",
  },
  lacena: {
    title: "Lacena",
    description: "Secos y basicos.",
    tone: "border-amber-200 bg-amber-50",
    chip: "bg-amber-100 text-amber-700",
  },
};

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function zoneFromSearchParams(searchParams) {
  const zone = (searchParams?.zone || "").toString().trim().toLowerCase();
  return ZONES.includes(zone) ? zone : "todas";
}

function normalizeSearch(searchParams) {
  return (searchParams?.q || "").toString().trim().toLowerCase();
}

function ItemRow({ item }) {
  return (
    <Link
      href={`/item/${encodeURIComponent(item.id)}`}
      className="grid grid-cols-[76px_1fr_auto] items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-2.5 shadow-sm transition hover:-translate-y-px hover:shadow"
    >
      <ThumbnailImage
        src={item.thumbnail_url}
        label={item.nombre}
        alt={`Thumbnail de ${item.nombre}`}
        className="h-[64px] w-[76px] object-cover"
        wrapperClassName="mb-0"
      />
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{item.nombre}</p>
        <p className="line-clamp-1 text-xs text-slate-500">{item.alias}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-900">
          {safeNumber(item.cantidad_actual)}
          {item.unidad ? ` ${item.unidad}` : ""}
        </p>
      </div>
    </Link>
  );
}

export default async function FoodAvailableNowPage({ searchParams }) {
  const selectedZone = zoneFromSearchParams(searchParams);
  const query = normalizeSearch(searchParams);

  const allItems = await getAllItems();
  const availableFood = allItems
    .filter(
      (item) =>
        item.categoria_principal === "comida" &&
        ZONES.includes((item.subcategoria || "").toLowerCase()) &&
        safeNumber(item.cantidad_actual) >= 1
    )
    .filter((item) => {
      if (!query) return true;
      const haystack = `${item.nombre || ""} ${item.alias || ""} ${item.id || ""}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => (a?.nombre || "").localeCompare(b?.nombre || "", "es"));

  const grouped = ZONES.map((zone) => {
    const items = availableFood.filter((item) => item.subcategoria === zone);
    return { zone, items, meta: ZONE_META[zone] };
  });

  const visibleGroups = selectedZone === "todas" ? grouped : grouped.filter((group) => group.zone === selectedZone);
  const totalAvailable = availableFood.length;

  return (
    <main className="space-y-4">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Nuestra Comida</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Disponibles al momento</h1>
            <p className="mt-1 text-sm text-slate-600">Solo alimentos con cantidad mayor o igual a 1, clasificados para consulta rapida.</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-cyan-700">Total disponible</p>
            <p className="text-2xl font-semibold text-cyan-900">{totalAvailable}</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/inventory/comida" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Food Hub
          </Link>
          <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Modo compra
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <form method="get" className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar disponible</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Ej: leche, arroz, queso"
              className="rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
            />
          </label>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Zona</p>
            <div className="flex flex-wrap gap-2">
              {["todas", ...ZONES].map((zone) => (
                <label key={zone} className="inline-flex items-center">
                  <input type="radio" name="zone" value={zone} defaultChecked={selectedZone === zone} className="peer sr-only" />
                  <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition peer-checked:border-cyan-700 peer-checked:bg-cyan-700 peer-checked:text-white">
                    {zone}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
              Aplicar
            </button>
            <Link href="/inventory/comida/disponibles" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      {totalAvailable === 0 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            No hay alimentos disponibles con los filtros actuales.
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          {visibleGroups.map((group) => (
            <article key={group.zone} className={`rounded-[2rem] border p-4 shadow-sm ${group.meta.tone}`}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">{group.meta.title}</h2>
                  <p className="text-sm text-slate-600">{group.meta.description}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${group.meta.chip}`}>
                  {group.items.length} disponibles
                </span>
              </div>

              {group.items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-3 text-sm text-slate-500">No hay disponibles en esta zona.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <ItemRow key={item.id} item={item} />
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
