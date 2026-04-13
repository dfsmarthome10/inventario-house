import Link from "next/link";
import { formatDateTime } from "@/lib/formatters";
import { getRecommendationRunById } from "@/lib/shoppingRepository";
import { addRecommendationLineToCartAction, generateRecommendationAction } from "./actions";

export const dynamic = "force-dynamic";

const MODE_META = {
  compra_completa: {
    title: "Compra completa",
    description: "Restock amplio y sensato para recuperar inventario util.",
    tone: "border-emerald-200 bg-emerald-50",
  },
  compra_budget: {
    title: "Compra budget",
    description: "Prioriza faltantes relevantes con enfoque de costo.",
    tone: "border-amber-200 bg-amber-50",
  },
  compra_encargos: {
    title: "Compra encargos",
    description: "Lista minima de esenciales.",
    tone: "border-sky-200 bg-sky-50",
  },
};

function StatusBanner({ status }) {
  if (!status) {
    return null;
  }

  if (status === "empty_inventory") {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">No hay inventario de comida para recomendar.</div>;
  }

  if (status === "missing_openai_key") {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Falta OPENAI_API_KEY en variables de entorno del servidor.</div>;
  }

  if (status === "generation_error") {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">No se pudo generar la recomendacion en este momento.</div>;
  }

  return null;
}

export default async function ShoppingRecommendPage({ searchParams }) {
  const runId = typeof searchParams?.run === "string" ? searchParams.run : "";
  const status = typeof searchParams?.status === "string" ? searchParams.status : "";

  let run = null;
  let setupError = "";

  if (runId) {
    try {
      run = await getRecommendationRunById(runId);
    } catch (error) {
      setupError = error instanceof Error ? error.message : "No se pudo cargar la recomendacion.";
    }
  }

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recomendacion GPT</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Lista sugerida bajo demanda</h1>
            <p className="mt-1 text-sm text-slate-600">Genera recomendaciones solo cuando lo pidas, sin ejecucion automatica en background.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver a compras
            </Link>
            <Link href="/shopping/history/calendar" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Calendario
            </Link>
          </div>
        </div>
      </section>

      <StatusBanner status={status} />

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Selecciona un modo</h2>
        <p className="mt-1 text-sm text-slate-600">Esto usa OpenAI Responses API desde el servidor con tu inventario actual.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {Object.entries(MODE_META).map(([mode, meta]) => (
            <form key={mode} action={generateRecommendationAction} className={`rounded-2xl border p-4 ${meta.tone}`}>
              <input type="hidden" name="mode" value={mode} />
              <h3 className="text-sm font-semibold text-slate-900">{meta.title}</h3>
              <p className="mt-1 text-xs text-slate-600">{meta.description}</p>
              <button type="submit" className="mt-3 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
                Generar
              </button>
            </form>
          ))}
        </div>
      </section>

      {setupError ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-800">{setupError}</p>
        </section>
      ) : null}

      {run ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resultado</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{MODE_META[run.mode]?.title || run.mode}</h2>
              <p className="mt-1 text-sm text-slate-600">{run.generated_list?.summary || "Sin resumen."}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Generado: {formatDateTime(run.created_at)}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {(run.generated_list?.suggestions || []).map((line, index) => (
              <article key={`${line.item_id || line.item_name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{line.item_name}</p>
                    <p className="text-xs text-slate-500">{line.item_id || "Sin ID"} · prioridad {line.priority || "media"}</p>
                    <p className="mt-1 text-xs text-slate-600">{line.rationale}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Sugerido</p>
                    <p className="text-lg font-semibold text-slate-900">{line.suggested_quantity}</p>
                  </div>
                </div>
                {line.can_add_to_cart && line.item_id ? (
                  <form action={addRecommendationLineToCartAction} className="mt-3">
                    <input type="hidden" name="item_id" value={line.item_id} />
                    <input type="hidden" name="suggested_quantity" value={line.suggested_quantity} />
                    <button type="submit" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      Agregar al carrito
                    </button>
                  </form>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">No se puede agregar automaticamente (item no reconocido).</p>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
