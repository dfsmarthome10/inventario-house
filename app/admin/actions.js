"use server";

import { revalidatePath } from "next/cache";
import { decrementQuantity, incrementQuantity } from "@/lib/inventoryRepository";

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
  revalidatePath("/inventory/cajas");
  revalidatePath("/inventory/herramientas");
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
