import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { getDefaultItemNfcMode, getDefaultZoneTargets, normalizeNfcMode, normalizeNfcTargetType, normalizeZoneKey, resolveItemNfcConfig } from "@/lib/nfc";

const TABLE_NAME = "inventory_items";
const ZONE_TABLE_NAME = "nfc_zone_targets";
const PURCHASE_SESSION_ITEMS_TABLE = "purchase_session_items";
const MAIN_CATEGORIES = ["cajas", "herramientas", "comida", "casa", "otros"];
const FOOD_SUBCATEGORIES = ["lacena", "nevera", "congelador"];
const HOUSE_SUBCATEGORIES = ["aseo_casa", "aseo_personal", "mejoras_casa"];

function normalizeTag(raw, fallback = "") {
  const normalized = (raw || "").toString().trim().toLowerCase().replace(/\s+/g, "-");
  return normalized || fallback;
}

function legacyCategoryFromNew(mainCategory, subcategory) {
  if (mainCategory === "comida") {
    return subcategory || "comida";
  }

  return mainCategory;
}

function deriveCategories(raw) {
  if ((raw.categoria_principal || "").toString().trim()) {
    return {
      categoria_principal: normalizeTag(raw.categoria_principal, "otros"),
      subcategoria: normalizeTag(raw.subcategoria, ""),
    };
  }

  const legacy = raw.categoria;

  if (legacy === "cajas") {
    return { categoria_principal: "cajas", subcategoria: null };
  }

  if (legacy === "herramientas") {
    return { categoria_principal: "herramientas", subcategoria: null };
  }

  if (["aseo_casa", "aseo_personal", "mejoras_casa"].includes(legacy)) {
    return { categoria_principal: "casa", subcategoria: legacy };
  }

  if (["nevera", "pantry", "lacena", "congelador"].includes(legacy)) {
    return {
      categoria_principal: "comida",
      subcategoria: legacy === "pantry" ? "lacena" : legacy,
    };
  }

  return { categoria_principal: "otros", subcategoria: null };
}

function normalizeItem(raw) {
  if (!raw) {
    return null;
  }

  const derived = deriveCategories(raw);
  const categoria_principal = normalizeTag(derived.categoria_principal, "otros");

  const subcategoria = ["comida", "casa"].includes(categoria_principal) ? normalizeTag(derived.subcategoria, "") || null : null;

  return {
    ...raw,
    categoria_principal,
    subcategoria,
    categoria: legacyCategoryFromNew(categoria_principal, subcategoria),
    unidad: raw.unidad ?? null,
    thumbnail_url: raw.thumbnail_url ?? null,
    contenido: Array.isArray(raw.contenido) ? raw.contenido : [],
    expiration_enabled: Boolean(raw.expiration_enabled),
    expiration_dates: Array.isArray(raw.expiration_dates) ? raw.expiration_dates : [],
    nfc_mode: normalizeNfcMode(raw.nfc_mode || getDefaultItemNfcMode(categoria_principal)),
    nfc_tag_uid: raw.nfc_tag_uid ?? null,
    nfc_target_type: normalizeNfcTargetType(raw.nfc_target_type),
    nfc_target_path: raw.nfc_target_path ?? null,
    zone_key: normalizeZoneKey(raw.zone_key) || null,
  };
}

function compareItems(a, b) {
  const orderA = MAIN_CATEGORIES.includes(a.categoria_principal) ? MAIN_CATEGORIES.indexOf(a.categoria_principal) : MAIN_CATEGORIES.length;
  const orderB = MAIN_CATEGORIES.includes(b.categoria_principal) ? MAIN_CATEGORIES.indexOf(b.categoria_principal) : MAIN_CATEGORIES.length;
  const mainDiff = orderA - orderB;

  if (mainDiff !== 0) {
    return mainDiff;
  }

  const subCategoryOrder = a.categoria_principal === "comida" ? FOOD_SUBCATEGORIES : a.categoria_principal === "casa" ? HOUSE_SUBCATEGORIES : [];
  const subOrderA = subCategoryOrder.includes(a.subcategoria || "") ? subCategoryOrder.indexOf(a.subcategoria) : subCategoryOrder.length;
  const subOrderB = subCategoryOrder.includes(b.subcategoria || "") ? subCategoryOrder.indexOf(b.subcategoria) : subCategoryOrder.length;
  const subDiff = subOrderA - subOrderB;

  if (subDiff !== 0) {
    return subDiff;
  }

  return a.nombre.localeCompare(b.nombre, "es");
}

