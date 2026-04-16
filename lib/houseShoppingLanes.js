const HOUSE_LANE_ORDER = [
  "limpieza_general",
  "lavanderia_materiales",
  "pisos_profesional",
  "desechables",
  "mantenimiento_hogar",
  "cuidado_personal",
  "otros_hogar",
];

export const HOUSE_LANE_META = {
  limpieza_general: {
    label: "Limpieza general",
    description: "Superficies, sanitizacion y uso diario.",
  },
  lavanderia_materiales: {
    label: "Lavanderia y materiales",
    description: "Lavado y materiales de trabajo/laundry.",
  },
  pisos_profesional: {
    label: "Pisos profesional",
    description: "Sellado, encerado y tratamiento de piso.",
  },
  desechables: {
    label: "Desechables",
    description: "Consumibles de uso rapido para el hogar.",
  },
  mantenimiento_hogar: {
    label: "Mantenimiento",
    description: "Lubricantes, repuestos y soporte tecnico.",
  },
  cuidado_personal: {
    label: "Cuidado personal",
    description: "Higiene personal del hogar.",
  },
  otros_hogar: {
    label: "Otros hogar",
    description: "Articulos fuera de pasillos principales.",
  },
};

function normalizeText(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(haystack, keywords) {
  return keywords.some((keyword) => haystack.includes(keyword));
}

export function getHouseShoppingLaneKey(item) {
  const subcategory = normalizeText(item?.subcategoria || "");
  const name = normalizeText(item?.nombre || item || "");

  if (subcategory === "aseo_personal") {
    return "cuidado_personal";
  }

  if (includesAny(name, ["floor wax", "floor sealer", "crosco", "encerado", "sellador", "wax 2000", "wax 2500"])) {
    return "pisos_profesional";
  }

  if (includesAny(name, ["cemento", "arena", "tierra para sembrar", "oxiclean", "zote", "suavizador", "detergente", "laundry"])) {
    return "lavanderia_materiales";
  }

  if (includesAny(name, ["platos desechables", "bolsas de basura", "toallas de papel", "desechables", "glad"])) {
    return "desechables";
  }

  if (includesAny(name, ["crc", "lubricant", "lubricante", "tape electrico", "regleta", "extensiones", "fusibles", "adaptadores", "bombillas"])) {
    return "mantenimiento_hogar";
  }

  if (includesAny(name, ["clorox", "lysol", "windex", "fabuloso", "pink stuff", "alcohol", "mr. clean", "dawn", "vinagre de limpieza", "desinfect", "limpiador", "jabon de fregar"])) {
    return "limpieza_general";
  }

  if (subcategory === "mejoras_casa") {
    return "mantenimiento_hogar";
  }

  if (subcategory === "aseo_casa") {
    return "limpieza_general";
  }

  return "otros_hogar";
}

export function getHouseShoppingLaneLabel(laneKey) {
  return HOUSE_LANE_META[laneKey]?.label || HOUSE_LANE_META.otros_hogar.label;
}

export function getHouseShoppingLaneOrder(laneKey) {
  const index = HOUSE_LANE_ORDER.indexOf(laneKey);
  return index === -1 ? HOUSE_LANE_ORDER.length : index;
}

export function sortHouseItemsForShopping(items) {
  return [...(items || [])].sort((a, b) => {
    const laneA = getHouseShoppingLaneKey(a);
    const laneB = getHouseShoppingLaneKey(b);
    const laneDiff = getHouseShoppingLaneOrder(laneA) - getHouseShoppingLaneOrder(laneB);

    if (laneDiff !== 0) {
      return laneDiff;
    }

    const nameA = (a?.nombre || "").toString();
    const nameB = (b?.nombre || "").toString();
    return nameA.localeCompare(nameB, "es");
  });
}

export function groupHouseItemsByLane(items) {
  const groupedMap = new Map();
  sortHouseItemsForShopping(items).forEach((item) => {
    const laneKey = getHouseShoppingLaneKey(item);
    if (!groupedMap.has(laneKey)) {
      groupedMap.set(laneKey, []);
    }
    groupedMap.get(laneKey).push(item);
  });

  return Array.from(groupedMap.entries())
    .sort((a, b) => getHouseShoppingLaneOrder(a[0]) - getHouseShoppingLaneOrder(b[0]))
    .map(([laneKey, laneItems]) => ({
      laneKey,
      laneLabel: getHouseShoppingLaneLabel(laneKey),
      laneDescription: HOUSE_LANE_META[laneKey]?.description || HOUSE_LANE_META.otros_hogar.description,
      items: laneItems,
    }));
}
