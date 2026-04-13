import Link from "next/link";

export default function ItemNotFound() {
  return (
    <main className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <h1 className="text-xl font-semibold">Item no encontrado</h1>
      <p className="mt-2 text-sm text-slate-600">
        Verifica el ID del NFC o vuelve al dashboard para seleccionar otro item.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
      >
        Volver al inicio
      </Link>
    </main>
  );
}