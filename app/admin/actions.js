"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { decrementQuantity, deleteItem, incrementQuantity, updateItem } from "@/lib/inventoryRepository";

function getItemIdFromFormData(formData) {
  const id = formData.get("itemId");

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Missing itemId");
  }

  return id;
}

function revalidateInventoryPaths(itemId) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/nfc");
  revalidatePath("/admin/nfc/items");
  revalidatePath("/admin/nfc/zones");
  revalidatePath("/inventory");
  revalidatePath("/inventory/comida");
  revalidatePath("/inventory/comida/lacena");
  revalidatePath("/inventory/comida/nevera");
  revalidatePath("/inventory/comida/congelador");
  revalidatePath("/inventory/comida/disponibles");
  revalidatePath("/inventory/cajas");
  revalidatePath("/inventory/herramientas");
  revalidatePath("/shopping/comida");
  revalidatePath("/shopping/recommend");
  revalidatePath(`/item/${itemId}`);
}

export async function incrementQuantityAction(formData) {
  const itemId = getItemIdFromFormData(formData);
  await incrementQuantity(itemId);
  revalidateInventoryPaths(itemId);
}

export async function decrementQuantityAction(formData) {
  const itemId = getItemIdFromFormData(formData);
  await decrementQuantity(itemId);
  revalidateInventoryPaths(itemId);
}

export async function deleteItemAction(formData) {
  const itemId = getItemIdFromFormData(formData);

  try {
    await deleteItem(itemId);
    revalidateInventoryPaths(itemId);
    redirect(`/admin?status=deleted&id=${encodeURIComponent(itemId)}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "delete_failed";
    redirect(`/admin?status=delete_error&id=${encodeURIComponent(itemId)}&reason=${encodeURIComponent(message)}`);
  }
}

function getOptionalInteger(formData, key) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number for ${key}`);
  }

  return Math.max(0, Math.floor(parsed));
}

export async function disableLowStockAlertAction(formData) {
  const itemId = getItemIdFromFormData(formData);
  await updateItem(itemId, { cantidad_minima: null });
  revalidateInventoryPaths(itemId);
}

export async function setLowStockThresholdAction(formData) {
  const itemId = getItemIdFromFormData(formData);
  const threshold = getOptionalInteger(formData, "cantidadMinima");

  if (threshold === null) {
    throw new Error("Debes indicar una cantidad minima valida.");
  }

  await updateItem(itemId, { cantidad_minima: threshold });
  revalidateInventoryPaths(itemId);
}
