"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

const MAIN_CATEGORY_OPTIONS = [
  { value: "cajas", label: "Cajas" },
  { value: "herramientas", label: "Herramientas" },
  { value: "comida", label: "Comida" },
  { value: "casa", label: "Casa" },
  { value: "gabinete", label: "Gabinete" },
  { value: "otros", label: "Otros" },
];

const FOOD_SUBCATEGORY_OPTIONS = [
  { value: "lacena", label: "Lacena" },
  { value: "nevera", label: "Nevera" },
  { value: "congelador", label: "Congelador" },
  { value: "aseo_casa", label: "Aseo Casa" },
  { value: "aseo_personal", label: "Aseo Personal" },
  { value: "mejoras_casa", label: "Mejoras Casa" },
  { value: "gavetero_principal", label: "Gavetero Principal" },
  { value: "gavetero_1", label: "Gavetero 1" },
  { value: "gavetero_2", label: "Gavetero 2" },
  { value: "gavetero_3", label: "Gavetero 3" },
  { value: "gavetero_4", label: "Gavetero 4" },
];

function SubmitButton({ label }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
      {pending ? "Guardando..." : label}
    </button>
  );
}

function ErrorText({ text }) {
  if (!text) {
    return null;
  }

  return <p className="mt-1 text-xs font-medium text-rose-600">{text}</p>;
}

