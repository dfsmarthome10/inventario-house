import Link from "next/link";
import { getItemsByCategory } from "@/lib/inventoryRepository";
import { buildFullNfcUrl } from "@/lib/nfc";
import { getThumbnailPreviewUrl } from "@/lib/thumbnailUrl";
import { decrementQuantityAction, incrementQuantityAction } from "./actions";

export const dynamic = "force-dynamic";

const MAIN_CATEGORY_META = {
  cajas: { title: "Cajas", accent: "bg-amber-100 text-amber-700" },
  herramientas: { title: "Herramientas", accent: "bg-slate-200 text-slate-700" },
  comida: { title: "Comida", accent: "bg-emerald-100 text-emerald-700" },
  otros: { title: "Otros", accent: "bg-indigo-100 text-indigo-700" },
};

const FOOD_SUBCATEGORY_META = {
  lacena: "Lacena",
  nevera: "Nevera",
  congelador: "Congelador",
};

function QuantityActions({ itemId }) {
  return (
    <div className="flex items-center gap-2">
      <form action={decrementQuantityAction}>
        <input type="hidden" name="itemId" value={itemId} />
        <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50" type="submit">
          Cantidad -1
        </button>
      </form>
      <form action={incrementQuantityAction}>
        <input type="hidden" name="itemId" value={itemId} />
        <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50" type="submit">
          Cantidad +1
        </button>
      </form>
    </div>
  );
}

function ItemAdminCard({ item }) {
  const quantity = typeof item.cantidad_actual === "number" ? item.cantidad_actual : "N/A";
  const quantityMeta = item.unidad && typeof item.cantidad_actual === "number" ? ` ${item.unidad}` : "";
  const thumbnailUrl = getThumbnailPreviewUrl(item.thumbnail_url);
  const nfcLabel = item.nfc_mode === "item" ? "Item NFC" : item.nfc_mode === "zone" ? "Zona NFC" : "Sin NFC";
  const nfcUrl = item.nfc_target_path ? buildFullNfcUrl(item.nfc_target_path) : "";

  return (
    <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {thumbnailUrl ? (
            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img src={thumbnailUrl} alt={`Thumbnail de ${item.nombre}`} className="h-28 w-full object-cover" loading="lazy" />
            </div>
          ) : null}
          <p className="text-base font-semibold text-slate-900">{item.nombre}</p>
          <p className="text-sm text-slate-500">{item.alias}</p>
          <p className="mt-2 text-sm text-slate-600">Ubicacion: {item.ubicacion}</p>
          <p className="text-sm text-slate-600">
            Cantidad: <span className="font-semibold">{quantity}{quantityMeta}</span>
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {item.categoria_principal}{item.subcategoria ? ` / ${item.subcategoria}` : ""}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-600">NFC: {nfcLabel}</p>
          {nfcUrl ? <p className="mt-1 break-all text-xs text-slate-500">{nfcUrl}</p> : null}
        </div>

        <Link
          href={`/item/${encodeURIComponent(item.id)}`}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Ver
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/admin/items/${encodeURIComponent(item.id)}/edit`}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Editar item
        </Link>
        <button className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100">
          Eliminar item
        </button>
        <QuantityActions itemId={item.id} />
      </div>
    </article>
  );
}

function StatusBanner({ status, id }) {
  if (!status || !id) {
    return null;
  }

  const message = status === "created" ? `Item ${id} creado correctamente.` : status === "updated" ? `Item ${id} actualizado correctamente.` : "";

  if (!message) {
    return null;
  }

  return <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>;
}

export default async function AdminPage({ searchParams }) {
  const grouped = await getItemsByCategory();

  return (
    <main className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard de inventario</h1>
            <p className="mt-1 text-sm text-slate-600">Panel administrativo para gestionar estructura, cantidades y operaciones de mantenimiento.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/items/new" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Crear item</Link>
            <Link href="/admin/nfc" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Gestion NFC</Link>
            <Link href="/inventory" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Ver inventario</Link>
          </div>
        </div>
      </section>

      <StatusBanner status={searchParams?.status} id={searchParams?.id} />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Items por categoria</h2>
          <Link href="/" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
            Ir a inicio
          </Link>
        </div>

        <div className="space-y-5">
          {Object.entries(MAIN_CATEGORY_META).map(([mainCategory, meta]) => {
            const block = grouped[mainCategory];

            return (
              <div key={mainCategory} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{meta.title}</h3>
                  <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${meta.accent}`}>categoria principal</span>
                </div>

                {mainCategory === "comida" ? (
                  <div className="space-y-4">
                    {Object.entries(FOOD_SUBCATEGORY_META).map(([subKey, subLabel]) => {
                      const subItems = block?.subcategorias?.[subKey] || [];

                      return (
                        <div key={subKey} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">{subLabel}</h4>
                          {subItems.length === 0 ? (
                            <p className="text-sm text-slate-500">Sin items en esta zona.</p>
                          ) : (
                            <div className="grid gap-3">{subItems.map((item) => <ItemAdminCard key={item.id} item={item} />)}</div>
                          )}
                        </div>
                      );
                    })}

                    {(block?.items?.length || 0) > 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Comida sin zona</h4>
                        <div className="grid gap-3">{block.items.map((item) => <ItemAdminCard key={item.id} item={item} />)}</div>
                      </div>
                    ) : null}
                  </div>
                ) : (block?.items?.length || 0) === 0 ? (
                  <p className="text-sm text-slate-500">No hay items en esta categoria.</p>
                ) : (
                  <div className="grid gap-3">{block.items.map((item) => <ItemAdminCard key={item.id} item={item} />)}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
