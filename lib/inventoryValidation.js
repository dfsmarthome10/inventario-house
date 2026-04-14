import { getDefaultItemNfcMode, normalizeNfcMode, normalizeZoneKey } from "@/lib/nfc";

function normalizeTag(raw) {
  return (raw || "").toString().trim().toLowerCase().replace(/\s+/g, "-");
}

function parseIntegerInput(raw) {
  const value = (raw || "").trim();
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? NaN : parsed;
}

function parseContenido(text) {
  return (text || "")
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function validateInventoryForm(formData, options = {}) {
  const requireId = options.requireId !== false;

  const values = {
    id: (formData.get("id") || "").toString().trim(),
    alias: (formData.get("alias") || "").toString().trim(),
    nombre: (formData.get("nombre") || "").toString().trim(),
    ubicacion: (formData.get("ubicacion") || "").toString().trim(),
    categoria_principal: normalizeTag(formData.get("categoria_principal")),
    subcategoria: normalizeTag(formData.get("subcategoria")),
    contenido_text: (formData.get("contenido_text") || "").toString(),
    notas: (formData.get("notas") || "").toString().trim(),
    cantidad_actual_text: (formData.get("cantidad_actual") || "").toString(),
    cantidad_minima_text: (formData.get("cantidad_minima") || "").toString(),
    unidad: (formData.get("unidad") || "").toString().trim(),
    thumbnail_url: (formData.get("thumbnail_url") || "").toString().trim(),
    nfc_mode: normalizeNfcMode(formData.get("nfc_mode")),
    nfc_tag_uid: (formData.get("nfc_tag_uid") || "").toString().trim(),
    zone_key: normalizeZoneKey(formData.get("zone_key")),
  };

  const errors = {};

  if (requireId && !values.id) {
    errors.id = "ID es requerido.";
  }

  if (!values.alias) {
    errors.alias = "Alias es requerido.";
  }

  if (!values.nombre) {
    errors.nombre = "Nombre es requerido.";
  }

  if (!values.ubicacion) {
    errors.ubicacion = "Ubicacion es requerida.";
  }

  if (!values.categoria_principal) {
    errors.categoria_principal = "Categoria principal requerida.";
  }

  const requiresSubcategory = values.categoria_principal === "comida" || values.categoria_principal === "casa";
  if (requiresSubcategory) {
    if (!values.subcategoria) {
      errors.subcategoria = "Subcategoria requerida para esta categoria.";
    }
  } else {
    values.subcategoria = "";
  }

  const cantidadActual = parseIntegerInput(values.cantidad_actual_text);
  const cantidadMinima = parseIntegerInput(values.cantidad_minima_text);

  if (Number.isNaN(cantidadActual) || (cantidadActual !== null && cantidadActual < 0)) {
    errors.cantidad_actual = "Cantidad actual debe ser un numero entero >= 0.";
  }

  if (Number.isNaN(cantidadMinima) || (cantidadMinima !== null && cantidadMinima < 0)) {
    errors.cantidad_minima = "Cantidad minima debe ser un numero entero >= 0.";
  }

  if (!errors.cantidad_actual && !errors.cantidad_minima && cantidadActual !== null && cantidadMinima !== null && cantidadMinima > cantidadActual) {
    errors.cantidad_minima = "Cantidad minima no debe ser mayor que la cantidad actual.";
  }

  if (values.thumbnail_url) {
    const isValidHttp = /^https?:\/\//i.test(values.thumbnail_url);
    if (!isValidHttp) {
      errors.thumbnail_url = "Thumbnail URL debe iniciar con http:// o https://";
    }
  }

  if (!["none", "item", "zone"].includes(values.nfc_mode)) {
    errors.nfc_mode = "Modo NFC invalido.";
  }

  const data = {
    id: values.id,
    alias: values.alias,
    nombre: values.nombre,
    ubicacion: values.ubicacion,
    categoria_principal: values.categoria_principal,
    subcategoria: values.subcategoria || null,
    contenido: parseContenido(values.contenido_text),
    notas: values.notas || null,
    cantidad_actual: Number.isNaN(cantidadActual) ? null : cantidadActual,
    cantidad_minima: Number.isNaN(cantidadMinima) ? null : cantidadMinima,
    unidad: values.unidad || null,
    thumbnail_url: values.thumbnail_url || null,
    nfc_mode: values.nfc_mode || getDefaultItemNfcMode(values.categoria_principal),
    nfc_tag_uid: values.nfc_tag_uid || null,
    zone_key: values.zone_key || null,
  };

  return {
    values,
    data,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
