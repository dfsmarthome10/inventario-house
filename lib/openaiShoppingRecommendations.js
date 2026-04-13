import "server-only";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const MODES = ["compra_completa", "compra_budget", "compra_encargos"];
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

function assertApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY. Add it to server environment variables.");
  }

  return apiKey;
}

function getModeGuidance(mode) {
  if (mode === "compra_budget") {
    return "Prioriza costo-eficiencia: enfocate primero en productos por debajo de minimo y evita sobrecompra.";
  }

  if (mode === "compra_encargos") {
    return "Lista minima y esencial: recomienda solo lo imprescindible para funcionamiento basico del hogar.";
  }

  return "Restock amplio y sensato: recupera inventario a niveles practicos sin sobrecomprar.";
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const output = Array.isArray(payload?.output) ? payload.output : [];
  const textParts = [];

  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") {
        textParts.push(part.text);
      }
    }
  }

  return textParts.join("\n").trim();
}

function normalizeCatalogEntry(item) {
  return {
    id: item.id,
    nombre: item.nombre,
    subcategoria: item.subcategoria,
    cantidad_actual: item.cantidad_actual,
    cantidad_minima: item.cantidad_minima,
    unidad: item.unidad,
  };
}

function normalizeSuggestion(raw, catalog) {
  const requestedId = (raw.item_id || "").toString().trim();
  const fallbackName = (raw.item_name || "").toString().trim();
  const suggestedQuantity = Math.max(1, Math.floor(Number(raw.suggested_quantity) || 1));
  const rationale = (raw.rationale || "").toString().trim() || "Sin razon especifica";
  const priority = (raw.priority || "").toString().trim().toLowerCase();
  const allowedPriority = ["alta", "media", "baja"].includes(priority) ? priority : "media";

  let matched = null;
  if (requestedId) {
    matched = catalog.find((item) => item.id === requestedId) || null;
  }
  if (!matched && fallbackName) {
    const normalizedTarget = fallbackName.toLowerCase();
    matched = catalog.find((item) => item.nombre.toLowerCase() === normalizedTarget) || null;
  }

  return {
    item_id: matched?.id || requestedId || null,
    item_name: matched?.nombre || fallbackName || requestedId || "Item",
    subcategoria: matched?.subcategoria || null,
    suggested_quantity: suggestedQuantity,
    rationale,
    priority: allowedPriority,
    can_add_to_cart: Boolean(matched?.id),
  };
}

export async function generateShoppingRecommendation({ mode, catalog }) {
  if (!MODES.includes(mode)) {
    throw new Error("Invalid recommendation mode.");
  }

  const apiKey = assertApiKey();
  const systemInstruction = [
    "Eres un asistente de compras para inventario de hogar.",
    "Debes generar una recomendacion util, corta y practica.",
    "Solo puedes recomendar items presentes en el catalogo dado.",
    "Responde siempre en JSON valido, sin markdown.",
  ].join(" ");

  const modeGuidance = getModeGuidance(mode);
  const model = process.env.OPENAI_RECOMMENDATION_MODEL || DEFAULT_OPENAI_MODEL;
  const catalogInput = catalog.map(normalizeCatalogEntry);

  const userInstruction = [
    `Modo: ${mode}.`,
    modeGuidance,
    "Devuelve un JSON con forma exacta:",
    `{"mode":"${mode}","summary":"...","suggestions":[{"item_id":"ID_EXISTENTE","item_name":"...","suggested_quantity":2,"priority":"alta|media|baja","rationale":"..."}]}`,
    "Las cantidades sugeridas deben ser enteros positivos sensatos.",
    "No incluyas items fuera del catalogo.",
    `Catalogo: ${JSON.stringify(catalogInput)}`,
  ].join("\n");

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemInstruction }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userInstruction }],
        },
      ],
      reasoning: { effort: "low" },
      text: {
        format: {
          type: "json_schema",
          name: "shopping_recommendation",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              mode: { type: "string" },
              summary: { type: "string" },
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    item_id: { type: "string" },
                    item_name: { type: "string" },
                    suggested_quantity: { type: "integer", minimum: 1 },
                    priority: { type: "string", enum: ["alta", "media", "baja"] },
                    rationale: { type: "string" },
                  },
                  required: ["item_id", "item_name", "suggested_quantity", "priority", "rationale"],
                },
              },
            },
            required: ["mode", "summary", "suggestions"],
          },
        },
      },
      max_output_tokens: 900,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error(`OPENAI_AUTH_ERROR: ${errorText}`);
    }
    if (response.status === 429) {
      throw new Error(`OPENAI_QUOTA_ERROR: ${errorText}`);
    }
    throw new Error(`OpenAI recommendation request failed: ${response.status} ${errorText}`);
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);

  if (!outputText) {
    throw new Error("OpenAI returned an empty recommendation response.");
  }

  const parsed = safeJsonParse(outputText);

  if (!parsed || !Array.isArray(parsed.suggestions)) {
    throw new Error("OpenAI response could not be parsed as recommendation JSON.");
  }

  const suggestions = parsed.suggestions.map((entry) => normalizeSuggestion(entry, catalog)).filter((entry) => entry.item_id || entry.item_name);

  return {
    mode,
    summary: (parsed.summary || "").toString().trim() || "Recomendacion generada.",
    suggestions,
    raw_text: outputText,
  };
}