function groupItemsByCategory(items) {
  const grouped = {};
  MAIN_CATEGORIES.forEach((cat) => {
    grouped[cat] = {
      categoria_principal: cat,
      items: [],
      subcategorias: cat === "comida"
        ? { lacena: [], nevera: [], congelador: [] }
        : cat === "casa"
          ? { aseo_casa: [], aseo_personal: [], mejoras_casa: [] }
          : {},
    };
  });

  items.forEach((item) => {
    const mainCategory = item.categoria_principal || "otros";
    if (!grouped[mainCategory]) {
      grouped[mainCategory] = {
        categoria_principal: mainCategory,
        items: [],
        subcategorias: mainCategory === "comida"
          ? { lacena: [], nevera: [], congelador: [] }
          : mainCategory === "casa"
            ? { aseo_casa: [], aseo_personal: [], mejoras_casa: [] }
            : {},
      };
    }

    if (mainCategory === "comida" || mainCategory === "casa") {
      if (item.subcategoria && grouped[mainCategory].subcategorias[item.subcategoria]) {
        grouped[mainCategory].subcategorias[item.subcategoria].push(item);
      } else {
        grouped[mainCategory].items.push(item);
      }

      return;
    }

    grouped[mainCategory].items.push(item);
  });

  return grouped;
}

function getClient() {
  return getSupabaseServerClient();
}

function toInsertPayload(input) {
  const normalized = normalizeItem(input);
  const nfc = resolveItemNfcConfig(normalized);

  return {
    id: normalized.id,
    alias: normalized.alias,
    nombre: normalized.nombre,
    ubicacion: normalized.ubicacion,
    categoria_principal: normalized.categoria_principal,
    subcategoria: normalized.subcategoria,
    categoria: normalized.categoria,
    contenido: normalized.contenido,
    expiration_enabled: Boolean(normalized.expiration_enabled),
    expiration_dates: Array.isArray(normalized.expiration_dates) ? normalized.expiration_dates : [],
    notas: normalized.notas ?? null,
    cantidad_actual: normalized.cantidad_actual ?? null,
    cantidad_minima: normalized.cantidad_minima ?? null,
    unidad: normalized.unidad ?? null,
    thumbnail_url: normalized.thumbnail_url ?? null,
    nfc_mode: nfc.nfc_mode,
    nfc_tag_uid: nfc.nfc_tag_uid,
    nfc_target_type: nfc.nfc_target_type,
    nfc_target_path: nfc.nfc_target_path,
    zone_key: nfc.zone_key,
  };
}

function toUpdatePayload(currentItem, updates) {
  const merged = normalizeItem({ ...currentItem, ...updates });
  const nfc = resolveItemNfcConfig(merged);

  return {
    alias: merged.alias,
    nombre: merged.nombre,
    ubicacion: merged.ubicacion,
    categoria_principal: merged.categoria_principal,
    subcategoria: merged.subcategoria,
    categoria: merged.categoria,
    contenido: merged.contenido,
    expiration_enabled: Boolean(merged.expiration_enabled),
    expiration_dates: Array.isArray(merged.expiration_dates) ? merged.expiration_dates : [],
    notas: merged.notas ?? null,
    cantidad_actual: merged.cantidad_actual ?? null,
    cantidad_minima: merged.cantidad_minima ?? null,
    unidad: merged.unidad ?? null,
    thumbnail_url: merged.thumbnail_url ?? null,
    nfc_mode: nfc.nfc_mode,
    nfc_tag_uid: nfc.nfc_tag_uid,
    nfc_target_type: nfc.nfc_target_type,
    nfc_target_path: nfc.nfc_target_path,
    zone_key: nfc.zone_key,
    updated_at: new Date().toISOString(),
  };
}

