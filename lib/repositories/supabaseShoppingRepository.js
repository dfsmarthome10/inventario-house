import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isLowStock } from "@/lib/inventoryFilters";
import { sortHouseItemsForShopping } from "@/lib/houseShoppingLanes";

const SESSIONS_TABLE = "purchase_sessions";
const SESSION_ITEMS_TABLE = "purchase_session_items";
const RECEIPTS_TABLE = "purchase_receipts";
const RECEIPT_ITEMS_TABLE = "purchase_receipt_items";
const RECOMMENDATION_TABLE = "shopping_recommendation_runs";
const INVENTORY_TABLE = "inventory_items";
const DEFAULT_TAX_RATE = 0.115;
const HOUSEHOLD_SCOPE = "household";
const LEGACY_SCOPES = ["comida", "casa"];

const SCOPE_CONFIG = {
  comida: {
    subcategories: ["lacena", "nevera", "congelador"],
  },
  casa: {
    subcategories: ["aseo_casa", "aseo_personal", "mejoras_casa"],
  },
};

function inferCategoryFromSubcategory(subcategory) {
  const value = (subcategory || "").toString().trim().toLowerCase();
  if (["lacena", "nevera", "congelador"].includes(value)) {
    return "comida";
  }
  if (["aseo_casa", "aseo_personal", "mejoras_casa"].includes(value)) {
    return "casa";
  }
  return null;
}

function getClient() {
  return getSupabaseServerClient();
}

function getScopeConfig(scope) {
  const normalized = (scope || "").toString().trim().toLowerCase();
  const config = SCOPE_CONFIG[normalized];

  if (!config) {
    throw new Error(`Unsupported shopping scope: ${scope}`);
  }

  return { scope: normalized, ...config };
}

function createId(prefix) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function money(value) {
  return Number(toNumber(value).toFixed(2));
}

function getLineSubtotal(quantity, price) {
  return money(toNumber(quantity) * toNumber(price));
}

function toBoolean(value) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function calculateLineTotals({ quantity, price, taxApplies, taxRate = DEFAULT_TAX_RATE }) {
  const subtotal = getLineSubtotal(quantity, price);
  const normalizedTaxRate = taxApplies ? money(taxRate) : 0;
  const lineTax = taxApplies ? money(subtotal * normalizedTaxRate) : 0;
  const lineTotal = money(subtotal + lineTax);

  return {
    tax_applies: Boolean(taxApplies),
    tax_rate: normalizedTaxRate,
    line_subtotal: subtotal,
    line_tax: lineTax,
    line_total: lineTotal,
  };
}

function normalizeSession(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    scope: row.scope,
    status: row.status,
    receipt_id: row.receipt_id ?? null,
    total_amount: money(row.total_amount),
    subtotal_amount: money(row.subtotal_amount),
    tax_total: money(row.tax_total),
    grand_total: money(row.grand_total),
    created_at: row.created_at,
    confirmed_at: row.confirmed_at ?? null,
  };
}

function normalizeCartLine(row) {
  const quantity = toNumber(row.quantity_to_buy);
  const price = money(row.purchase_price);
  const inventoryItem = row.inventory_item || null;
  const taxApplies = toBoolean(row.tax_applies);
  const taxRate = taxApplies ? money(row.tax_rate || DEFAULT_TAX_RATE) : 0;
  const lineTotals = calculateLineTotals({
    quantity,
    price,
    taxApplies,
    taxRate,
  });

  return {
    id: row.id,
    session_id: row.session_id,
    inventory_item_id: row.inventory_item_id,
    quantity_to_buy: quantity,
    purchase_price: price,
    tax_applies: lineTotals.tax_applies,
    tax_rate: lineTotals.tax_rate,
    line_subtotal: lineTotals.line_subtotal,
    line_tax: lineTotals.line_tax,
    line_total: lineTotals.line_total,
    created_at: row.created_at,
    updated_at: row.updated_at,
    item: inventoryItem
      ? {
          id: inventoryItem.id,
          alias: inventoryItem.alias,
          nombre: inventoryItem.nombre,
          subcategoria: inventoryItem.subcategoria,
          categoria_principal: inventoryItem.categoria_principal,
          cantidad_actual: inventoryItem.cantidad_actual,
          unidad: inventoryItem.unidad,
          thumbnail_url: inventoryItem.thumbnail_url,
        }
      : null,
  };
}

function buildCartSummary(lines) {
  const subtotal = money(lines.reduce((sum, line) => sum + line.line_subtotal, 0));
  const tax = money(lines.reduce((sum, line) => sum + line.line_tax, 0));
  const grand = money(lines.reduce((sum, line) => sum + line.line_total, 0));
  return {
    line_count: lines.length,
    subtotal_amount: subtotal,
    tax_total: tax,
    grand_total: grand,
    total_amount: grand,
    lines,
  };
}

