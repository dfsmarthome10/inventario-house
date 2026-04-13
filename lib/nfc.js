export const FOOD_ZONE_KEYS = ["lacena", "nevera", "congelador"];

export function getAppBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/+$/, "");
}

export function buildFullNfcUrl(path) {
  if (!path) {
    return "";
  }

  const baseUrl = getAppBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function normalizeNfcMode(raw) {
  const value = (raw || "").toString().trim().toLowerCase();
  if (["none", "item", "zone"].includes(value)) {
    return value;
  }
  return "none";
}

export function normalizeNfcTargetType(raw) {
  const value = (raw || "").toString().trim().toLowerCase();
  if (["item", "zone"].includes(value)) {
    return value;
  }
  return null;
}

export function normalizeZoneKey(raw) {
  return (raw || "").toString().trim().toLowerCase().replace(/\s+/g, "-");
}

export function getZonePath(zoneKey) {
  const key = normalizeZoneKey(zoneKey);
  if (!key) {
    return null;
  }
  return `/inventory/comida/${encodeURIComponent(key)}`;
}

export function resolveItemNfcConfig(input) {
  const requestedMode = normalizeNfcMode(input?.nfc_mode);
  const tagUid = (input?.nfc_tag_uid || "").toString().trim() || null;
  const itemId = (input?.id || "").toString().trim();
  const mainCategory = (input?.categoria_principal || "").toString().trim().toLowerCase();
  const subcategory = normalizeZoneKey(input?.subcategoria);
  const zoneKeyInput = normalizeZoneKey(input?.zone_key);
  const zoneKey = zoneKeyInput || (mainCategory === "comida" ? subcategory : "");

  let mode = requestedMode;
  if (mainCategory === "cajas") {
    mode = "item";
  } else if (mainCategory === "herramientas") {
    mode = "none";
  } else if (mainCategory === "comida" && requestedMode !== "item") {
    mode = "zone";
  }

  if (mode === "item") {
    return {
      nfc_mode: "item",
      nfc_tag_uid: tagUid,
      nfc_target_type: "item",
      nfc_target_path: itemId ? `/item/${encodeURIComponent(itemId)}` : null,
      zone_key: null,
    };
  }

  if (mode === "zone") {
    const targetPath = getZonePath(zoneKey);
    return {
      nfc_mode: "zone",
      nfc_tag_uid: tagUid,
      nfc_target_type: targetPath ? "zone" : null,
      nfc_target_path: targetPath,
      zone_key: zoneKey || null,
    };
  }

  return {
    nfc_mode: "none",
    nfc_tag_uid: null,
    nfc_target_type: null,
    nfc_target_path: null,
    zone_key: null,
  };
}

export function getDefaultItemNfcMode(categoriaPrincipal) {
  const category = (categoriaPrincipal || "").toString().trim().toLowerCase();
  if (category === "cajas") {
    return "item";
  }
  if (category === "comida") {
    return "zone";
  }
  return "none";
}

export function getDefaultZoneTargets() {
  return FOOD_ZONE_KEYS.map((zoneKey) => ({
    zone_key: zoneKey,
    nfc_mode: "zone",
    nfc_tag_uid: null,
    nfc_target_type: "zone",
    nfc_target_path: getZonePath(zoneKey),
    created_at: null,
    updated_at: null,
  }));
}
