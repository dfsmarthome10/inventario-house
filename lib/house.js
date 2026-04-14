export const HOUSE_SUBCATEGORIES = ["aseo_casa", "aseo_personal", "mejoras_casa"];

export const HOUSE_SUBCATEGORY_LABELS = {
  aseo_casa: "Aseo Casa",
  aseo_personal: "Aseo Personal",
  mejoras_casa: "Mejoras Casa",
};

export const HOUSE_ZONE_SLUG_TO_KEY = {
  "aseo-casa": "aseo_casa",
  "aseo-personal": "aseo_personal",
  "mejoras-casa": "mejoras_casa",
};

export const HOUSE_ZONE_KEY_TO_SLUG = {
  aseo_casa: "aseo-casa",
  aseo_personal: "aseo-personal",
  mejoras_casa: "mejoras-casa",
};

export function getHouseSubcategoryLabel(key) {
  return HOUSE_SUBCATEGORY_LABELS[key] || key;
}

export function houseLocationFromSubcategory(subcategory) {
  if (subcategory === "aseo_casa") {
    return "Area de limpieza";
  }

  if (subcategory === "aseo_personal") {
    return "Bano principal";
  }

  if (subcategory === "mejoras_casa") {
    return "Gabinete de repuestos";
  }

  return "Casa";
}