import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getReceiptById } from "@/lib/shoppingRepository";

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

export default async function ShoppingReceiptPage({ params }) {
  let receipt = null;

  try {
    receipt = await getReceiptById(params.id);
  } catch (error) {
    return (
      <main>
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Recibo</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Configuracion pendiente</h1>
          <p className="mt-2 text-sm text-slate-700">No se pudo cargar el recibo porque falta la migracion de compras.</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">
            {error instanceof Error ? error.message : "Unknown error"}
          </pre>
          <div className="mt-4">
            <Link href="/shopping" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver a compras
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (!receipt) {
    notFound();
  }

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recibo de compra</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{receipt.id}</h1>
            <p className="mt-1 text-sm text-slate-600">Registro confirmado. Inventario actualizado al cerrar la compra.</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Scope: {SCOPE_LABELS[receipt.scope] || "General"}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Total final</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-emerald-800">{formatCurrency(receipt.grand_total || receipt.total_amount)}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Fecha</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(receipt.created_at)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Lineas</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{receipt.line_count}</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-emerald-600">Promedio por linea</p>
            <p className="mt-1 text-sm font-semibold text-emerald-800">{formatCurrency(receipt.line_count > 0 ? (receipt.grand_total || receipt.total_amount) / receipt.line_count : 0)}</p>
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <div className="flex items-center justify-between sm:block">
              <p className="text-slate-500">Subtotal</p>
              <p className="font-semibold text-slate-900">{formatCurrency(receipt.subtotal_amount)}</p>
            </div>
            <div className="flex items-center justify-between sm:block">
              <p className="text-slate-500">Impuesto</p>
              <p className="font-semibold text-slate-900">{formatCurrency(receipt.tax_total)}</p>
            </div>
            <div className="flex items-center justify-between sm:block">
              <p className="text-slate-500">Total final</p>
              <p className="font-semibold text-emerald-800">{formatCurrency(receipt.grand_total || receipt.total_amount)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Detalle de lineas</h2>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm bg-white">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 pb-2 pt-3 pr-4">Item</th>
                <th className="px-4 pb-2 pt-3 pr-4">Zona</th>
                <th className="px-4 pb-2 pt-3 pr-4">Cantidad</th>
                <th className="px-4 pb-2 pt-3 pr-4">Precio</th>
                <th className="px-4 pb-2 pt-3 pr-4">Impuesto</th>
                <th className="px-4 pb-2 pt-3 text-right">Subtotal</th>
                <th className="px-4 pb-2 pt-3 text-right">Total linea</th>
              </tr>
            </thead>
            <tbody>
              {receipt.lines.map((line) => (
                <tr key={line.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 pr-4">
                    <p className="font-medium text-slate-900">{line.item_nombre}</p>
                    <p className="text-xs text-slate-500">{line.item_alias}</p>
                  </td>
                  <td className="px-4 py-3 pr-4 text-slate-700">{ZONE_LABELS[line.subcategoria] || line.subcategoria || "-"}</td>
                  <td className="px-4 py-3 pr-4 text-slate-700">{line.quantity_purchased}</td>
                  <td className="px-4 py-3 pr-4 text-slate-700">{formatCurrency(line.purchase_price)}</td>
                  <td className="px-4 py-3 pr-4 text-slate-700">
                    {line.tax_applies ? `${formatCurrency(line.line_tax)} (11.5%)` : formatCurrency(0)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatCurrency(line.line_subtotal)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-800">{formatCurrency(line.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href={receipt.scope === "casa" ? "/shopping/casa" : "/shopping/comida"} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">
          Nueva compra
        </Link>
        <Link href="/shopping/history" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Ver historial
        </Link>
        <Link href={receipt.scope === "casa" ? "/inventory/casa" : "/inventory/comida"} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Volver al hub
        </Link>
      </section>
    </main>
  );
}
