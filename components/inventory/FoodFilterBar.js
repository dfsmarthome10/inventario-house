export default function FoodFilterBar({ searchParams = {}, clearHref }) {
  return (
    <form method="get" className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur">
      {searchParams.available_only === "1" ? <input type="hidden" name="available_only" value="1" /> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar alimento</span>
          <input
            name="search"
            defaultValue={searchParams.search || ""}
            placeholder="Ej: leche, arroz, ketchup"
            className="rounded-2xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </label>

        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
          <input
            type="checkbox"
            name="low_stock"
            value="1"
            defaultChecked={searchParams.low_stock === "1"}
            className="h-4 w-4 rounded border-slate-300"
          />
          <span className="text-sm font-medium text-slate-700">Solo stock bajo</span>
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button type="submit" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
          Aplicar
        </button>
        <a href={clearHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          Limpiar
        </a>
      </div>
    </form>
  );
}