function normalizeFilters(rawFilters = {}) {
  return {
    search: (rawFilters.search || "").toString().trim().toLowerCase(),
    subcategoria: (rawFilters.subcategoria || "").toString().trim().toLowerCase(),
    low_stock: rawFilters.low_stock === "1",
  };
}

function normalizeHistoryFilters(rawFilters = {}) {
  return {
    search: (rawFilters.search || "").toString().trim().toLowerCase(),
    subcategoria: (rawFilters.subcategoria || "").toString().trim().toLowerCase(),
    categoria: (rawFilters.categoria || "").toString().trim().toLowerCase(),
    scope: (rawFilters.scope || "").toString().trim().toLowerCase(),
  };
}

function normalizeCalendarDate(value) {
  const date = (value || "").toString().trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function cleanString(value) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeJsonValue(value) {
  if (typeof value === "string") {
    return cleanString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeJsonValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, val]) => val !== undefined)
        .map(([key, val]) => [key, sanitizeJsonValue(val)])
    );
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function filterItems(items, rawFilters, allowedSubcategories) {
  const filters = normalizeFilters(rawFilters);

  return items.filter((item) => {
    if (!allowedSubcategories.includes((item.subcategoria || "").toString().toLowerCase())) {
      return false;
    }

    if (filters.subcategoria && item.subcategoria !== filters.subcategoria) {
      return false;
    }

    if (filters.search) {
      const haystack = `${item.id} ${item.alias} ${item.nombre}`.toLowerCase();
      if (!haystack.includes(filters.search)) {
        return false;
      }
    }

    if (filters.low_stock && !isLowStock(item)) {
      return false;
    }

    return true;
  });
}

