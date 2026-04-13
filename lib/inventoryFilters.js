export const MAIN_CATEGORIES = ["cajas", "herramientas", "comida", "otros"];
export const FOOD_SUBCATEGORIES = ["lacena", "nevera", "congelador"];

function hasNumericStock(item) {
  return typeof item?.cantidad_actual === "number" && typeof item?.cantidad_minima === "number";
}

export function getStockPriority(item) {
  const hasCurrent = typeof item?.cantidad_actual === "number";
  const hasMinimum = typeof item?.cantidad_minima === "number";

  if (!hasCurrent || !hasMinimum) {
    return "normal";
  }

  const current = item.cantidad_actual;
  const minimum = item.cantidad_minima;

  if (current === 0) {
    return "critical";
  }

  if (current <= minimum) {
    return "high";
  }

  const closeThreshold = minimum + Math.max(1, Math.ceil(minimum * 0.25));
  if (current <= closeThreshold) {
    return "medium";
  }

  return "normal";
}

export function isLowStock(item) {
  const priority = getStockPriority(item);
  return priority === "critical" || priority === "high";
}

export function sortByStockPriority(items) {
  const order = { critical: 0, high: 1, medium: 2, normal: 3 };

  return [...items].sort((a, b) => {
    const aPriority = getStockPriority(a);
    const bPriority = getStockPriority(b);
    const diff = (order[aPriority] ?? 99) - (order[bPriority] ?? 99);

    if (diff !== 0) {
      return diff;
    }

    return (a.nombre || "").localeCompare(b.nombre || "", "es");
  });
}

export function applyInventoryFilters(items, filters) {
  const search = (filters.search || "").trim().toLowerCase();
  const mainCategory = filters.categoria_principal || "";
  const subcategory = filters.subcategoria || "";
  const lowStockOnly = filters.low_stock === "1";

  return items.filter((item) => {
    if (search) {
      const haystack = `${item.id} ${item.alias} ${item.nombre}`.toLowerCase();
      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (mainCategory && item.categoria_principal !== mainCategory) {
      return false;
    }

    if (subcategory && item.subcategoria !== subcategory) {
      return false;
    }

    if (lowStockOnly && !isLowStock(item)) {
      return false;
    }

    return true;
  });
}

export function buildInventorySummary(items) {
  const total = items.length;
  const lowStock = sortByStockPriority(items.filter(isLowStock));
  const stockPriority = {
    critical: 0,
    high: 0,
    medium: 0,
    normal: 0,
  };
  const byMainCategory = {};
  MAIN_CATEGORIES.forEach((category) => {
    byMainCategory[category] = 0;
  });
  items.forEach((item) => {
    const category = item.categoria_principal || "otros";
    byMainCategory[category] = (byMainCategory[category] || 0) + 1;

    const priority = getStockPriority(item);
    stockPriority[priority] = (stockPriority[priority] || 0) + 1;
  });

  const foodByZone = FOOD_SUBCATEGORIES.reduce((acc, zone) => {
    acc[zone] = items.filter((item) => item.categoria_principal === "comida" && item.subcategoria === zone).length;
    return acc;
  }, {});

  return {
    total,
    lowStock,
    stockPriority,
    byMainCategory,
    foodByZone,
  };
}

export function getCategoryOptionsFromItems(items) {
  const mainSet = new Set(MAIN_CATEGORIES);
  const subSet = new Set(FOOD_SUBCATEGORIES);

  items.forEach((item) => {
    if (item.categoria_principal) {
      mainSet.add(item.categoria_principal);
    }
    if (item.subcategoria) {
      subSet.add(item.subcategoria);
    }
  });

  const mainCategories = [
    ...MAIN_CATEGORIES,
    ...Array.from(mainSet).filter((value) => !MAIN_CATEGORIES.includes(value)).sort(),
  ];

  const foodSubcategories = [
    ...FOOD_SUBCATEGORIES,
    ...Array.from(subSet).filter((value) => !FOOD_SUBCATEGORIES.includes(value)).sort(),
  ];

  return {
    mainCategories,
    foodSubcategories,
  };
}
