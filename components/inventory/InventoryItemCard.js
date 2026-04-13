import Link from "next/link";
import ThumbnailImage from "@/components/common/ThumbnailImage";
import { getStockPriority, isLowStock } from "@/lib/inventoryFilters";

const PRIORITY_META = {
  critical: {
    label: "Critico",
    chip: "bg-rose-600 text-white",
    accent: "border-rose-200 bg-rose-50",
  },
  high: {
    label: "Alto",
    chip: "bg-rose-100 text-rose-700",
    accent: "border-rose-200 bg-rose-50",
  },
  medium: {
    label: "Medio",
    chip: "bg-amber-100 text-amber-700",
    accent: "border-amber-200 bg-amber-50",
  },
  normal: {
    label: "Normal",
    chip: "bg-emerald-100 text-emerald-700",
    accent: "border-slate-200 bg-white",
  },
};

export default function InventoryItemCard({ item, variant = "default" }) {
  const quantityLabel = typeof item.cantidad_actual === "number"
    ? `${item.cantidad_actual}${item.unidad ? ` ${item.unidad}` : ""}`
    : "N/A";
  const lowStock = isLowStock(item);
  const priority = getStockPriority(item);
  const priorityMeta = PRIORITY_META[priority] || PRIORITY_META.normal;
  const showroom = variant === "showroom";

  return (
    <Link
      href={`/item/${encodeURIComponent(item.id)}`}
      className={`group block border transition duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-md ${
        showroom ? `rounded-[2rem] p-4 shadow-md ${priorityMeta.accent}` : `rounded-3xl p-4 shadow-sm ${priorityMeta.accent}`
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <ThumbnailImage
            src={item.thumbnail_url}
            label={item.nombre}
            alt={`Thumbnail de ${item.nombre}`}
            className={showroom ? "h-36 w-full object-cover" : "h-28 w-full object-cover"}
            wrapperClassName={showroom ? "mb-3 rounded-3xl" : "mb-3"}
          />
          <p className="text-base font-semibold text-slate-900">{item.nombre}</p>
          <p className="text-sm text-slate-500">{item.alias}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{quantityLabel}</span>
          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${priorityMeta.chip}`}>{priorityMeta.label}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600">Ubicacion: {item.ubicacion}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-600">{item.categoria_principal}</span>
        {item.subcategoria ? (
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700">{item.subcategoria}</span>
        ) : null}
      </div>
      {lowStock && item.categoria_principal === "comida" ? (
        <div className="mt-2">
          <span className="inline-flex rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
            Reponer: /shopping/comida
          </span>
        </div>
      ) : null}
    </Link>
  );
}
