export function formatCurrency(value, locale = "es-ES", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatDateTime(value, locale = "es-ES") {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function toMoneyNumber(value) {
  return Number(Number(value || 0).toFixed(2));
}
