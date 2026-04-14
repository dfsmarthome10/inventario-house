import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";

function getTotals(cart) {
  return {
    lines: Number(cart?.line_count || 0),
    subtotal: Number(cart?.subtotal_amount || 0),
    tax: Number(cart?.tax_total || 0),
    total: Number(cart?.grand_total || cart?.total_amount || 0),
  };
}

export default function ShoppingCartSummaryCard({
  scopeLabel,
  scopeTone = "bg-slate-100 text-slate-700",
  cart,
  cartHref,
  continueHref,
}) {
  const totals = getTotals(cart);
  const previewLines = Array.isArray(cart?.lines) ? cart.lines.slice(0, 3) : [];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen rapido</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Carrito · {scopeLabel}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scopeTone}`}>{totals.lines} lineas</span>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Subtotal</span>
          <span className="font-semibold text-slate-900">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Impuesto</span>
          <span className="font-semibold text-slate-900">{formatCurrency(totals.tax)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2">
          <span className="text-slate-700">Total</span>
          <span className="text-lg font-semibold text-slate-900">{formatCurrency(totals.total)}</span>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {previewLines.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Carrito vacio. Agrega items desde el catalogo.
          </p>
        ) : (
          previewLines.map((line) => (
            <div key={line.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <p className="font-medium text-slate-900">{line.item?.nombre || line.inventory_item_id}</p>
              <p className="text-xs text-slate-500">
                x{line.quantity_to_buy} · {formatCurrency(line.line_total)}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={cartHref} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
          Abrir carrito completo
        </Link>
        {continueHref ? (
          <Link href={continueHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Seguir comprando
          </Link>
        ) : null}
      </div>
    </section>
  );
}
