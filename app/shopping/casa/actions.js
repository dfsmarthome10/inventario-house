"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendHomeAssistantEvent } from "@/lib/homeAssistantEvents";
import { isLowStock } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";
import { confirmHousePurchase, getOrCreateOpenHouseSession, removeCartLine, upsertCartLine } from "@/lib/shoppingRepository";

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

function revalidateShoppingPaths() {
  revalidatePath("/shopping");
  revalidatePath("/shopping/casa");
  revalidatePath("/shopping/history");
  revalidatePath("/shopping/history/calendar");
}

function revalidateInventoryViews(itemIds = []) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/inventory");
  revalidatePath("/inventory/casa");
  revalidatePath("/inventory/casa/aseo-casa");
  revalidatePath("/inventory/casa/aseo-personal");
  revalidatePath("/inventory/casa/mejoras-casa");
  revalidatePath("/shopping/casa");
  itemIds.forEach((itemId) => revalidatePath(`/item/${itemId}`));
}

export async function addToCasaCartAction(formData) {
  const inventoryItemId = getStringValue(formData, "inventoryItemId");
  const quantityToBuy = getPositiveInteger(formData, "quantity_to_buy");
  const purchasePrice = getPositivePrice(formData, "purchase_price");
  const taxApplies = getBooleanValue(formData, "tax_applies");

  const session = await getOrCreateOpenHouseSession();
  await upsertCartLine({
    sessionId: session.id,
    inventoryItemId,
    quantityToBuy,
    purchasePrice,
    taxApplies,
  });

  revalidateShoppingPaths();
}

export async function updateCasaCartLineAction(formData) {
  const inventoryItemId = getStringValue(formData, "inventoryItemId");
  const quantityToBuy = getPositiveInteger(formData, "quantity_to_buy");
  const purchasePrice = getPositivePrice(formData, "purchase_price");
  const taxApplies = getBooleanValue(formData, "tax_applies");

  const session = await getOrCreateOpenHouseSession();
  await upsertCartLine({
    sessionId: session.id,
    inventoryItemId,
    quantityToBuy,
    purchasePrice,
    taxApplies,
  });

  revalidateShoppingPaths();
}

export async function removeCasaCartLineAction(formData) {
  const inventoryItemId = getStringValue(formData, "inventoryItemId");
  const session = await getOrCreateOpenHouseSession();

  await removeCartLine({
    sessionId: session.id,
    inventoryItemId,
  });

  revalidateShoppingPaths();
}

export async function confirmCasaPurchaseAction() {
  const session = await getOrCreateOpenHouseSession();
  const { receiptId, touchedItemIds } = await confirmHousePurchase(session.id);
  const allItems = await getAllItems();
  const lowStockItems = allItems.filter((item) => item.categoria_principal === "casa" && isLowStock(item));

  await sendHomeAssistantEvent("purchase_confirmed", {
    receipt_id: receiptId,
    session_id: session.id,
    scope: "casa",
    touched_item_ids: touchedItemIds,
    low_stock_count: lowStockItems.length,
  });

  if (lowStockItems.length > 0) {
    await sendHomeAssistantEvent("low_stock_snapshot", {
      scope: "casa",
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