function normalizeZoneTarget(row) {
  if (!row) {
    return null;
  }

  return {
    zone_key: normalizeZoneKey(row.zone_key),
    nfc_mode: normalizeNfcMode(row.nfc_mode || "zone"),
    nfc_tag_uid: row.nfc_tag_uid ?? null,
    nfc_target_type: normalizeNfcTargetType(row.nfc_target_type) || "zone",
    nfc_target_path: row.nfc_target_path ?? null,
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
}

export async function getAllItems() {
  const supabase = getClient();
  const { data, error } = await supabase.from(TABLE_NAME).select("*");

  if (error) {
    throw new Error(`Failed to fetch inventory items: ${error.message}`);
  }

  return (data || []).map(normalizeItem).sort(compareItems);
}

export async function getItemById(id) {
  const supabase = getClient();
  const { data, error } = await supabase.from(TABLE_NAME).select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch item ${id}: ${error.message}`);
  }

  return normalizeItem(data);
}

export async function getItemsByCategory() {
  const items = await getAllItems();
  return groupItemsByCategory(items);
}

export async function createItem(itemData) {
  const supabase = getClient();
  const payload = toInsertPayload(itemData);
  const { data, error } = await supabase.from(TABLE_NAME).insert(payload).select("*").single();

  if (error) {
    throw new Error(`Failed to create item ${itemData.id}: ${error.message}`);
  }

  return normalizeItem(data);
}

export async function updateItem(id, updates) {
  const currentItem = await getItemById(id);

  if (!currentItem) {
    return null;
  }

  const supabase = getClient();
  const payload = toUpdatePayload(currentItem, updates);
  const { data, error } = await supabase.from(TABLE_NAME).update(payload).eq("id", id).select("*").maybeSingle();

  if (error) {
    throw new Error(`Failed to update item ${id}: ${error.message}`);
  }

  return normalizeItem(data);
}

export async function deleteItem(id) {
  const supabase = getClient();

  const { error: detachCartError } = await supabase
    .from(PURCHASE_SESSION_ITEMS_TABLE)
    .delete()
    .eq("inventory_item_id", id);

  if (detachCartError) {
    throw new Error(`Failed to detach item ${id} from shopping cart lines: ${detachCartError.message}`);
  }

  const { data, error } = await supabase.from(TABLE_NAME).delete().eq("id", id).select("id").maybeSingle();

  if (error) {
    throw new Error(`Failed to delete item ${id}: ${error.message}`);
  }

  return data;
}

async function adjustQuantity(id, delta) {
  const currentItem = await getItemById(id);

  if (!currentItem) {
    return null;
  }

  if (typeof currentItem.cantidad_actual !== "number") {
    return currentItem;
  }

  const nextValue = Math.max(0, currentItem.cantidad_actual + delta);

  return updateItem(id, {
    cantidad_actual: nextValue,
  });
}

export async function incrementQuantity(id) {
  return adjustQuantity(id, 1);
}

export async function decrementQuantity(id) {
  return adjustQuantity(id, -1);
}

export async function getAllZoneTargets() {
  const supabase = getClient();
  const defaults = getDefaultZoneTargets();
  const { data, error } = await supabase.from(ZONE_TABLE_NAME).select("*");

  if (error) {
    throw new Error(`Failed to fetch zone targets: ${error.message}`);
  }

  const byKey = new Map(defaults.map((entry) => [entry.zone_key, entry]));
  (data || []).map(normalizeZoneTarget).forEach((entry) => {
    byKey.set(entry.zone_key, {
      ...byKey.get(entry.zone_key),
      ...entry,
    });
  });

  return Array.from(byKey.values());
}

export async function upsertZoneTarget(zoneKey, updates) {
  const normalizedZoneKey = normalizeZoneKey(zoneKey);
  const defaults = getDefaultZoneTargets().find((entry) => entry.zone_key === normalizedZoneKey);

  if (!defaults) {
    throw new Error(`Unsupported zone key: ${zoneKey}`);
  }

  const payload = {
    zone_key: normalizedZoneKey,
    nfc_mode: "zone",
    nfc_tag_uid: (updates?.nfc_tag_uid || "").toString().trim() || null,
    nfc_target_type: "zone",
    nfc_target_path: updates?.nfc_target_path || defaults.nfc_target_path,
    updated_at: new Date().toISOString(),
  };

  const supabase = getClient();
  const { data, error } = await supabase.from(ZONE_TABLE_NAME).upsert(payload, { onConflict: "zone_key" }).select("*").single();

  if (error) {
    throw new Error(`Failed to upsert zone target ${zoneKey}: ${error.message}`);
  }

  return normalizeZoneTarget(data);
}
