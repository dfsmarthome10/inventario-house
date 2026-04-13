import * as jsonInventoryRepository from "@/lib/repositories/jsonInventoryRepository";
import * as supabaseInventoryRepository from "@/lib/repositories/supabaseInventoryRepository";

function normalizeDataSource(value) {
  if (!value) {
    return "";
  }

  return value.toString().trim().replace(/^['"]|['"]$/g, "").toLowerCase();
}

function getRepository() {
  const source = normalizeDataSource(process.env.INVENTORY_DATA_SOURCE);
  const hasSupabaseCredentials = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (source === "supabase" || (source !== "json" && hasSupabaseCredentials)) {
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
