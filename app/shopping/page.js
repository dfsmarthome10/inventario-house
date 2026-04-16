import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ShoppingEntryPage() {
  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Compras</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Compras del hogar</h1>
        <p className="mt-1 text-sm text-slate-600">Comida y casa ahora comparten un carrito unificado para una sola compra final.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/shopping/comida" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm transition hover:-translate-y-px hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Comida</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Shopping de comida</h2>
          <p className="mt-1 text-sm text-slate-600">Incluye recomendaciones GPT y reposicion por zonas de nevera, congelador y lacena.</p>
        </Link>
        <Link href="/shopping/casa" className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 shadow-sm transition hover:-translate-y-px hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Casa</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Shopping de casa</h2>
          <p className="mt-1 text-sm text-slate-600">Reposicion de aseo casa, aseo personal y mejoras casa sin motor GPT.</p>
        </Link>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Carrito unico</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">Carrito del hogar</h2>
            <p className="mt-1 text-sm text-slate-600">Puedes entrar desde comida o casa: veras el mismo carrito compartido.</p>
          </div>
          <Link href="/shopping/comida/cart" className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Abrir carrito
          </Link>
        </div>
      </section>
    </main>
  );
}