async function mergeLegacyOpenSessionsIntoHousehold(householdSessionId) {
  const supabase = getClient();
  const { data: legacySessions, error: legacySessionsError } = await supabase
    .from(SESSIONS_TABLE)
    .select("id, scope, created_at")
    .eq("status", "open")
    .in("scope", LEGACY_SCOPES)
    .neq("id", householdSessionId)
    .order("created_at", { ascending: true });

  if (legacySessionsError) {
    throw new Error(`Failed to load legacy shopping sessions: ${legacySessionsError.message}`);
  }

  for (const legacySession of legacySessions || []) {
    const { data: legacyLines, error: legacyLinesError } = await supabase
      .from(SESSION_ITEMS_TABLE)
      .select("inventory_item_id, quantity_to_buy, purchase_price, tax_applies, tax_rate, line_subtotal, line_tax, line_total")
      .eq("session_id", legacySession.id)
      .order("created_at", { ascending: true });

    if (legacyLinesError) {
      throw new Error(`Failed to load legacy cart lines: ${legacyLinesError.message}`);
    }

    for (const line of legacyLines || []) {
      const mergedTotals = calculateLineTotals({
        quantity: Math.max(1, toNumber(line.quantity_to_buy, 1)),
        price: Math.max(0, money(line.purchase_price)),
        taxApplies: toBoolean(line.tax_applies),
        taxRate: toBoolean(line.tax_applies) ? line.tax_rate || DEFAULT_TAX_RATE : 0,
      });

      const { data: existing, error: existingError } = await supabase
        .from(SESSION_ITEMS_TABLE)
        .select("id, quantity_to_buy, purchase_price, tax_applies")
        .eq("session_id", householdSessionId)
        .eq("inventory_item_id", line.inventory_item_id)
        .maybeSingle();

      if (existingError) {
        throw new Error(`Failed to inspect merged cart line: ${existingError.message}`);
      }

      if (existing) {
        const nextQuantity = Math.max(1, toNumber(existing.quantity_to_buy) + toNumber(line.quantity_to_buy, 1));
        const nextPrice = Math.max(0, money(line.purchase_price || existing.purchase_price || 0));
        const nextTaxApplies = toBoolean(line.tax_applies) || toBoolean(existing.tax_applies);
        const nextTotals = calculateLineTotals({
          quantity: nextQuantity,
          price: nextPrice,
          taxApplies: nextTaxApplies,
          taxRate: nextTaxApplies ? line.tax_rate || DEFAULT_TAX_RATE : 0,
        });

        const { error: updateMergedError } = await supabase
          .from(SESSION_ITEMS_TABLE)
          .update({
            quantity_to_buy: nextQuantity,
            purchase_price: nextPrice,
            tax_applies: nextTotals.tax_applies,
            tax_rate: nextTotals.tax_rate,
            line_subtotal: nextTotals.line_subtotal,
            line_tax: nextTotals.line_tax,
            line_total: nextTotals.line_total,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (updateMergedError) {
          throw new Error(`Failed to update merged line: ${updateMergedError.message}`);
        }
      } else {
        const { error: insertMergedError } = await supabase.from(SESSION_ITEMS_TABLE).insert({
          id: createId("LINE"),
          session_id: householdSessionId,
          inventory_item_id: line.inventory_item_id,
          quantity_to_buy: Math.max(1, toNumber(line.quantity_to_buy, 1)),
          purchase_price: Math.max(0, money(line.purchase_price)),
          tax_applies: mergedTotals.tax_applies,
          tax_rate: mergedTotals.tax_rate,
          line_subtotal: mergedTotals.line_subtotal,
          line_tax: mergedTotals.line_tax,
          line_total: mergedTotals.line_total,
        });

        if (insertMergedError) {
          throw new Error(`Failed to insert merged line: ${insertMergedError.message}`);
        }
      }
    }

    const { error: clearLegacyLinesError } = await supabase.from(SESSION_ITEMS_TABLE).delete().eq("session_id", legacySession.id);
    if (clearLegacyLinesError) {
      throw new Error(`Failed to clear legacy cart lines: ${clearLegacyLinesError.message}`);
    }

    const { error: closeLegacySessionError } = await supabase
      .from(SESSIONS_TABLE)
      .update({ status: "cancelled", confirmed_at: new Date().toISOString() })
      .eq("id", legacySession.id);
    if (closeLegacySessionError) {
      throw new Error(`Failed to close legacy session: ${closeLegacySessionError.message}`);
    }
  }
}

export async function getOrCreateOpenSession(scope = HOUSEHOLD_SCOPE) {
  const normalizedScope = (scope || HOUSEHOLD_SCOPE).toString().trim().toLowerCase() || HOUSEHOLD_SCOPE;
  const supabase = getClient();
  const { data, error } = await supabase
    .from(SESSIONS_TABLE)
    .select("*")
    .eq("scope", normalizedScope)
    .eq("status", "open")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch open shopping session: ${error.message}`);
  }

  if (data) {
    if (normalizedScope === HOUSEHOLD_SCOPE) {
      await mergeLegacyOpenSessionsIntoHousehold(data.id);
    }
    return normalizeSession(data);
  }

  const insertPayload = {
    id: createId("SHOP"),
    scope: normalizedScope,
    status: "open",
  };

  const { data: created, error: createError } = await supabase.from(SESSIONS_TABLE).insert(insertPayload).select("*").single();

  if (createError) {
    throw new Error(`Failed to create shopping session: ${createError.message}`);
  }

  if (normalizedScope === HOUSEHOLD_SCOPE) {
    await mergeLegacyOpenSessionsIntoHousehold(created.id);
  }

  return normalizeSession(created);
}

export async function getCatalogByScope(scope, filters = {}) {
  const { scope: normalizedScope, subcategories } = getScopeConfig(scope);
  const supabase = getClient();
  const { data, error } = await supabase
    .from(INVENTORY_TABLE)
    .select("id, alias, nombre, subcategoria, cantidad_actual, cantidad_minima, unidad, thumbnail_url, categoria_principal")
    .eq("categoria_principal", normalizedScope)
    .order("subcategoria", { ascending: true })
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch ${normalizedScope} catalog: ${error.message}`);
  }

  const filtered = filterItems(data || [], filters, subcategories);

  if (normalizedScope === "casa") {
    return sortHouseItemsForShopping(filtered);
  }

  return filtered;
}

