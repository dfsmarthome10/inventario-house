const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDate(dateText) {
  if (typeof dateText !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return null;
  }
  const parsed = new Date(`${dateText}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getTodayUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function diffDaysFromToday(targetDate) {
  const today = getTodayUtcMidnight();
  return Math.floor((targetDate.getTime() - today.getTime()) / DAY_MS);
}

export function getSoonExpirationInfo(item, windowDays = 7) {
  if (!item || item.categoria_principal !== "comida" || !item.expiration_enabled) {
    return null;
  }

  const dates = Array.isArray(item.expiration_dates) ? item.expiration_dates : [];
  const normalized = dates
    .map((entry) => {
      const dateText = entry?.expires_on;
      const date = toUtcDate(dateText);
      if (!date) return null;
      return {
        expires_on: dateText,
        diffDays: diffDaysFromToday(date),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.diffDays - b.diffDays);

  if (!normalized.length) {
    return null;
  }

  const nearest = normalized[0];
  if (nearest.diffDays > windowDays) {
    return null;
  }

  if (nearest.diffDays < 0) {
    return {
      tone: "danger",
      label: `Vencido ${Math.abs(nearest.diffDays)}d`,
      expiresOn: nearest.expires_on,
    };
  }

  if (nearest.diffDays === 0) {
    return {
      tone: "danger",
      label: "Vence hoy",
      expiresOn: nearest.expires_on,
    };
  }

  return {
    tone: "warning",
    label: `Vence en ${nearest.diffDays}d`,
    expiresOn: nearest.expires_on,
  };
}
