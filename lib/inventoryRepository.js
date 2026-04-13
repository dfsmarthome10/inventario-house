import * as jsonInventoryRepository from "@/lib/repositories/jsonInventoryRepository";
import * as supabaseInventoryRepository from "@/lib/repositories/supabaseInventoryRepository";

function getRepository() {
  if (process.env.INVENTORY_DATA_SOURCE === "supabase") {
    return supabaseInventoryRepository;
  }

  return jsonInventoryRepository;
}

export async function getAllItems() {
  return getRepository().getAllItems();
}

export async function getItemById(id) {
  return getRepository().getItemById(id);
}

export async function getItemsByCategory() {
  return getRepository().getItemsByCategory();
}

export async function createItem(data) {
  return getRepository().createItem(data);
}

export async function updateItem(id, data) {
  return getRepository().updateItem(id, data);
}

export async function deleteItem(id) {
  return getRepository().deleteItem(id);
}

export async function incrementQuantity(id) {
  return getRepository().incrementQuantity(id);
}

export async function decrementQuantity(id) {
  return getRepository().decrementQuantity(id);
}

export async function getAllZoneTargets() {
  return getRepository().getAllZoneTargets();
}

export async function upsertZoneTarget(zoneKey, data) {
  return getRepository().upsertZoneTarget(zoneKey, data);
}
