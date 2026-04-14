"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendHomeAssistantEvent } from "@/lib/homeAssistantEvents";
import { isLowStock } from "@/lib/inventoryFilters";
import { createItem, getAllItems } from "@/lib/inventoryRepository";
import { generateNextItemId } from "@/lib/inventoryId";
import { confirmFoodPurchase, getOrCreateOpenFoodSession, removeCartLine, upsertCartLine } from "@/lib/shoppingRepository";

const FOOD_ZONES = ["lacena", "nevera", "congelador"];

function getStringValue(formData, key) {
  const value = formData.get(key);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${key}`);
  }

  return value.trim();
}

function getPositiveInteger(formData, key) {
  const raw = getStringValue(formData, key);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${key}`);
  }

  return Math.floor(parsed);
}

function getPositivePrice(formData, key) {
  const raw = getStringValue(formData, key);
  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Invalid ${key}`);
  }

  return Number(parsed.toFixed(2));
}

function getBooleanValue(formData, key) {
  return formData.get(key) === "1";
}

function getOptionalPrice(formData, key, fallback = 0) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }
  return getPositivePrice(formData, key);
}

function getOptionalPositiveInteger(formData, key, fallback = 1) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    return fallback;
  }
  return getPositiveInteger(formData, key);
}

function normalizeText(value) {
  return (value || "").toString().trim().toLowerCase().replace(/\s+/g, " ");
}

function locationFromZone(zone) {
  if (zone === "lacena") {
    return "Lacena";
  }
  if (zone === "nevera") {
    return "Nevera";
  }
  return "Congelador";
}

function revalidateShoppingPaths() {
  revalidatePath("/shopping");
  revalidatePath("/shopping/comida");
  revalidatePath("/shopping/casa");
  revalidatePath("/shopping/history");
  revalidatePath("/shopping/history/calendar");
}

function revalidateInventoryViews(itemIds = []) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/inventory");
  revalidatePath("/inventory/comida");
  revalidatePath("/inventory/comida/lacena");
  revalidatePath("/inventory/comida/nevera");
  revalidatePath("/inventory/comida/congelador");
  revalidatePath("/inventory/cajas");
  revalidatePath("/inventory/herramientas");
  revalidatePath("/inventory/casa");
  revalidatePath("/inventory/casa/aseo-casa");
  revalidatePath("/inventory/casa/aseo-personal");
  revalidatePath("/inventory/casa/mejoras-casa");
  revalidatePath("/admin/nfc");
  revalidatePath("/admin/nfc/items");
  revalidatePath("/admin/nfc/zones");
  itemIds.forEach((itemId) => revalidatePath(`/item/${itemId}`));
}

export async function addToCartAction(formData) {
  const inventoryItemId = getStringValue(formData, "inventoryItemId");
  const quantityToBuy = getPositiveInteger(formData, "quantity_to_buy");
  const purchasePrice = getPositivePrice(formData, "purchase_price");
  const taxApplies = getBooleanValue(formData, "tax_applies");

  const session = await getOrCreateOpenFoodSession();
  await upsertCartLine({
    sessionId: session.id,
    inventoryItemId,
    quantityToBuy,
    purchasePrice,
    taxApplies,
  });

  revalidateShoppingPaths();
}

export async function updateCartLineAction(formData) {
  const inventoryItemId = getStringValue(formData, "inventoryItemId");
  const quantityToBuy = getPositiveInteger(formData, "quantity_to_buy");
  const purchasePrice = getPositivePrice(formData, "purchase_price");
  const taxApplies = getBooleanValue(formData, "tax_applies");

  const session = await getOrCreateOpenFoodSession();
  await upsertCartLine({
    sessionId: session.id,
    inventoryItemId,
    quantityToBuy,
    purchasePrice,
    taxApplies,
  });

  revalidateShoppingPaths();
}

export async function removeCartLineAction(formData) {
  const inventoryItemId = getStringValue(formData, "inventoryItemId");
  const session = await getOrCreateOpenFoodSession();

  await removeCartLine({
    sessionId: session.id,
    inventoryItemId,
  });

  revalidateShoppingPaths();
}

export async function confirmPurchaseAction() {
  const session = await getOrCreateOpenFoodSession();
  const { receiptId, touchedItemIds } = await confirmFoodPurchase(session.id);
  const allItems = await getAllItems();
  const lowStockItems = allItems.filter((item) => item.categoria_principal === "comida" && isLowStock(item));

  await sendHomeAssistantEvent("purchase_confirmed", {
    receipt_id: receiptId,
    session_id: session.id,
    touched_item_ids: touchedItemIds,
    low_stock_count: lowStockItems.length,
  });

  if (lowStockItems.length > 0) {
    await sendHomeAssistantEvent("low_stock_snapshot", {
      count: lowStockItems.length,
      items: lowStockItems.slice(0, 20).map((item) => ({
        id: item.id,
        nombre: item.nombre,
        subcategoria: item.subcategoria,
        cantidad_actual: item.cantidad_actual,
        cantidad_minima: item.cantidad_minima,
        unidad: item.unidad,
      })),
    });
  }

  revalidateShoppingPaths();
  revalidateInventoryViews(touchedItemIds);
  redirect(`/shopping/receipt/${encodeURIComponent(receiptId)}`);
}

export async function createFoodItemFromShoppingAction(formData) {
  const nombre = getStringValue(formData, "nombre");
  const subcategoria = getStringValue(formData, "subcategoria").toLowerCase();
  const thumbnailUrlRaw = formData.get("thumbnail_url");
  const addToCart = formData.get("add_to_cart") === "1";
  const quantityToBuy = getOptionalPositiveInteger(formData, "quantity_to_buy", 1);
  const purchasePrice = getOptionalPrice(formData, "purchase_price", 0);
  const taxApplies = getBooleanValue(formData, "tax_applies");

  if (!FOOD_ZONES.includes(subcategoria)) {
    throw new Error("Subcategoria invalida. Usa lacena, nevera o congelador.");
  }

  const allItems = await getAllItems();
  const normalizedTarget = normalizeText(nombre);
  const duplicate = allItems.find(
    (item) =>
      item.categoria_principal === "comida" &&
      item.subcategoria === subcategoria &&
      (() => {
        const current = normalizeText(item.nombre);
        return current === normalizedTarget || current.includes(normalizedTarget) || normalizedTarget.includes(current);
      })()
  );

  if (duplicate) {
    redirect(
      `/shopping/comida?status=duplicate&subcategoria=${encodeURIComponent(subcategoria)}&search=${encodeURIComponent(nombre)}&duplicate_id=${encodeURIComponent(duplicate.id)}`
    );
  }

  const nextId = generateNextItemId(allItems, "comida", subcategoria);
  const thumbnail_url = typeof thumbnailUrlRaw === "string" && /^https?:\/\//i.test(thumbnailUrlRaw.trim()) ? thumbnailUrlRaw.trim() : null;

  const created = await createItem({
    id: nextId,
    alias: nextId,
    nombre,
    ubicacion: locationFromZone(subcategoria),
    categoria_principal: "comida",
    subcategoria,
    contenido: [],
    notas: null,
    cantidad_actual: 0,
    cantidad_minima: 1,
    unidad: "unidad",
    thumbnail_url,
  });

  if (addToCart) {
    const session = await getOrCreateOpenFoodSession();
    await upsertCartLine({
      sessionId: session.id,
      inventoryItemId: created.id,
      quantityToBuy,
      purchasePrice,
      taxApplies,
    });
  }

  revalidateShoppingPaths();
  revalidateInventoryViews([created.id]);

  const status = addToCart ? "created_and_added" : "created";
  redirect(`/shopping/comida?status=${status}&id=${encodeURIComponent(created.id)}&subcategoria=${encodeURIComponent(subcategoria)}`);
}
