import Link from "next/link";
import { buildInventorySummary } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const PRIMARY_CATEGORY_CARDS = [
  {
    key: "comida",
    title: "Comida",
    description: "Nevera, congelador y lacena con compra guiada.",
    href: "/inventory/comida",
    tone: "border-emerald-200 bg-emerald-50",
    badgeTone: "bg-emerald-100 text-emerald-700",
  },
  {
    key: "casa",
    title: "Casa",
    description: "Aseo, mantenimiento y consumibles del hogar.",
    href: "/inventory/casa",
    tone: "border-cyan-200 bg-cyan-50",
    badgeTone: "bg-cyan-100 text-cyan-700",
  },
  {
    key: "herramientas",
    title: "Herramientas",
    description: "Herramientas logicas con ubicacion fisica preservada.",
    href: "/inventory/herramientas",
    tone: "border-sky-200 bg-sky-50",
    badgeTone: "bg-sky-100 text-sky-700",
  },
  {
    key: "gabinete",
    title: "Gabinete",
    description: "Gaveteros, contenedores y sistemas del taller.",
    href: "/inventory/gabinete",
    tone: "border-violet-200 bg-violet-50",
    badgeTone: "bg-violet-100 text-violet-700",
  },
];

export default async function HomePage() {
  const items = await getAllItems();
  const summary = buildInventorySummary(items);

  const comidaDisponible = items.filter(
    (item) =>
      item.categoria_principal === "comida" &&
      typeof item.cantidad_actual === "number" &&
      item.cantidad_actual >= 1
  ).length;

  const legacyCategories = ["cajas", "otros"]
    .map((key) => ({ key, count: summary.byMainCategory[key] || 0 }))
    .filter((entry) => entry.count > 0);

  const topLowStock = summary.lowStock.slice(0, 4);

  return (
    <main className="space-y-4">
      <section className="ios-widget-strong">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Inicio</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Dashboard del hogar</h1>
        <p className="mt-1 text-sm text-slate-600">
          Vista clara para entrar rapido a comida, casa, gabinete y herramientas sin sobrecargar la pantalla.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/shopping" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Ir a compras
          </Link>
          <Link href="/shopping/history" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Historial
          </Link>
          <Link href="/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Admin
          </Link>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-4">
        {PRIMARY_CATEGORY_CARDS.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className={`rounded-3xl border p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md ${card.tone}`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold tracking-wide text-slate-900">{card.title}</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${card.badgeTone}`}>
                {summary.byMainCategory[card.key] || 0}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600">{card.description}</p>
            {card.key === "comida" ? (
              <p className="mt-2 text-[11px] text-slate-500">
                lacena {summary.foodByZone.lacena} | nevera {summary.foodByZone.nevera} | congelador {summary.foodByZone.congelador}
              </p>
            ) : null}
            {card.key === "casa" ? (
              <p className="mt-2 text-[11px] text-slate-500">
                aseo casa {summary.houseByZone.aseo_casa} | aseo personal {summary.houseByZone.aseo_personal} | mejoras {summary.houseByZone.mejoras_casa}
              </p>
            ) : null}
            {card.key === "gabinete" ? (
              <p className="mt-2 text-[11px] text-slate-500">
                principal {summary.gabineteByZone.gavetero_principal} | g1 {summary.gabineteByZone.gavetero_1} | g2 {summary.gabineteByZone.gavetero_2} | g3 {summary.gabineteByZone.gavetero_3}
              </p>
            ) : null}
          </Link>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Total items</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-rose-600">Stock bajo</p>
          <p className="mt-1 text-2xl font-semibold text-rose-700">{summary.lowStock.length}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-emerald-600">Nuestra Comida</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-800">{comidaDisponible}</p>
        </div>
        <Link
          href="/inventory?low_stock=1"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-3 transition hover:bg-amber-100"
        >
          <p className="text-[11px] uppercase tracking-wide text-amber-700">Prioridad</p>
          <p className="mt-1 text-sm font-semibold text-amber-900">Ver alertas de stock</p>
          <p className="mt-1 text-xs text-amber-800">critico {summary.stockPriority.critical} | alto {summary.stockPriority.high}</p>
        </Link>
      </section>

      <section className="ios-widget">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Atencion hoy</h2>
          <Link href="/inventory?low_stock=1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
            Ver todo
          </Link>
        </div>
        {topLowStock.length === 0 ? (
          <p className="text-sm text-slate-500">Sin alertas activas.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {topLowStock.map((item) => (
              <Link key={item.id} href={`/item/${encodeURIComponent(item.id)}`} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                <p className="font-medium">{item.nombre}</p>
                <p className="mt-0.5">
                  {item.cantidad_actual}/{item.cantidad_minima}
                  {item.unidad ? ` ${item.unidad}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {legacyCategories.length > 0 ? (
        <section className="ios-widget">
          <h3 className="text-sm font-semibold text-slate-900">Categorias heredadas</h3>
          <p className="mt-1 text-xs text-slate-500">
            Cajas y otros quedan disponibles para consulta, pero ya no son hubs principales.
          </p>
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
    </main>
  );
}
