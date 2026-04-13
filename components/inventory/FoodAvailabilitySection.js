import Link from "next/link";

function hasAvailableStock(item) {
  return typeof item?.cantidad_actual === "number" && item.cantidad_actual >= 1;
}

function sortByName(items) {
  return [...items].sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es"));
}

function zoneStats(allItems, availableItems) {
  const total = allItems.length;
  const available = availableItems.length;
  return {
    total,
    available,
    unavailable: Math.max(0, total - available),
  };
}

function AvailabilityChip({ item }) {
  return (
    <Link
      href={`/item/${encodeURIComponent(item.id)}`}
      className="flex items-center justify-between gap-2 rounded-xl border border-white/70 bg-white px-3 py-2 text-xs shadow-sm transition hover:-translate-y-px hover:shadow"
    >
      <span className="line-clamp-1 font-medium text-slate-700">{item.nombre}</span>
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
        {item.cantidad_actual}
        {item.unidad ? ` ${item.unidad}` : ""}
      </span>
    </Link>
  );
}

function ZoneHeader({ title, stats, tone }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${tone}`}>{title}</p>
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">{stats.available} disponibles</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">{stats.unavailable} sin stock</span>
      </div>
    </div>
  );
}

export default function FoodAvailabilitySection({ items }) {
  const foodItems = items.filter((item) => item.categoria_principal === "comida");

  const neveraAll = foodItems.filter((item) => item.subcategoria === "nevera");
  const congeladorAll = foodItems.filter((item) => item.subcategoria === "congelador");
  const lacenaAll = foodItems.filter((item) => item.subcategoria === "lacena");

  const neveraAvailable = sortByName(neveraAll.filter(hasAvailableStock));
  const congeladorAvailable = sortByName(congeladorAll.filter(hasAvailableStock));
  const lacenaAvailable = sortByName(lacenaAll.filter(hasAvailableStock));

  const totalAvailable = neveraAvailable.length + congeladorAvailable.length + lacenaAvailable.length;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Alimentos disponibles al momento</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Vista rapida por zonas reales</h2>
          <p className="mt-1 text-sm text-slate-600">Solo se muestran items con cantidad disponible (&gt;= 1) para diferenciar de inmediato lo que tienes hoy.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <p>
            Disponibles ahora: <span className="font-semibold text-slate-900">{totalAvailable}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-sky-200 bg-sky-50 p-3">
          <div className="rounded-2xl border border-sky-300/80 bg-white/70 p-3">
            <ZoneHeader title="Nevera (arriba)" stats={zoneStats(neveraAll, neveraAvailable)} tone="text-sky-700" />
            {neveraAvailable.length === 0 ? (
              <p className="rounded-xl border border-dashed border-sky-200 bg-white px-3 py-3 text-xs text-slate-500">No hay alimentos disponibles en nevera.</p>
            ) : (
              <div className="grid max-h-56 gap-2 overflow-auto pr-1 sm:grid-cols-2">
                {neveraAvailable.map((item) => <AvailabilityChip key={item.id} item={item} />)}
              </div>
            )}
          </div>

          <div className="my-3 h-px bg-sky-200" />

          <div className="rounded-2xl border border-indigo-300/80 bg-indigo-50/70 p-3">
            <ZoneHeader title="Congelador (abajo)" stats={zoneStats(congeladorAll, congeladorAvailable)} tone="text-indigo-700" />
            {congeladorAvailable.length === 0 ? (
              <p className="rounded-xl border border-dashed border-indigo-200 bg-white px-3 py-3 text-xs text-slate-500">No hay alimentos disponibles en congelador.</p>
            ) : (
              <div className="grid max-h-56 gap-2 overflow-auto pr-1 sm:grid-cols-2">
                {congeladorAvailable.map((item) => <AvailabilityChip key={item.id} item={item} />)}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-3">
          <div className="rounded-2xl border border-amber-300/80 bg-white/70 p-3">
            <ZoneHeader title="Lacena" stats={zoneStats(lacenaAll, lacenaAvailable)} tone="text-amber-700" />
            {lacenaAvailable.length === 0 ? (
              <p className="rounded-xl border border-dashed border-amber-200 bg-white px-3 py-3 text-xs text-slate-500">No hay alimentos disponibles en lacena.</p>
            ) : (
              <div className="grid max-h-[30rem] gap-2 overflow-auto pr-1 sm:grid-cols-2">
                {lacenaAvailable.map((item) => <AvailabilityChip key={item.id} item={item} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