export default function InventoryItemForm({
  action,
  submitLabel,
  initialValues,
  appBaseUrl = "",
  readOnlyId = false,
  mainCategoryOptions = MAIN_CATEGORY_OPTIONS.map((opt) => opt.value),
  foodSubcategoryOptions = FOOD_SUBCATEGORY_OPTIONS.map((opt) => opt.value),
}) {
  const initialExpirationDatesText = Array.isArray(initialValues.expiration_dates)
    ? initialValues.expiration_dates
        .map((entry) => {
          const date = (entry?.expires_on || "").toString().trim();
          if (!date) {
            return "";
          }
          const quantity = entry?.quantity === null || entry?.quantity === undefined ? "" : `${entry.quantity}`;
          const note = (entry?.note || "").toString().trim();
          return [date, quantity, note].filter((part) => part !== "").join(" | ");
        })
        .filter(Boolean)
        .join("\n")
    : "";

  const initialState = {
    errors: {},
    values: {
      id: initialValues.id || "",
      alias: initialValues.alias || "",
      nombre: initialValues.nombre || "",
      ubicacion: initialValues.ubicacion || "",
      categoria_principal: initialValues.categoria_principal || "cajas",
      subcategoria: initialValues.subcategoria || "",
      contenido_text: (initialValues.contenido || []).join("\n"),
      notas: initialValues.notas || "",
      cantidad_actual_text: initialValues.cantidad_actual ?? "",
      cantidad_minima_text: initialValues.cantidad_minima ?? "",
      unidad: initialValues.unidad || "",
      thumbnail_url: initialValues.thumbnail_url || "",
      expiration_enabled: Boolean(initialValues.expiration_enabled),
      expiration_dates_text: initialExpirationDatesText,
      nfc_mode: initialValues.nfc_mode || "none",
      nfc_tag_uid: initialValues.nfc_tag_uid || "",
      zone_key: initialValues.zone_key || "",
    },
    message: "",
  };

  const [state, formAction] = useFormState(action, initialState);
  const values = state?.values || initialState.values;
  const [selectedMainCategory, setSelectedMainCategory] = useState(values.categoria_principal || "cajas");
  const [selectedSubcategory, setSelectedSubcategory] = useState(values.subcategoria || "");
  const [nfcMode, setNfcMode] = useState(values.nfc_mode || "none");
  const [zoneKey, setZoneKey] = useState(values.zone_key || values.subcategoria || "");
  const [expirationEnabled, setExpirationEnabled] = useState(Boolean(values.expiration_enabled));

  const nfcTargetPath = useMemo(() => {
    if (nfcMode === "item") {
      return values.id ? `/item/${encodeURIComponent(values.id)}` : "/item/{id-auto}";
    }

    if (nfcMode === "zone") {
      const currentZone = (zoneKey || (selectedMainCategory === "comida" ? selectedSubcategory : "") || "").trim().toLowerCase();
      return currentZone ? `/inventory/comida/${encodeURIComponent(currentZone)}` : "/inventory/comida/{zona}";
    }

    return "";
  }, [nfcMode, zoneKey, selectedMainCategory, selectedSubcategory, values.id]);

  const nfcWriteUrl = useMemo(() => {
    if (!nfcTargetPath) {
      return "";
    }
    return appBaseUrl ? `${appBaseUrl.replace(/\/+$/, "")}${nfcTargetPath}` : nfcTargetPath;
  }, [appBaseUrl, nfcTargetPath]);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        {readOnlyId ? (
          <label className="block">
            <span className="text-sm font-medium text-slate-700">ID</span>
            <input name="id" defaultValue={values.id} readOnly className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 read-only:bg-slate-100" />
            <ErrorText text={state?.errors?.id} />
          </label>
        ) : (
          <div className="block rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-800">
            El ID se genera automaticamente segun categoria y zona.
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Alias</span>
          <input name="alias" defaultValue={values.alias} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
          <ErrorText text={state?.errors?.alias} />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Nombre</span>
          <input name="nombre" defaultValue={values.nombre} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
          <ErrorText text={state?.errors?.nombre} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Ubicacion</span>
          <input name="ubicacion" defaultValue={values.ubicacion} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
          <ErrorText text={state?.errors?.ubicacion} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Unidad</span>
          <input name="unidad" defaultValue={values.unidad} placeholder="unidad, bolsa, botella" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Categoria principal</span>
          <input
            name="categoria_principal"
            list="main-category-options"
            defaultValue={values.categoria_principal}
            onChange={(event) => setSelectedMainCategory(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
          />
          <datalist id="main-category-options">
            {mainCategoryOptions.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          <ErrorText text={state?.errors?.categoria_principal} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Subcategoria (comida/casa/gabinete)</span>
          <input
            name="subcategoria"
            list="food-subcategory-options"
            defaultValue={values.subcategoria}
            onChange={(event) => setSelectedSubcategory(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
          />
          <datalist id="food-subcategory-options">
            {foodSubcategoryOptions.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>
          <p className="mt-1 text-xs text-slate-500">Comida: lacena/nevera/congelador. Casa: aseo_casa/aseo_personal/mejoras_casa. Gabinete: gavetero_principal/gavetero_1..4.</p>
          <ErrorText text={state?.errors?.subcategoria} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Cantidad actual</span>
          <input name="cantidad_actual" defaultValue={values.cantidad_actual_text} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
          <ErrorText text={state?.errors?.cantidad_actual} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Cantidad minima</span>
          <input name="cantidad_minima" defaultValue={values.cantidad_minima_text} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
          <ErrorText text={state?.errors?.cantidad_minima} />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Contenido (una linea por entrada)</span>
          <textarea name="contenido_text" defaultValue={values.contenido_text} rows={4} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notas</span>
          <textarea name="notas" defaultValue={values.notas} rows={3} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
        </label>

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Thumbnail URL (Google Drive o URL publica)</span>
          <input
            name="thumbnail_url"
            defaultValue={values.thumbnail_url}
            placeholder="https://drive.google.com/file/d/..."
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
          />
          <p className="mt-1 text-xs text-slate-500">No se suben archivos. Solo se guarda una URL externa.</p>
          <ErrorText text={state?.errors?.thumbnail_url} />
        </label>

        {selectedMainCategory === "comida" ? (
          <div className="sm:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Fechas de expiracion</p>
                <p className="mt-1 text-xs text-slate-600">Activa solo para alimentos que quieres monitorear por lote.</p>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-white bg-white px-3 py-2">
                <input
                  type="checkbox"
                  name="expiration_enabled"
                  value="1"
                  defaultChecked={Boolean(values.expiration_enabled)}
                  onChange={(event) => setExpirationEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Activar expiracion</span>
              </label>
            </div>

            {expirationEnabled ? (
              <label className="mt-3 block">
                <span className="text-sm font-medium text-slate-700">Lotes por linea</span>
                <textarea
                  name="expiration_dates_text"
                  defaultValue={values.expiration_dates_text || ""}
                  rows={4}
                  placeholder={"2026-05-01 | 2 | paquete abierto\n2026-05-20 | 1 | nuevo"}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
                />
                <p className="mt-1 text-xs text-slate-500">Formato: YYYY-MM-DD | cantidad | nota (cantidad y nota opcionales).</p>
                <ErrorText text={state?.errors?.expiration_dates_text} />
              </label>
            ) : (
              <input type="hidden" name="expiration_dates_text" value="" />
            )}
          </div>
        ) : null}

        <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Asignacion NFC</p>
          <p className="mt-1 text-xs text-slate-500">Define si el item no usa NFC, usa tag individual o usa tag compartido por zona.</p>
          <p className="mt-1 text-xs text-slate-500">Reglas automaticas: cajas -&gt; item, herramientas -&gt; none, comida -&gt; zone (o item si decides individual).</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Modo NFC</span>
              <select
                name="nfc_mode"
                defaultValue={values.nfc_mode}
                onChange={(event) => setNfcMode(event.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
              >
                <option value="none">none (sin NFC)</option>
                <option value="item">item (tag individual)</option>
                <option value="zone">zone (tag compartido de zona)</option>
              </select>
              <ErrorText text={state?.errors?.nfc_mode} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">NFC Tag UID</span>
              <input name="nfc_tag_uid" defaultValue={values.nfc_tag_uid} placeholder="UID opcional" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900" />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">Zone key (para modo zone)</span>
              <input
                name="zone_key"
                defaultValue={values.zone_key}
                onChange={(event) => setZoneKey(event.target.value)}
                placeholder={selectedMainCategory === "comida" ? selectedSubcategory || "nevera/lacena/congelador" : "zona-personalizada"}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
              />
            </label>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target path NFC</p>
            <p className="mt-1 break-all text-sm text-slate-800">{nfcTargetPath || "NFC desactivado"}</p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">URL final para escribir en el tag</p>
            <p className="mt-1 break-all text-sm text-slate-800">{nfcWriteUrl || "Configura NEXT_PUBLIC_APP_URL para ver URL completa."}</p>
          </div>
        </div>
      </div>

      {state?.message ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{state.message}</p> : null}

      <div className="flex items-center gap-2">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
