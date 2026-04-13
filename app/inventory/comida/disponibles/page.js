import Link from "next/link";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const ZONES = ["nevera", "congelador", "lacena"];

const ZONE_META = {
  nevera: {
    title: "Nevera (arriba)",
    description: "Lo fresco y de uso diario.",
    tone: "border-sky-200 bg-sky-50",
  },
  congelador: {
    title: "Congelador (abajo)",
    description: "Reservas congeladas de mediano y largo plazo.",
    tone: "border-indigo-200 bg-indigo-50",
  },
  lacena: {
    title: "Lacena",
    description: "Secos, conservas y basicos de cocina.",
    tone: "border-amber-200 bg-amber-50",
  },
};

function sortByName(a, b) {
  return (a?.nombre || "").localeCompare(b?.nombre || "", "es");
}

export default async function FoodAvailableNowPage() {
  const allItems = await getAllItems();
  const availableFood = allItems
    .filter(
      (item) =>
        item.categoria_principal === "comida" &&
        ZONES.includes((item.subcategoria || "").toLowerCase()) &&
        typeof item.cantidad_actual === "number" &&
        item.cantidad_actual >= 1
    )
    .sort(sortByName);

  const grouped = ZONES.map((zone) => ({
    zone,
    meta: ZONE_META[zone],
    items: availableFood.filter((item) => item.subcategoria === zone),
  }));

  const totalAvailable = availableFood.length;

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Nuestra Comida</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Alimentos disponibles ahora</h1>
            <p className="mt-1 text-sm text-slate-600">Solo se muestran alimentos con stock disponible para ver rapido lo que tienes en casa.</p>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-cyan-700">Disponibles</p>
            <p className="text-2xl font-semibold text-cyan-900">{totalAvailable}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/inventory/comida" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Ir a Food Hub
          </Link>
          <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Entrar a modo compra
          </Link>
        </div>
      </section>

      {totalAvailable === 0 ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            No hay alimentos con cantidad disponible (&gt;= 1). Cuando actualices cantidades, apareceran aqui clasificados por zona.
          </div>
        </section>
      ) : null}

      {grouped.map((group) => {
        if (group.items.length === 0) {
          return null;
        }

        return (
          <section key={group.zone} className={`rounded-[2rem] border p-5 shadow-sm ${group.meta.tone}`}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{group.meta.title}</h2>
                <p className="text-sm text-slate-600">{group.meta.description}</p>
              </div>
              <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                {group.items.length} disponibles
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((item) => (
                <InventoryItemCard key={item.id} item={item} variant="showroom" />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
