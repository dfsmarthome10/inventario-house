import Link from "next/link";
import { getThumbnailPreviewUrl } from "@/lib/thumbnailUrl";

export default function InventoryItemCard({ item }) {
  const quantityLabel = typeof item.cantidad_actual === "number"
    ? `${item.cantidad_actual}${item.unidad ? ` ${item.unidad}` : ""}`
    : "N/A";
  const thumbnailUrl = getThumbnailPreviewUrl(item.thumbnail_url);

  return (
    <Link
      href={`/item/${encodeURIComponent(item.id)}`}
      className="group block rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {thumbnailUrl ? (
            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img src={thumbnailUrl} alt={`Thumbnail de ${item.nombre}`} className="h-28 w-full object-cover" loading="lazy" />
            </div>
          ) : null}
          <p className="text-base font-semibold text-slate-900">{item.nombre}</p>
          <p className="text-sm text-slate-500">{item.alias}</p>
        </div>
        <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{quantityLabel}</span>
      </div>
      <p className="mt-2 text-sm text-slate-600">Ubicacion: {item.ubicacion}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">{item.categoria_principal}</span>
        {item.subcategoria ? (
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700">{item.subcategoria}</span>
        ) : null}
      </div>
    </Link>
  );
}
