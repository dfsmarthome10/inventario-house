"use server";

import { revalidatePath } from "next/cache";
import { getZonePath, normalizeZoneKey } from "@/lib/nfc";
import { upsertZoneTarget } from "@/lib/inventoryRepository";

export async function saveZoneTargetAction(previousState, formData) {
  const zoneKey = normalizeZoneKey(formData.get("zone_key"));
  const nfcTagUid = (formData.get("nfc_tag_uid") || "").toString().trim();
  const customPath = (formData.get("nfc_target_path") || "").toString().trim();

  if (!zoneKey) {
    return {
      ...previousState,
      error: "Zone key invalida.",
      success: "",
    };
  }

  try {
    await upsertZoneTarget(zoneKey, {
      nfc_tag_uid: nfcTagUid || null,
      nfc_target_path: customPath || getZonePath(zoneKey),
    });
  } catch (error) {
    return {
      ...previousState,
      error: `No se pudo guardar la zona: ${error.message}`,
      success: "",
    };
  }

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/inventory/comida");
  revalidatePath(`/inventory/comida/${zoneKey}`);
  revalidatePath("/admin");
  revalidatePath("/admin/nfc");
  revalidatePath("/admin/nfc/zones");
  revalidatePath("/admin/nfc/items");

  return {
    error: "",
    success: `Zona ${zoneKey} actualizada.`,
  };
}

