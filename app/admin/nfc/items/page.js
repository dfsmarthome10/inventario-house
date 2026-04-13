import Link from "next/link";
import { buildFullNfcUrl } from "@/lib/nfc";
import { applyInventoryFilters } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

function getNfcModeLabel(mode) {
  if (mode === "item") {
    return "Item NFC";
  }
  if (mode === "zone") {
    return "Zona NFC";
  }
  return "Sin NFC";
}

export default async function AdminNfcItemsPage({ searchParams }) {
  const items = await getAllItems();
  const filtered = applyInventoryFilters(items, searchParams || {});

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">NFC por item</h1>
            <p className="mt-1 text-sm text-slate-600">Revisa estado NFC por item y navega directo a editar.</p>
          </div>
          <Link href="/admin/nfc" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">Volver</Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Items ({filtered.length})</p>
          <Link href="/admin/items/new" className="rounded-xl bg-ink px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">Crear item</Link>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No hay items registrados.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-slate-900">{item.nombre}</p>
                    <p className="text-xs text-slate-500">{item.id} - {item.alias}</p>
                    <p className="mt-1 text-xs text-slate-600">Categoria: {item.categoria_principal}{item.subcategoria ? ` / ${item.subcategoria}` : ""}</p>
                    <p className="mt-1 text-xs font-medium text-slate-700">Modo: {getNfcModeLabel(item.nfc_mode)}</p>
                    {item.nfc_tag_uid ? <p className="mt-1 break-all text-xs text-slate-600">UID: {item.nfc_tag_uid}</p> : null}
                    {item.nfc_target_path ? <p className="mt-1 break-all text-xs text-slate-600">Path: {item.nfc_target_path}</p> : null}
                    {item.nfc_target_path ? <p className="mt-1 break-all text-xs text-slate-600">URL final: {buildFullNfcUrl(item.nfc_target_path)}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/items/${encodeURIComponent(item.id)}/edit`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
                      Editar NFC
                    </Link>
                    <Link href={`/item/${encodeURIComponent(item.id)}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50">
                      Ver item
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
