import * as supabaseShoppingRepository from "@/lib/repositories/supabaseShoppingRepository";

function normalizeDataSource(value) {
  if (!value) {
    return "";
  }

  return value.toString().trim().replace(/^['"]|['"]$/g, "").toLowerCase();
}

function assertSupabaseDataSource() {
  const source = normalizeDataSource(process.env.INVENTORY_DATA_SOURCE);

  if (source !== "supabase") {
    throw new Error("Shopping mode requires INVENTORY_DATA_SOURCE=supabase");
  }
}

export async function getOrCreateOpenFoodSession() {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.getOrCreateOpenFoodSession();
}

export async function getFoodCatalog(filters) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.getFoodCatalog(filters);
}

export async function getSessionCart(sessionId) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.getSessionCart(sessionId);
}

export async function upsertCartLine(payload) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.upsertCartLine(payload);
}

export async function removeCartLine(payload) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.removeCartLine(payload);
}

export async function confirmFoodPurchase(sessionId) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.confirmFoodPurchase(sessionId);
}

export async function getReceiptById(receiptId) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.getReceiptById(receiptId);
}

export async function getPurchaseHistory(filters) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.getPurchaseHistory(filters);
}

export async function getPurchaseHistoryCalendar(month) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.getPurchaseHistoryCalendar(month);
}

export async function createRecommendationRun(payload) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.createRecommendationRun(payload);
}

export async function getRecommendationRunById(id) {
  assertSupabaseDataSource();
  return supabaseShoppingRepository.getRecommendationRunById(id);
}
