import { notFound } from "next/navigation";
import ThumbnailImage from "@/components/common/ThumbnailImage";
import { getItemById } from "@/lib/inventoryRepository";
import { buildFullNfcUrl } from "@/lib/nfc";

export const dynamic = "force-dynamic";

function QuantityRow({ actual, minima, unidad }) {
  if (actual === null || actual === undefined) {
    return <p className="text-sm text-slate-500">Cantidad no aplica para este item.</p>;
  }

  const lowStock = minima !== null && minima !== undefined && actual <= minima;
  const unitSuffix = unidad ? ` ${unidad}` : "";

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">Cantidad actual: {actual}{unitSuffix}</p>
      <p className="text-sm text-slate-600">Cantidad minima: {minima ?? "-"}{unitSuffix}</p>
      {lowStock ? <p className="mt-1 text-sm font-semibold text-rose-600">Nivel bajo: reponer pronto.</p> : null}
    </div>
  );
}

function ExpirationSection({ item }) {
  if (item.categoria_principal !== "comida") {
    return null;
  }

  const enabled = Boolean(item.expiration_enabled);
  const lots = Array.isArray(item.expiration_dates) ? item.expiration_dates : [];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Expiracion</h2>
      {!enabled ? (
        <p className="mt-2 text-sm text-slate-500">Seguimiento de expiracion desactivado para este alimento.</p>
      ) : lots.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">Expiracion activa, pero aun no hay lotes configurados.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {lots.map((lot, index) => (
            <div key={`${lot.expires_on || "sin-fecha"}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-800">Vence: {lot.expires_on || "Sin fecha"}</p>
              <p className="text-xs text-slate-600">
                Cantidad: {lot.quantity === null || lot.quantity === undefined ? "N/A" : lot.quantity}
                {item.unidad ? ` ${item.unidad}` : ""}
              </p>
              {lot.note ? <p className="mt-1 text-xs text-slate-500">Nota: {lot.note}</p> : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function ItemDetailPage({ params }) {
  const item = await getItemById(params.id);

  if (!item) {
    notFound();
  }

  return (
    <main className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <ThumbnailImage
          src={item.thumbnail_url}
          label={item.nombre}
          alt={`Thumbnail de ${item.nombre}`}
          className="h-44 w-full"
          wrapperClassName="mb-4"
        />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{item.nombre}</h1>
            <p className="mt-1 text-sm text-slate-500">Alias: {item.alias}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{item.categoria_principal}</span>
            {item.subcategoria ? <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{item.subcategoria}</span> : null}
          </div>
        </div>
      </section>

      <ExpirationSection item={item} />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Metadatos</h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">ID</dt>
            <dd className="mt-1 break-all text-slate-600">{item.id}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Ubicacion</dt>
            <dd className="mt-1 text-slate-600">{item.ubicacion}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Categoria principal</dt>
            <dd className="mt-1 text-slate-600">{item.categoria_principal}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Subcategoria</dt>
            <dd className="mt-1 text-slate-600">{item.subcategoria || "N/A"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Unidad</dt>
            <dd className="mt-1 text-slate-600">{item.unidad || "N/A"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Notas</dt>
            <dd className="mt-1 text-slate-600">{item.notas || "Sin notas"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
            <dt className="font-medium text-slate-700">Thumbnail URL</dt>
            <dd className="mt-1 break-all text-slate-600">{item.thumbnail_url || "No configurado"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">NFC mode</dt>
            <dd className="mt-1 text-slate-600">{item.nfc_mode || "none"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Tipo de contenedor</dt>
            <dd className="mt-1 text-slate-600">{item.container_type || "direct_item"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Contenedor padre</dt>
            <dd className="mt-1 text-slate-600">{item.parent_container_name || "N/A"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">Sistema logico</dt>
            <dd className="mt-1 text-slate-600">{item.sistema_logico ? "Si" : "No"}</dd>
          </div>
          {item.categoria_principal === "comida" ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <dt className="font-medium text-slate-700">Expiracion activa</dt>
              <dd className="mt-1 text-slate-600">{item.expiration_enabled ? "Si" : "No"}</dd>
            </div>
          ) : null}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <dt className="font-medium text-slate-700">NFC tag UID</dt>
            <dd className="mt-1 break-all text-slate-600">{item.nfc_tag_uid || "No configurado"}</dd>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
            <dt className="font-medium text-slate-700">NFC URL final</dt>
            <dd className="mt-1 break-all text-slate-600">{item.nfc_target_path ? buildFullNfcUrl(item.nfc_target_path) : "Sin NFC para este item"}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Contenido</h2>
        {item.contenido?.length ? (
          <ul className="mt-3 space-y-2">
            {item.contenido.map((entry) => (
              <li key={entry} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {entry}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No hay contenido registrado.</p>
        )}
      </section>

      <QuantityRow actual={item.cantidad_actual} minima={item.cantidad_minima} unidad={item.unidad} />
    </main>
  );
}
