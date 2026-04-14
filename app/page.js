import Link from "next/link";
import { buildInventorySummary } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

const CATEGORY_META = {
  cajas: { title: "Cajas", href: "/inventory/cajas", tone: "bg-amber-100 text-amber-700" },
  herramientas: { title: "Herramientas", href: "/inventory/herramientas", tone: "bg-slate-200 text-slate-700" },
  comida: { title: "Comida", href: "/inventory/comida", tone: "bg-emerald-100 text-emerald-700" },
  casa: { title: "Casa", href: "/inventory/casa", tone: "bg-cyan-100 text-cyan-700" },
  otros: { title: "Otros", href: "/inventory?categoria_principal=otros", tone: "bg-indigo-100 text-indigo-700" },
};

export default async function HomePage() {
  const items = await getAllItems();
  const summary = buildInventorySummary(items);
  const comidaDisponible = items.filter(
    (item) =>
      item.categoria_principal === "comida" &&
      typeof item.cantidad_actual === "number" &&
      item.cantidad_actual >= 1
  ).length;
  const customCategories = Object.keys(summary.byMainCategory).filter((key) => !Object.prototype.hasOwnProperty.call(CATEGORY_META, key));
  const topLowStock = summary.lowStock.slice(0, 3);

  return (
    <main className="space-y-4">
      <section className="ios-widget-strong">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Inicio</h1>
        <p className="mt-1 text-sm text-slate-600">Panel estilo widget para navegar rapido el inventario del hogar.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-2xl bg-slate-100 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-rose-500">Bajo/Critico</p>
            <p className="mt-1 text-2xl font-semibold text-rose-700">{summary.lowStock.length}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-emerald-600">Nuestra Comida</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-800">{comidaDisponible}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-amber-600">Cajas</p>
            <p className="mt-1 text-2xl font-semibold text-amber-800">{summary.byMainCategory.cajas || 0}</p>
          </div>
          <div className="col-span-2 rounded-2xl bg-sky-50 p-3 sm:col-span-1">
            <p className="text-[11px] uppercase tracking-wide text-sky-600">Herramientas</p>
            <p className="mt-1 text-2xl font-semibold text-sky-800">{summary.byMainCategory.herramientas || 0}</p>
          </div>
          <div className="col-span-2 rounded-2xl bg-cyan-50 p-3 sm:col-span-1 lg:col-span-1">
            <p className="text-[11px] uppercase tracking-wide text-cyan-600">Casa</p>
            <p className="mt-1 text-2xl font-semibold text-cyan-800">{summary.byMainCategory.casa || 0}</p>
          </div>
        </div>
      </section>

      <section className="ios-widget-strong">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Prioridad de stock</h2>
          <Link href="/inventory?low_stock=1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
            Ver bajo stock
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-rose-600">Critico</p>
            <p className="mt-1 text-xl font-semibold text-rose-700">{summary.stockPriority.critical}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-rose-600">Alto</p>
            <p className="mt-1 text-xl font-semibold text-rose-700">{summary.stockPriority.high}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-amber-700">Medio</p>
            <p className="mt-1 text-xl font-semibold text-amber-800">{summary.stockPriority.medium}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-emerald-700">Normal</p>
            <p className="mt-1 text-xl font-semibold text-emerald-800">{summary.stockPriority.normal}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/inventory" className="ios-widget transition duration-200 hover:-translate-y-px hover:shadow">
          <p className="text-sm font-semibold text-slate-900">Explorar inventario</p>
          <p className="mt-1 text-xs text-slate-500">Busqueda, filtros y hubs por categoria.</p>
        </Link>
        <Link href="/admin" className="ios-widget transition duration-200 hover:-translate-y-px hover:shadow">
          <p className="text-sm font-semibold text-slate-900">Panel admin</p>
          <p className="mt-1 text-xs text-slate-500">Crear, editar y ajustar cantidades.</p>
        </Link>
      </section>

      <section className="ios-widget-strong">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Categorias</h2>
          <Link href="/inventory" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
            Ver todo
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <Link
              key={key}
              href={meta.href}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition duration-200 hover:-translate-y-px hover:border-slate-300 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{meta.title}</p>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${meta.tone}`}>{summary.byMainCategory[key] || 0}</span>
              </div>
              {key === "comida" ? (
                <p className="mt-1 text-[11px] text-slate-500">
                  lacena {summary.foodByZone.lacena} | nevera {summary.foodByZone.nevera} | congelador {summary.foodByZone.congelador}
                </p>
              ) : key === "casa" ? (
                <p className="mt-1 text-[11px] text-slate-500">
                  aseo casa {summary.houseByZone.aseo_casa} | aseo personal {summary.houseByZone.aseo_personal} | mejoras {summary.houseByZone.mejoras_casa}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-slate-500">Abrir hub</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="ios-widget-strong lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Comida (vista rapida)</h2>
            <Link href="/inventory/comida" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
              Abrir hub
            </Link>
          </div>
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700">Nevera y congelador</p>
            <div className="mt-2 rounded-2xl border border-cyan-200 bg-white p-3">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                <p className="text-xs font-semibold text-sky-700">Nevera (arriba)</p>
                <p className="mt-1 text-[11px] text-slate-600">{summary.foodByZone.nevera} items</p>
                <Link href="/inventory/comida/nevera" className="mt-2 inline-block text-[11px] font-semibold text-sky-700 underline underline-offset-2">Abrir nevera</Link>
              </div>
              <div className="my-2 h-px bg-slate-200" />
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <p className="text-xs font-semibold text-indigo-700">Congelador (abajo)</p>
                <p className="mt-1 text-[11px] text-slate-600">{summary.foodByZone.congelador} items</p>
                <Link href="/inventory/comida/congelador" className="mt-2 inline-block text-[11px] font-semibold text-indigo-700 underline underline-offset-2">Abrir congelador</Link>
              </div>
              <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-semibold text-amber-700">Lacena</p>
                <p className="mt-1 text-[11px] text-slate-600">{summary.foodByZone.lacena} items</p>
                <Link href="/inventory/comida/lacena" className="mt-2 inline-block text-[11px] font-semibold text-amber-700 underline underline-offset-2">Abrir lacena</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="ios-widget-strong">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Stock bajo</h2>
            <Link href="/inventory?low_stock=1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
              Ver
            </Link>
          </div>

          {topLowStock.length === 0 ? (
            <p className="text-sm text-slate-500">Sin alertas</p>
          ) : (
            <div className="space-y-2">
              {topLowStock.map((item) => (
                <Link key={item.id} href={`/item/${encodeURIComponent(item.id)}`} className="block rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                  <p className="font-medium">{item.nombre}</p>
                  <p className="mt-0.5">{item.cantidad_actual}/{item.cantidad_minima}{item.unidad ? ` ${item.unidad}` : ""}</p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/inventory?low_stock=1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              Solo bajo stock
            </Link>
            <Link href="/shopping/comida?low_stock=1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">
              Ir a compras
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <div className="ios-widget-strong lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Casa (vista rapida)</h2>
            <Link href="/inventory/casa" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
              Abrir hub
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Link href="/inventory/casa/aseo-casa" className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
              <p className="text-xs font-semibold text-cyan-700">Aseo Casa</p>
              <p className="mt-1 text-[11px] text-slate-600">{summary.houseByZone.aseo_casa} items</p>
            </Link>
            <Link href="/inventory/casa/aseo-personal" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-semibold text-emerald-700">Aseo Personal</p>
              <p className="mt-1 text-[11px] text-slate-600">{summary.houseByZone.aseo_personal} items</p>
            </Link>
            <Link href="/inventory/casa/mejoras-casa" className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <p className="text-xs font-semibold text-indigo-700">Mejoras Casa</p>
              <p className="mt-1 text-[11px] text-slate-600">{summary.houseByZone.mejoras_casa} items</p>
            </Link>
          </div>
        </div>
        <div className="ios-widget-strong">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Reposicion casa</h2>
            <Link href="/shopping/casa?low_stock=1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
              Ir a compras
            </Link>
          </div>
          <p className="text-sm text-slate-600">Compra por subcategoria sin GPT: aseo casa, personal y mejoras.</p>
        </div>
      </section>

      {customCategories.length > 0 ? (
        <section className="ios-widget">
          <h3 className="text-sm font-semibold text-slate-900">Categorias personalizadas</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {customCategories.map((category) => (
              <Link
                key={category}
                href={`/inventory/${encodeURIComponent(category)}`}
                className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white"
              >
                {category} ({summary.byMainCategory[category]})
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/items/new" className="ios-widget transition duration-200 hover:-translate-y-px hover:shadow">
          <h3 className="text-sm font-semibold text-slate-900">Crear nuevo item</h3>
          <p className="mt-1 text-xs text-slate-600">Acceso directo al formulario.</p>
        </Link>
        <Link href="/inventory/comida" className="ios-widget transition duration-200 hover:-translate-y-px hover:shadow">
          <h3 className="text-sm font-semibold text-slate-900">Gestionar comida</h3>
          <p className="mt-1 text-xs text-slate-600">Vista por zonas: nevera, congelador y lacena.</p>
        </Link>
      </section>
    </main>
  );
}
