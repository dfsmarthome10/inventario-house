import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getPurchaseHistory } from "@/lib/shoppingRepository";

export const dynamic = "force-dynamic";

const ZONE_LABELS = {
  lacena: "Lacena",
  nevera: "Nevera",
  congelador: "Congelador",
  aseo_casa: "Aseo Casa",
  aseo_personal: "Aseo Personal",
  mejoras_casa: "Mejoras Casa",
};

const SCOPE_LABELS = {
  comida: "Comida",
  casa: "Casa",
};

export default async function ShoppingHistoryPage({ searchParams }) {
  let history = [];
  let setupError = "";

  try {
    history = await getPurchaseHistory(searchParams || {});
  } catch (error) {
    setupError = error instanceof Error ? error.message : "Shopping history is not ready.";
  }

  if (setupError) {
    return (
      <main className="space-y-5">
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Historial</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Configuracion pendiente</h1>
          <p className="mt-2 text-sm text-slate-700">No se pudo cargar historial de compras en este entorno.</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">{setupError}</pre>
          <div className="mt-4">
            <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver a compras
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Historial</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Compras anteriores</h1>
            <p className="mt-1 text-sm text-slate-600">Consulta recibos pasados, importes y zonas involucradas.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Nueva compra
            </Link>
            <Link href="/shopping/casa" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Compra casa
            </Link>
            <Link href="/shopping/recommend" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Recomendar
            </Link>
            <Link href="/shopping/history/calendar" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Vista calendario
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <form method="get" className="grid gap-3 sm:grid-cols-[1fr_170px_170px_auto] sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar</span>
            <input
              name="search"
              defaultValue={searchParams?.search || ""}
              placeholder="ID de recibo o nombre de item"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Scope</span>
            <select name="scope" defaultValue={searchParams?.scope || ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Todos</option>
              {Object.entries(SCOPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Zona</span>
            <select name="subcategoria" defaultValue={searchParams?.subcategoria || ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Todas</option>
              {Object.entries(ZONE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
              Filtrar
            </button>
            <a href="/shopping/history" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Limpiar
            </a>
          </div>
        </form>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Recibos</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{history.length}</span>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
            <p className="text-sm font-medium text-slate-700">No hay compras para estos filtros.</p>
            <p className="mt-1 text-sm text-slate-500">Intenta con otro texto o zona.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((receipt) => (
              <Link
                key={receipt.id}
                href={`/shopping/receipt/${encodeURIComponent(receipt.id)}`}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-px hover:border-slate-300 hover:bg-white"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{receipt.id}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(receipt.created_at)}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {receipt.key_items.length > 0 ? `Items clave: ${receipt.key_items.join(", ")}` : "Sin detalle de items"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total final</p>
                    <p className="text-lg font-semibold tracking-tight text-slate-900">{formatCurrency(receipt.grand_total || receipt.total_amount)}</p>
                    <p className="text-[11px] text-slate-500">{SCOPE_LABELS[receipt.scope] || "General"}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-700">{receipt.line_count} lineas</span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-700">{receipt.total_units} unidades</span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-medium text-slate-700">Impuesto {formatCurrency(receipt.tax_total || 0)}</span>
                  {receipt.zones.map((zone) => (
                    <span key={zone} className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium text-emerald-700">
                      {ZONE_LABELS[zone] || zone}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
