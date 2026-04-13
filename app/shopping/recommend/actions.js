"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { sendHomeAssistantEvent } from "@/lib/homeAssistantEvents";
import { getAllItems } from "@/lib/inventoryRepository";
import { generateShoppingRecommendation } from "@/lib/openaiShoppingRecommendations";
import { createRecommendationRun, getOrCreateOpenFoodSession, upsertCartLine } from "@/lib/shoppingRepository";

const ALLOWED_MODES = ["compra_completa", "compra_budget", "compra_encargos"];

function getStringValue(formData, key) {
  const value = formData.get(key);
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function getMode(formData) {
  const mode = getStringValue(formData, "mode");
  if (!ALLOWED_MODES.includes(mode)) {
    throw new Error("Modo de recomendacion invalido.");
  }
  return mode;
}

function foodSnapshot(items) {
  return items
    .filter((item) => item.categoria_principal === "comida")
    .map((item) => ({
      id: item.id,
      nombre: item.nombre,
      subcategoria: item.subcategoria,
      cantidad_actual: item.cantidad_actual,
      cantidad_minima: item.cantidad_minima,
      unidad: item.unidad,
    }));
}

export async function generateRecommendationAction(formData) {
  const mode = getMode(formData);
  try {
    const inventory = await getAllItems();
    const snapshot = foodSnapshot(inventory);

    if (snapshot.length === 0) {
      redirect(`/shopping/recommend?status=empty_inventory&mode=${encodeURIComponent(mode)}`);
    }

    const recommendation = await generateShoppingRecommendation({
      mode,
      catalog: snapshot,
    });

    const run = await createRecommendationRun({
      mode,
      inventorySnapshot: snapshot,
      generatedList: recommendation,
    });

    await sendHomeAssistantEvent("recommendation_generated", {
      recommendation_run_id: run.id,
      mode,
      suggestion_count: Array.isArray(recommendation.suggestions) ? recommendation.suggestions.length : 0,
    });

    revalidatePath("/shopping/recommend");
    redirect(`/shopping/recommend?run=${encodeURIComponent(run.id)}`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "Recommendation failed";
    console.error("[generateRecommendationAction] recommendation failed", {
      mode,
      message,
      stack: error instanceof Error ? error.stack : null,
    });

    if (message.includes("OPENAI_API_KEY")) {
      redirect(`/shopping/recommend?status=missing_openai_key`);
    }
    if (message.includes("OPENAI_AUTH_ERROR")) {
      redirect(`/shopping/recommend?status=openai_auth_error`);
    }
    if (message.includes("OPENAI_QUOTA_ERROR")) {
      redirect(`/shopping/recommend?status=openai_quota_error`);
    }
    if (message.includes("OPENAI_TIMEOUT_ERROR")) {
      redirect(`/shopping/recommend?status=openai_timeout_error`);
    }
    if (message.includes("OPENAI_PARSE_ERROR")) {
      redirect(`/shopping/recommend?status=openai_parse_error`);
    }
    redirect(`/shopping/recommend?status=generation_error`);
  }
}

export async function addRecommendationLineToCartAction(formData) {
  const itemId = getStringValue(formData, "item_id");
  const quantity = Math.max(1, Math.floor(Number(getStringValue(formData, "suggested_quantity")) || 1));

  if (!itemId) {
    throw new Error("Missing item_id");
  }

  const session = await getOrCreateOpenFoodSession();
  await upsertCartLine({
    sessionId: session.id,
    inventoryItemId: itemId,
    quantityToBuy: quantity,
    purchasePrice: 0,
    taxApplies: false,
  });

  revalidatePath("/shopping/comida");
  revalidatePath("/shopping/recommend");
  redirect(`/shopping/comida?status=recommend_added&id=${encodeURIComponent(itemId)}`);
}
