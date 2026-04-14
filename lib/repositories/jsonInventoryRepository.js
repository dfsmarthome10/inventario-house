import { promises as fs } from "fs";
import path from "path";
import { getDefaultItemNfcMode, getDefaultZoneTargets, normalizeNfcMode, normalizeNfcTargetType, normalizeZoneKey } from "@/lib/nfc";

const MAIN_CATEGORIES = ["cajas", "herramientas", "comida", "casa", "otros"];
const FOOD_SUBCATEGORIES = ["lacena", "nevera", "congelador"];
const HOUSE_SUBCATEGORIES = ["aseo_casa", "aseo_personal", "mejoras_casa"];
const dataFilePath = path.join(process.cwd(), "data", "inventory.json");

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

async function readInventoryJson() {
  const fileContents = await fs.readFile(dataFilePath, "utf-8");
  return JSON.parse(fileContents);
}

export async function getAllItems() {
  const data = await readInventoryJson();
  return Object.values(data).map(normalizeItem).sort(compareItems);
}

export async function getItemById(id) {
  const data = await readInventoryJson();
  const item = data[id] ?? null;
  return item ? normalizeItem(item) : null;
}

export async function getItemsByCategory() {
  const items = await getAllItems();
  return groupItemsByCategory(items);
}

export async function createItem() {
  throw new Error("Not implemented yet for JSON repository");
}

export async function updateItem() {
  throw new Error("Not implemented yet for JSON repository");
}

export async function deleteItem() {
  throw new Error("Not implemented yet for JSON repository");
}

export async function incrementQuantity() {
  return null;
}

export async function decrementQuantity() {
  return null;
}

export async function getAllZoneTargets() {
  return getDefaultZoneTargets();
}

export async function upsertZoneTarget() {
  throw new Error("Not implemented yet for JSON repository");
}