export async function getSessionCart(sessionId) {
  const supabase = getClient();
  const { data, error } = await supabase
    .from(SESSION_ITEMS_TABLE)
    .select(
      "id, session_id, inventory_item_id, quantity_to_buy, purchase_price, tax_applies, tax_rate, line_subtotal, line_tax, line_total, created_at, updated_at, inventory_item:inventory_items(id, alias, nombre, subcategoria, categoria_principal, cantidad_actual, unidad, thumbnail_url)"
    )
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch cart lines: ${error.message}`);
  }

  const lines = (data || []).map(normalizeCartLine);
  return buildCartSummary(lines);
}

async function getSessionScope(sessionId) {
  const supabase = getClient();
  const { data, error } = await supabase.from(SESSIONS_TABLE).select("id, scope, status").eq("id", sessionId).maybeSingle();

  if (error) {
    throw new Error(`Failed to resolve shopping session: ${error.message}`);
  }

  if (!data) {
    throw new Error("Shopping session not found.");
  }

  return data;
}

export async function upsertCartLine({ sessionId, inventoryItemId, quantityToBuy, purchasePrice, taxApplies }) {
  const quantity = Math.max(1, Math.floor(toNumber(quantityToBuy, 1)));
  const price = Math.max(0, money(purchasePrice));
  const lineTotals = calculateLineTotals({
    quantity,
    price,
    taxApplies: Boolean(taxApplies),
    taxRate: DEFAULT_TAX_RATE,
  });
  const supabase = getClient();

  const session = await getSessionScope(sessionId);
  if (session.status !== "open") {
    throw new Error("Shopping session is not open.");
  }

  const { data: item, error: itemError } = await supabase
    .from(INVENTORY_TABLE)
    .select("id, categoria_principal")
    .eq("id", inventoryItemId)
    .maybeSingle();

  if (itemError) {
    throw new Error(`Failed to validate inventory item: ${itemError.message}`);
  }

  if (!item) {
    throw new Error("Inventory item not found.");
  }

  const itemCategory = (item.categoria_principal || "").toString().toLowerCase();
  if (!["comida", "casa"].includes(itemCategory)) {
    throw new Error("Only comida/casa items are supported in household shopping.");
  }

  if (session.scope !== HOUSEHOLD_SCOPE) {
    throw new Error("Shopping session must use unified household scope.");
  }

  const { data: existing, error: existingError } = await supabase
    .from(SESSION_ITEMS_TABLE)
    .select("id")
    .eq("session_id", sessionId)
    .eq("inventory_item_id", inventoryItemId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to check cart line: ${existingError.message}`);
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from(SESSION_ITEMS_TABLE)
      .update({
        quantity_to_buy: quantity,
        purchase_price: price,
        tax_applies: lineTotals.tax_applies,
        tax_rate: lineTotals.tax_rate,
        line_subtotal: lineTotals.line_subtotal,
        line_tax: lineTotals.line_tax,
        line_total: lineTotals.line_total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`Failed to update cart line: ${updateError.message}`);
    }
  } else {
    const { error: insertError } = await supabase.from(SESSION_ITEMS_TABLE).insert({
      id: createId("LINE"),
      session_id: sessionId,
      inventory_item_id: inventoryItemId,
      quantity_to_buy: quantity,
      purchase_price: price,
      tax_applies: lineTotals.tax_applies,
      tax_rate: lineTotals.tax_rate,
      line_subtotal: lineTotals.line_subtotal,
      line_tax: lineTotals.line_tax,
      line_total: lineTotals.line_total,
    });

    if (insertError) {
      throw new Error(`Failed to add item to cart: ${insertError.message}`);
    }
  }
}

export async function removeCartLine({ sessionId, inventoryItemId }) {
  const supabase = getClient();
  const { error } = await supabase.from(SESSION_ITEMS_TABLE).delete().eq("session_id", sessionId).eq("inventory_item_id", inventoryItemId);

  if (error) {
    throw new Error(`Failed to remove cart line: ${error.message}`);
  }
}

