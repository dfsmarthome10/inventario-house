export const GABINETE_SUBCATEGORIES = [
  "gavetero_principal",
  "gavetero_1",
  "gavetero_2",
  "gavetero_3",
  "gavetero_4",
];

export const GABINETE_SUBCATEGORY_LABELS = {
  gavetero_principal: "Gavetero Principal",
  gavetero_1: "Gavetero 1",
  gavetero_2: "Gavetero 2",
  gavetero_3: "Gavetero 3",
  gavetero_4: "Gavetero 4",
};

export const GABINETE_ZONE_SLUG_TO_KEY = {
  "gavetero-principal": "gavetero_principal",
  "gavetero-1": "gavetero_1",
  "gavetero-2": "gavetero_2",
  "gavetero-3": "gavetero_3",
  "gavetero-4": "gavetero_4",
};

export const GABINETE_ZONE_KEY_TO_SLUG = {
  gavetero_principal: "gavetero-principal",
  gavetero_1: "gavetero-1",
  gavetero_2: "gavetero-2",
  gavetero_3: "gavetero-3",
  gavetero_4: "gavetero-4",
};

export function getGabineteSubcategoryLabel(key) {
  return GABINETE_SUBCATEGORY_LABELS[key] || key;
}

export function gabineteLocationFromSubcategory(subcategory) {
  if (subcategory === "gavetero_principal") {
    return "Gabinete Total - Gavetero Principal";
  }

  if (["gavetero_1", "gavetero_2", "gavetero_3", "gavetero_4"].includes(subcategory)) {
    return `Modulo de Gaveteros - ${getGabineteSubcategoryLabel(subcategory)}`;
  }

  return "Gabinete Total";
}
