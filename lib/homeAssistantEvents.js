import "server-only";

const DEFAULT_TIMEOUT_MS = 4000;

function hasWebhookConfig() {
  return Boolean(process.env.HOME_ASSISTANT_WEBHOOK_URL);
}

export function getHomeAssistantConfigStatus() {
  return {
    webhook_configured: hasWebhookConfig(),
    has_webhook_token: Boolean(process.env.HOME_ASSISTANT_WEBHOOK_TOKEN),
    has_ingest_secret: Boolean(process.env.HOME_ASSISTANT_INGEST_SECRET),
  };
}

export async function sendHomeAssistantEvent(eventType, payload = {}) {
  const webhookUrl = process.env.HOME_ASSISTANT_WEBHOOK_URL;

  if (!webhookUrl) {
    return { delivered: false, reason: "HOME_ASSISTANT_WEBHOOK_URL not configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  const token = process.env.HOME_ASSISTANT_WEBHOOK_TOKEN;

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        source: "inventory-house",
        event_type: eventType,
        occurred_at: new Date().toISOString(),
        payload,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        delivered: false,
        reason: `home-assistant webhook failed (${response.status}): ${body.slice(0, 300)}`,
      };
    }

    return { delivered: true };
  } catch (error) {
    return {
      delivered: false,
      reason: error instanceof Error ? error.message : "Unknown Home Assistant webhook error",
    };
  } finally {
    clearTimeout(timeout);
  }
}