export async function confirmPurchase(sessionId) {
  const session = await getSessionScope(sessionId);
  if (session.scope !== HOUSEHOLD_SCOPE) {
    throw new Error(`Session scope mismatch. Expected ${HOUSEHOLD_SCOPE}, received ${session.scope}.`);
  }

  const supabase = getClient();
  const { data: linesRaw, error: linesError } = await supabase
    .from(SESSION_ITEMS_TABLE)
    .select("id, inventory_item_id, quantity_to_buy, purchase_price, tax_applies, tax_rate, line_subtotal, line_tax, line_total, inventory_item:inventory_items(id, alias, nombre, subcategoria, categoria_principal, cantidad_actual)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (linesError) {
    throw new Error(`Failed to load purchase lines: ${linesError.message}`);
  }

  const lines = (linesRaw || []).map(normalizeCartLine);

  if (lines.length === 0) {
    throw new Error("No hay items en el carrito para confirmar.");
  }

  const touchedItemIds = [];

  for (const line of lines) {
    if (!line.item) {
      throw new Error(`Item ${line.inventory_item_id} no encontrado.`);
    }

    if (!["comida", "casa"].includes((line.item.categoria_principal || "").toString().toLowerCase())) {
      throw new Error(`Item ${line.inventory_item_id} no pertenece al scope de compras del hogar.`);
    }

    const current = typeof line.item.cantidad_actual === "number" ? line.item.cantidad_actual : 0;
    const nextQty = current + line.quantity_to_buy;

    const { error: updateError } = await supabase
      .from(INVENTORY_TABLE)
      .update({
        cantidad_actual: nextQty,
        updated_at: new Date().toISOString(),
      })
      .eq("id", line.inventory_item_id);

    if (updateError) {
      throw new Error(`Failed to update inventory for ${line.inventory_item_id}: ${updateError.message}`);
    }

    touchedItemIds.push(line.inventory_item_id);
  }

  const subtotalAmount = money(lines.reduce((sum, line) => sum + line.line_subtotal, 0));
  const taxTotal = money(lines.reduce((sum, line) => sum + line.line_tax, 0));
  const grandTotal = money(lines.reduce((sum, line) => sum + line.line_total, 0));
  const receiptId = createId("RCP");

  const { error: receiptError } = await supabase.from(RECEIPTS_TABLE).insert({
    id: receiptId,
    session_id: sessionId,
    subtotal_amount: subtotalAmount,
    tax_total: taxTotal,
    grand_total: grandTotal,
    total_amount: grandTotal,
    line_count: lines.length,
  });

  if (receiptError) {
    throw new Error(`Failed to create receipt: ${receiptError.message}`);
  }

  const receiptLinesPayload = lines.map((line) => ({
    id: createId("RLINE"),
    receipt_id: receiptId,
    inventory_item_id: line.inventory_item_id,
    item_nombre: line.item?.nombre || line.inventory_item_id,
    item_alias: line.item?.alias || "",
    categoria_principal: line.item?.categoria_principal || inferCategoryFromSubcategory(line.item?.subcategoria) || null,
    subcategoria: line.item?.subcategoria || null,
    quantity_purchased: line.quantity_to_buy,
    purchase_price: line.purchase_price,
    tax_applies: line.tax_applies,
    tax_rate: line.tax_rate,
    line_subtotal: line.line_subtotal,
    line_tax: line.line_tax,
    line_total: line.line_total,
  }));

  const { error: receiptLinesError } = await supabase.from(RECEIPT_ITEMS_TABLE).insert(receiptLinesPayload);

  if (receiptLinesError) {
    throw new Error(`Failed to create receipt lines: ${receiptLinesError.message}`);
  }

  const { error: sessionUpdateError } = await supabase
    .from(SESSIONS_TABLE)
    .update({
      status: "confirmed",
      receipt_id: receiptId,
      subtotal_amount: subtotalAmount,
      tax_total: taxTotal,
      grand_total: grandTotal,
      total_amount: grandTotal,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (sessionUpdateError) {
    throw new Error(`Failed to close shopping session: ${sessionUpdateError.message}`);
  }

  const { error: clearError } = await supabase.from(SESSION_ITEMS_TABLE).delete().eq("session_id", sessionId);

  if (clearError) {
    throw new Error(`Failed to clear cart lines: ${clearError.message}`);
  }

  return { receiptId, touchedItemIds };
}

export async function getReceiptById(receiptId) {
  const supabase = getClient();
  const { data: receipt, error: receiptError } = await supabase
    .from(RECEIPTS_TABLE)
    .select("*, session:purchase_sessions(scope)")
    .eq("id", receiptId)
    .maybeSingle();

  if (receiptError) {
    throw new Error(`Failed to fetch receipt: ${receiptError.message}`);
  }

  if (!receipt) {
    return null;
  }

  const { data: linesRaw, error: linesError } = await supabase
    .from(RECEIPT_ITEMS_TABLE)
    .select("*")
    .eq("receipt_id", receiptId)
    .order("created_at", { ascending: true });

  if (linesError) {
    throw new Error(`Failed to fetch receipt lines: ${linesError.message}`);
  }

  const lines = (linesRaw || []).map((line) => {
    const lineSubtotal = money(line.line_subtotal);
    const taxApplies = toBoolean(line.tax_applies);
    const taxRate = taxApplies ? money(line.tax_rate || DEFAULT_TAX_RATE) : 0;
    const lineTax = line.line_tax !== undefined && line.line_tax !== null ? money(line.line_tax) : taxApplies ? money(lineSubtotal * taxRate) : 0;
    const lineTotal = line.line_total !== undefined && line.line_total !== null ? money(line.line_total) : money(lineSubtotal + lineTax);

    return {
      id: line.id,
      inventory_item_id: line.inventory_item_id,
      item_nombre: line.item_nombre,
      item_alias: line.item_alias,
      categoria_principal: line.categoria_principal || inferCategoryFromSubcategory(line.subcategoria),
      subcategoria: line.subcategoria,
      quantity_purchased: toNumber(line.quantity_purchased),
      purchase_price: money(line.purchase_price),
      tax_applies: taxApplies,
      tax_rate: taxRate,
      line_subtotal: lineSubtotal,
      line_tax: lineTax,
      line_total: lineTotal,
    };
  });

  return {
    id: receipt.id,
    scope: receipt.session?.scope || null,
    created_at: receipt.created_at,
    subtotal_amount: money(receipt.subtotal_amount),
    tax_total: money(receipt.tax_total),
    grand_total: money(receipt.grand_total || receipt.total_amount),
    total_amount: money(receipt.total_amount || receipt.grand_total),
    line_count: toNumber(receipt.line_count),
    lines,
  };
}

export async function getPurchaseHistory(filters = {}) {
  const supabase = getClient();
  const historyFilters = normalizeHistoryFilters(filters);

  const { data: receiptsRaw, error: receiptsError } = await supabase
    .from(RECEIPTS_TABLE)
    .select("id, created_at, subtotal_amount, tax_total, grand_total, total_amount, line_count, session:purchase_sessions(scope)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (receiptsError) {
    throw new Error(`Failed to fetch purchase history: ${receiptsError.message}`);
  }

  const receipts = (receiptsRaw || []).map((receipt) => ({
    id: receipt.id,
    created_at: receipt.created_at,
    scope: receipt.session?.scope || null,
    subtotal_amount: money(receipt.subtotal_amount),
    tax_total: money(receipt.tax_total),
    grand_total: money(receipt.grand_total || receipt.total_amount),
    total_amount: money(receipt.total_amount || receipt.grand_total),
    line_count: toNumber(receipt.line_count),
  }));

  if (receipts.length === 0) {
    return [];
  }

  const receiptIds = receipts.map((receipt) => receipt.id);
  const { data: linesRaw, error: linesError } = await supabase
    .from(RECEIPT_ITEMS_TABLE)
    .select("receipt_id, item_nombre, categoria_principal, subcategoria, quantity_purchased, line_total")
    .in("receipt_id", receiptIds);

  if (linesError) {
    throw new Error(`Failed to fetch history lines: ${linesError.message}`);
  }

  const linesByReceipt = new Map();
  (linesRaw || []).forEach((line) => {
    const list = linesByReceipt.get(line.receipt_id) || [];
    list.push(line);
    linesByReceipt.set(line.receipt_id, list);
  });

  return receipts
    .map((receipt) => {
      const lines = linesByReceipt.get(receipt.id) || [];
      const zones = [...new Set(lines.map((line) => line.subcategoria).filter(Boolean))];
      const categories = [...new Set(lines.map((line) => line.categoria_principal || inferCategoryFromSubcategory(line.subcategoria)).filter(Boolean))];
      const itemNames = lines.map((line) => (line.item_nombre || "").toString().trim()).filter(Boolean);
      const totalUnits = lines.reduce((sum, line) => sum + toNumber(line.quantity_purchased), 0);
      const spendByCategory = lines.reduce((acc, line) => {
        const categoryKey = line.categoria_principal || inferCategoryFromSubcategory(line.subcategoria) || "otros";
        acc[categoryKey] = money((acc[categoryKey] || 0) + toNumber(line.line_total, 0));
        return acc;
      }, {});
      const searchable = `${receipt.id} ${receipt.scope || ""} ${itemNames.join(" ")}`.toLowerCase();

      return {
        ...receipt,
        zones,
        categories,
        spend_by_category: spendByCategory,
        key_items: itemNames.slice(0, 3),
        total_units: totalUnits,
        searchable,
      };
    })
    .filter((entry) => {
      if (historyFilters.scope && entry.scope !== historyFilters.scope) {
        return false;
      }

      if (historyFilters.subcategoria && !entry.zones.includes(historyFilters.subcategoria)) {
        return false;
      }

      if (historyFilters.categoria && !entry.categories.includes(historyFilters.categoria)) {
        return false;
      }

      if (historyFilters.search && !entry.searchable.includes(historyFilters.search)) {
        return false;
      }

      return true;
    });
}

export async function getPurchaseHistoryCalendar(month, filters = {}) {
  const normalizedMonth = /^\d{4}-\d{2}$/.test((month || "").toString()) ? month : null;
  const historyFilters = normalizeHistoryFilters(filters);
  const supabase = getClient();
  let receiptQuery = supabase
    .from(RECEIPTS_TABLE)
    .select("id, created_at, subtotal_amount, tax_total, grand_total, total_amount, line_count, session:purchase_sessions(scope)")
    .order("created_at", { ascending: false })
    .limit(300);

  if (normalizedMonth) {
    const start = `${normalizedMonth}-01T00:00:00.000Z`;
    const next = new Date(`${normalizedMonth}-01T00:00:00.000Z`);
    next.setUTCMonth(next.getUTCMonth() + 1);
    const end = next.toISOString();
    receiptQuery = receiptQuery.gte("created_at", start).lt("created_at", end);
  }

  const { data: receiptsRaw, error: receiptsError } = await receiptQuery;

  if (receiptsError) {
    throw new Error(`Failed to fetch calendar receipts: ${receiptsError.message}`);
  }

  const receipts = (receiptsRaw || [])
    .map((receipt) => ({
      id: receipt.id,
      created_at: receipt.created_at,
      scope: receipt.session?.scope || null,
      subtotal_amount: money(receipt.subtotal_amount),
      tax_total: money(receipt.tax_total),
      grand_total: money(receipt.grand_total || receipt.total_amount),
      total_amount: money(receipt.total_amount || receipt.grand_total),
      line_count: toNumber(receipt.line_count),
    }))
    .filter((receipt) => (historyFilters.scope ? receipt.scope === historyFilters.scope : true));

  if (receipts.length === 0) {
    return {
      receipts: [],
      days: [],
    };
  }

  const receiptIds = receipts.map((receipt) => receipt.id);
  const { data: linesRaw, error: linesError } = await supabase
    .from(RECEIPT_ITEMS_TABLE)
    .select("receipt_id, categoria_principal, subcategoria, quantity_purchased, line_total")
    .in("receipt_id", receiptIds);

  if (linesError) {
    throw new Error(`Failed to fetch calendar receipt lines: ${linesError.message}`);
  }

  const linesByReceipt = new Map();
  (linesRaw || []).forEach((line) => {
    const list = linesByReceipt.get(line.receipt_id) || [];
    list.push({
      subcategoria: line.subcategoria,
      quantity_purchased: toNumber(line.quantity_purchased),
      line_total: money(line.line_total),
    });
    linesByReceipt.set(line.receipt_id, list);
  });

  const mappedReceipts = receipts.map((receipt) => {
    const lines = linesByReceipt.get(receipt.id) || [];
    const zoneSummary = {};
    const categorySummary = {};

    lines.forEach((line) => {
      const zoneKey = line.subcategoria || "sin-zona";
      const categoryKey = line.categoria_principal || inferCategoryFromSubcategory(line.subcategoria) || "otros";
      if (!zoneSummary[zoneKey]) {
        zoneSummary[zoneKey] = {
          units: 0,
          amount: 0,
        };
      }
      if (!categorySummary[categoryKey]) {
        categorySummary[categoryKey] = {
          units: 0,
          amount: 0,
        };
      }
      zoneSummary[zoneKey].units += line.quantity_purchased;
      zoneSummary[zoneKey].amount = money(zoneSummary[zoneKey].amount + line.line_total);
      categorySummary[categoryKey].units += line.quantity_purchased;
      categorySummary[categoryKey].amount = money(categorySummary[categoryKey].amount + line.line_total);
    });

    return {
      ...receipt,
      date_key: receipt.created_at ? receipt.created_at.slice(0, 10) : "",
      zone_summary: zoneSummary,
      category_summary: categorySummary,
    };
  });

  const categoryFilteredReceipts = historyFilters.categoria
    ? mappedReceipts.filter((receipt) => Object.prototype.hasOwnProperty.call(receipt.category_summary || {}, historyFilters.categoria))
    : mappedReceipts;

  const daysMap = new Map();
  categoryFilteredReceipts.forEach((receipt) => {
    const key = normalizeCalendarDate(receipt.date_key);
    if (!key) {
      return;
    }

    const current = daysMap.get(key) || {
      date_key: key,
      receipt_count: 0,
      total_amount: 0,
      total_units: 0,
      zone_summary: {},
      category_summary: {},
    };

    current.receipt_count += 1;
    current.total_amount = money(current.total_amount + (receipt.grand_total || receipt.total_amount));
    Object.entries(receipt.zone_summary || {}).forEach(([zoneKey, zone]) => {
      if (!current.zone_summary[zoneKey]) {
        current.zone_summary[zoneKey] = { units: 0, amount: 0 };
      }
      current.zone_summary[zoneKey].units += zone.units;
      current.zone_summary[zoneKey].amount = money(current.zone_summary[zoneKey].amount + zone.amount);
      current.total_units += zone.units;
    });

    Object.entries(receipt.category_summary || {}).forEach(([categoryKey, category]) => {
      if (!current.category_summary[categoryKey]) {
        current.category_summary[categoryKey] = { units: 0, amount: 0 };
      }
      current.category_summary[categoryKey].units += category.units;
      current.category_summary[categoryKey].amount = money(current.category_summary[categoryKey].amount + category.amount);
    });

    daysMap.set(key, current);
  });

  return {
    receipts: categoryFilteredReceipts,
    days: Array.from(daysMap.values()).sort((a, b) => a.date_key.localeCompare(b.date_key)),
  };
}

export async function getFoodPurchaseSignals(daysBack = 120) {
  const supabase = getClient();
  const safeDays = Math.max(7, Math.min(365, Math.floor(toNumber(daysBack, 120))));
  const since = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: receiptsRaw, error: receiptsError } = await supabase
    .from(RECEIPTS_TABLE)
    .select("id, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);

  if (receiptsError) {
    throw new Error(`Failed to fetch receipts for purchase signals: ${receiptsError.message}`);
  }

  const receipts = receiptsRaw || [];
  if (receipts.length === 0) {
    return {
      days_back: safeDays,
      total_receipts: 0,
      items: [],
    };
  }

  const receiptDateById = new Map(receipts.map((receipt) => [receipt.id, receipt.created_at]));
  const receiptIds = receipts.map((receipt) => receipt.id);

  const { data: linesRaw, error: linesError } = await supabase
    .from(RECEIPT_ITEMS_TABLE)
    .select("receipt_id, inventory_item_id, item_nombre, categoria_principal, subcategoria, quantity_purchased")
    .in("receipt_id", receiptIds);

  if (linesError) {
    throw new Error(`Failed to fetch receipt lines for purchase signals: ${linesError.message}`);
  }

  const grouped = new Map();
  for (const line of linesRaw || []) {
    const category = (line.categoria_principal || inferCategoryFromSubcategory(line.subcategoria) || "").toString().toLowerCase();
    if (category !== "comida") {
      continue;
    }

    const key = (line.inventory_item_id || "").toString().trim();
    if (!key) {
      continue;
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        item_id: key,
        item_name: (line.item_nombre || "").toString().trim(),
        subcategoria: (line.subcategoria || "").toString().trim().toLowerCase() || null,
        purchase_events: 0,
        units_purchased: 0,
        last_purchased_at: null,
      });
    }

    const entry = grouped.get(key);
    entry.purchase_events += 1;
    entry.units_purchased += Math.max(0, toNumber(line.quantity_purchased, 0));
    const purchasedAt = receiptDateById.get(line.receipt_id) || null;
    if (purchasedAt && (!entry.last_purchased_at || purchasedAt > entry.last_purchased_at)) {
      entry.last_purchased_at = purchasedAt;
    }
  }

  const items = Array.from(grouped.values()).sort(
    (a, b) =>
      b.purchase_events - a.purchase_events ||
      b.units_purchased - a.units_purchased ||
      (a.item_name || "").localeCompare(b.item_name || "", "es")
  );

  return {
    days_back: safeDays,
    total_receipts: receipts.length,
    items,
  };
}

