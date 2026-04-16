"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { formatCurrency, toMoneyNumber } from "@/lib/formatters";
import Link from "next/link";

function SaveLineButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

function RemoveLineButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
    >
      {pending ? "Quitando..." : "Quitar"}
    </button>
  );
}

function ConfirmPurchaseButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
    >
      {pending ? "Procesando compra..." : "Comprado"}
    </button>
  );
}

export default function ShoppingCartPanel({
  lines,
  updateLineAction,
  removeLineAction,
  confirmPurchaseAction,
  heading = "Carrito de compra",
  subtitle = "",
  scopeBadge = "",
  continueShoppingHref = "",
  switchScopeHref = "",
  switchScopeLabel = "",
  stickyTotals = false,
}) {
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(
      lines.map((line) => [
        line.inventory_item_id,
        {
          quantity_to_buy: line.quantity_to_buy,
          purchase_price: line.purchase_price,
          tax_applies: line.tax_applies ? "1" : "0",
        },
      ])
    )
  );

  const computed = useMemo(() => {
    return lines.map((line) => {
      const current = draft[line.inventory_item_id] || {
        quantity_to_buy: line.quantity_to_buy,
        purchase_price: line.purchase_price,
        tax_applies: line.tax_applies ? "1" : "0",
      };
      const quantity = Math.max(1, Math.floor(Number(current.quantity_to_buy) || 1));
      const price = Math.max(0, Number(current.purchase_price) || 0);
      const taxApplies = current.tax_applies === "1";
      const subtotal = toMoneyNumber(quantity * price);
      const tax = taxApplies ? toMoneyNumber(subtotal * 0.115) : 0;
      return {
        ...line,
        ui_quantity: quantity,
        ui_price: toMoneyNumber(price),
        ui_tax_applies: taxApplies,
        ui_subtotal: subtotal,
        ui_tax: tax,
        ui_total: toMoneyNumber(subtotal + tax),
      };
    });
  }, [draft, lines]);

  const summary = useMemo(() => {
    const subtotal = toMoneyNumber(computed.reduce((sum, line) => sum + line.ui_subtotal, 0));
    const tax = toMoneyNumber(computed.reduce((sum, line) => sum + line.ui_tax, 0));
    const total = toMoneyNumber(subtotal + tax);
    return { subtotal, tax, total };
  }, [computed]);

  if (lines.length === 0) {
    return (
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">{heading}</h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          {scopeBadge ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">{scopeBadge}</span> : null}
        </div>
        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-slate-700">Tu carrito esta vacio.</p>
          <p className="mt-1 text-sm text-slate-500">Agrega items desde el catalogo para iniciar la compra.</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {continueShoppingHref ? (
            <Link href={continueShoppingHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Seguir comprando
            </Link>
          ) : null}
          {switchScopeHref && switchScopeLabel ? (
            <Link href={switchScopeHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {switchScopeLabel}
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{heading}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        </div>
        {scopeBadge ? <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">{scopeBadge}</span> : null}
      </div>
      <div className="mb-4 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{lines.length} lineas</span>
        <div className="flex flex-wrap gap-2">
          {continueShoppingHref ? (
            <Link href={continueShoppingHref} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Seguir comprando
            </Link>
          ) : null}
          {switchScopeHref && switchScopeLabel ? (
            <Link href={switchScopeHref} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              {switchScopeLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {computed.map((line) => (
          <article key={line.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{line.item?.nombre || line.inventory_item_id}</p>
                <p className="text-xs text-slate-500">{line.item?.alias || line.inventory_item_id}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {(line.item?.categoria_principal || "sin-categoria").toString()} / {(line.item?.subcategoria || "sin-zona").toString()}
                </p>
              </div>
              <p className="rounded-lg border border-white bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                {formatCurrency(line.ui_total)}
              </p>
            </div>

            <form action={updateLineAction} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
              <input type="hidden" name="inventoryItemId" value={line.inventory_item_id} />

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cantidad</span>
                <input
                  type="number"
                  min="1"
                  name="quantity_to_buy"
                  value={draft[line.inventory_item_id]?.quantity_to_buy ?? line.quantity_to_buy}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [line.inventory_item_id]: {
                        ...(current[line.inventory_item_id] || {}),
                        quantity_to_buy: event.target.value,
                      },
                    }))
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Precio actual</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="purchase_price"
                  value={draft[line.inventory_item_id]?.purchase_price ?? line.purchase_price}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [line.inventory_item_id]: {
                        ...(current[line.inventory_item_id] || {}),
                        purchase_price: event.target.value,
                      },
                    }))
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                />
              </label>
              <label className="sm:col-span-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <input
                  type="checkbox"
                  name="tax_applies"
                  value="1"
                  checked={(draft[line.inventory_item_id]?.tax_applies ?? (line.tax_applies ? "1" : "0")) === "1"}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      [line.inventory_item_id]: {
                        ...(current[line.inventory_item_id] || {}),
                        tax_applies: event.target.checked ? "1" : "0",
                      },
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-xs text-slate-700">Aplica impuesto 11.5%</span>
              </label>

              <SaveLineButton />
            </form>

            <div className="mt-2 grid gap-1 text-xs sm:grid-cols-3">
              <p className="rounded-lg border border-white bg-white px-2 py-1 text-slate-600">Subtotal: <span className="font-semibold text-slate-800">{formatCurrency(line.ui_subtotal)}</span></p>
              <p className="rounded-lg border border-white bg-white px-2 py-1 text-slate-600">Impuesto: <span className="font-semibold text-slate-800">{formatCurrency(line.ui_tax)}</span></p>
              <p className="rounded-lg border border-white bg-white px-2 py-1 text-slate-600">Total linea: <span className="font-semibold text-slate-900">{formatCurrency(line.ui_total)}</span></p>
            </div>

            <form action={removeLineAction} className="mt-2">
              <input type="hidden" name="inventoryItemId" value={line.inventory_item_id} />
              <RemoveLineButton />
            </form>
          </article>
        ))}
      </div>

      <div className={`mt-4 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 ${stickyTotals ? "md:sticky md:top-24" : ""}`}>
        <div className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Resumen de compra</p>
            <p className="mt-1 text-sm text-slate-600">Totales con impuesto opcional por linea</p>
          </div>
          <p className="text-2xl font-semibold tracking-tight text-emerald-800">{formatCurrency(summary.total)}</p>
        </div>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-semibold text-slate-800">{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Impuesto total (11.5%)</span>
            <span className="font-semibold text-slate-800">{formatCurrency(summary.tax)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-emerald-100 pt-2">
            <span className="text-slate-700">Total final</span>
            <span className="text-lg font-semibold text-emerald-900">{formatCurrency(summary.total)}</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">El inventario se actualiza solo al confirmar.</p>
      </div>

      <form action={confirmPurchaseAction} className="mt-4">
        <ConfirmPurchaseButton />
      </form>
    </section>
  );
}
