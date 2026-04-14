"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { formatCurrency, toMoneyNumber } from "@/lib/formatters";

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

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
    >
      {pending ? "Procesando..." : "Comprado"}
    </button>
  );
}

export default function QuickCartDrawer({
  scopeLabel,
  scopeTone = "bg-slate-100 text-slate-700",
  lines,
  updateLineAction,
  removeLineAction,
  confirmPurchaseAction,
  fullCartHref,
  continueHref,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(
      (lines || []).map((line) => [
        line.inventory_item_id,
        {
          quantity_to_buy: line.quantity_to_buy,
          purchase_price: line.purchase_price,
          tax_applies: line.tax_applies ? "1" : "0",
        },
      ])
    )
  );

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const computed = useMemo(() => {
    return (lines || []).map((line) => {
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
    return { subtotal, tax, total, lineCount: computed.length };
  }, [computed]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
      >
        Carrito rapido
        <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{summary.lineCount}</span>
      </button>

      <div
        className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition ${open ? "opacity-100" : "opacity-0"}`}
        />

        <section
          role="dialog"
          aria-modal="true"
          aria-label={`Carrito rapido ${scopeLabel}`}
          className={`absolute bottom-0 left-0 right-0 h-[86vh] rounded-t-[2rem] border border-slate-200 bg-white p-4 shadow-2xl transition-transform duration-300 md:bottom-4 md:left-auto md:right-4 md:top-4 md:h-auto md:w-[460px] md:rounded-[2rem] ${
            open ? "translate-y-0" : "translate-y-full md:translate-y-0 md:translate-x-[115%]"
          }`}
        >
          <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick cart</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">Carrito rapido - {scopeLabel}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${scopeTone}`}>{summary.lineCount} lineas</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                Cerrar
              </button>
            </div>
          </div>

          <div className="max-h-[48vh] space-y-2 overflow-y-auto pr-1 md:max-h-[52vh]">
            {computed.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-500">
                Carrito vacio. Agrega items desde el catalogo.
              </p>
            ) : (
              computed.map((line) => (
                <article key={line.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{line.item?.nombre || line.inventory_item_id}</p>
                      <p className="text-xs text-slate-500">{line.item?.alias || line.inventory_item_id}</p>
                    </div>
                    <span className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-slate-700">{formatCurrency(line.ui_total)}</span>
                  </div>

                  <form action={updateLineAction} className="grid gap-2 sm:grid-cols-2">
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
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Precio</span>
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
                      <span className="text-xs text-slate-700">Impuesto 11.5%</span>
                    </label>
                    <div className="sm:col-span-2 grid grid-cols-3 gap-2 text-[11px]">
                      <p className="rounded-lg bg-white px-2 py-1 text-slate-600">Sub: {formatCurrency(line.ui_subtotal)}</p>
                      <p className="rounded-lg bg-white px-2 py-1 text-slate-600">Imp: {formatCurrency(line.ui_tax)}</p>
                      <p className="rounded-lg bg-white px-2 py-1 font-semibold text-slate-800">Tot: {formatCurrency(line.ui_total)}</p>
                    </div>
                    <div className="sm:col-span-2 flex gap-2">
                      <SaveLineButton />
                    </div>
                  </form>

                  <form action={removeLineAction} className="mt-2">
                    <input type="hidden" name="inventoryItemId" value={line.inventory_item_id} />
                    <RemoveLineButton />
                  </form>
                </article>
              ))
            )}
          </div>

          <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(summary.subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-slate-600">Impuesto</span>
              <span className="font-semibold text-slate-900">{formatCurrency(summary.tax)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-emerald-200 pt-2">
              <span className="text-slate-700">Total</span>
              <span className="text-lg font-semibold text-slate-900">{formatCurrency(summary.total)}</span>
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            <Link href={fullCartHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Ver carrito completo
            </Link>
            <Link href={continueHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
              Seguir comprando
            </Link>
            {computed.length > 0 ? (
              <form action={confirmPurchaseAction}>
                <ConfirmButton />
              </form>
            ) : null}
          </div>
        </section>
      </div>
    </>
  );
}
