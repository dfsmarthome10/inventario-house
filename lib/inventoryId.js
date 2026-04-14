function normalizeCategoryToken(value, fallback = "item") {
  const normalized = (value || "").toString().trim().toLowerCase().replace(/\s+/g, "-");
  return normalized || fallback;
}

function getPrefix(categoriaPrincipal, subcategoria) {
  const main = normalizeCategoryToken(categoriaPrincipal, "item");
  const sub = normalizeCategoryToken(subcategoria, "");

  if (main === "cajas") {
    return "BX";
  }

  if (main === "herramientas") {
    return "TL";
  }

  if (main === "comida") {
    if (sub === "nevera") {
      return "FR";
    }
    if (sub === "congelador") {
      return "FZ";
    }
    if (sub === "lacena" || sub === "pantry") {
      return "PN";
    }
    return "FD";
  }

  if (main === "otros") {
    return "OT";
  }

  if (main === "casa") {
    if (sub === "aseo-casa") {
      return "CC";
    }
    if (sub === "aseo-personal") {
      return "CP";
    }
    if (sub === "mejoras-casa") {
      return "CM";
    }
    return "CS";
  }

  const letters = main.replace(/[^a-z]/g, "").toUpperCase();
  if (letters.length >= 2) {
    return letters.slice(0, 2);
  }
  if (letters.length === 1) {
    return `${letters}X`;
  }
  return "IT";
}

function extractNumberFromId(id, prefix) {
  const pattern = new RegExp(`^${prefix}-(\\d{4,})$`, "i");
  const match = pattern.exec(id || "");
  if (!match) {
    return null;
  }
  return Number.parseInt(match[1], 10);
}

export function generateNextItemId(items, categoriaPrincipal, subcategoria) {
  const prefix = getPrefix(categoriaPrincipal, subcategoria);
  let max = 0;

  items.forEach((item) => {
    const num = extractNumberFromId(item.id, prefix);
    if (typeof num === "number" && !Number.isNaN(num) && num > max) {
      max = num;
    }
  });

  const next = String(max + 1).padStart(4, "0");
  return `${prefix}-${next}`;
}