export async function getOpenCartBadgeCounts() {
  const supabase = getClient();
  const session = await getOrCreateOpenHouseholdSession();
  const { data: lines, error: linesError } = await supabase
    .from(SESSION_ITEMS_TABLE)
    .select("session_id, inventory_item:inventory_items(categoria_principal)")
    .eq("session_id", session.id);

  if (linesError) {
    throw new Error(`Failed to fetch open cart lines: ${linesError.message}`);
  }

  let comidaLines = 0;
  let casaLines = 0;
  (lines || []).forEach((line) => {
    const category = (line.inventory_item?.categoria_principal || "").toString().toLowerCase();
    if (category === "comida") {
      comidaLines += 1;
    } else if (category === "casa") {
      casaLines += 1;
    }
  });

  return {
    household_session_id: session.id,
    household_lines: comidaLines + casaLines,
    comida_lines: comidaLines,
    casa_lines: casaLines,
    total_lines: comidaLines + casaLines,
  };
}

export async function createRecommendationRun({ mode, inventorySnapshot, generatedList }) {
  const supabase = getClient();
  const safeGeneratedList = sanitizeJsonValue({
    ...generatedList,
    raw_text: typeof generatedList?.raw_text === "string" ? generatedList.raw_text.slice(0, 4000) : "",
  });
  const safeInventorySnapshot = sanitizeJsonValue(inventorySnapshot);
  const payload = {
    id: createId("RECO"),
    mode,
    inventory_snapshot: safeInventorySnapshot,
    generated_list: safeGeneratedList,
  };

  let { data, error } = await supabase.from(RECOMMENDATION_TABLE).insert(payload).select("*").single();

  if (error) {
    const minimalPayload = {
      ...payload,
      generated_list: sanitizeJsonValue({
        mode,
        source: generatedList?.source || "fallback_rules",
        summary: generatedList?.summary || "Recomendacion generada.",
        suggestions: Array.isArray(generatedList?.suggestions) ? generatedList.suggestions : [],
        raw_text: "",
      }),
    };

    const retry = await supabase.from(RECOMMENDATION_TABLE).insert(minimalPayload).select("*").single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    throw new Error(`Failed to save recommendation run: ${error.message}`);
  }

  return data;
}

export async function getRecommendationRunById(id) {
  const supabase = getClient();
  const { data, error } = await supabase.from(RECOMMENDATION_TABLE).select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch recommendation run: ${error.message}`);
  }

  return data;
}

export async function getOrCreateOpenHouseholdSession() {
  return getOrCreateOpenSession(HOUSEHOLD_SCOPE);
}

export async function getOrCreateOpenFoodSession() {
  return getOrCreateOpenHouseholdSession();
}

export async function getOrCreateOpenHouseSession() {
  return getOrCreateOpenHouseholdSession();
}

export async function getFoodCatalog(filters = {}) {
  return getCatalogByScope("comida", filters);
}

export async function getHouseCatalog(filters = {}) {
  return getCatalogByScope("casa", filters);
}

export async function confirmUnifiedPurchase(sessionId) {
  return confirmPurchase(sessionId);
}

export async function confirmFoodPurchase(sessionId) {
  return confirmUnifiedPurchase(sessionId);
}

export async function confirmHousePurchase(sessionId) {
  return confirmUnifiedPurchase(sessionId);
}
