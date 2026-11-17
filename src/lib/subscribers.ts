// Server-only newsletter / upgrade email list against Parse Subscriber.
import { config, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";

const CLASS = "Subscriber";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscriberInput = {
  email: string;
  locale: string | null;
  source: string;
};

export function readSubscribeInput(body: unknown): { input: SubscriberInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const locale = typeof raw.locale === "string" ? raw.locale.trim().slice(0, 8) : "";
  const source = typeof raw.source === "string" ? raw.source.trim().slice(0, 40) : "subscribe";

  if (!email || email.length > 120 || !EMAIL.test(email)) return { error: "Enter a valid email address." };

  return { input: { email, locale: locale || null, source: source || "subscribe" } };
}

async function findByEmail(email: string): Promise<ParseRecord | null> {
  const { url } = config();
  const parameters = new URLSearchParams({ where: JSON.stringify({ email }), limit: "1" });
  try {
    const response = await fetch(`${url}/classes/${CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
    const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[] };
    if (!response.ok) return null;
    return body.results?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function createSubscriber(input: SubscriberInput): Promise<{ id: string; created: boolean }> {
  const existing = await findByEmail(input.email);
  if (existing) return { id: existing.objectId, created: false };

  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({
      email: input.email,
      locale: input.locale,
      source: input.source,
      status: "active",
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || `Parse returned ${response.status}.`);
  return { id: body.objectId, created: true };
}

export type Subscriber = {
  id: string;
  email: string;
  locale: string | null;
  source: string;
  status: string;
  createdAt: string | null;
};

const OBJECT_ID = /^[A-Za-z0-9]{1,64}$/;

export async function getSubscribers(): Promise<Subscriber[]> {
  const { url } = config();
  const parameters = new URLSearchParams({ order: "-createdAt", limit: "1000" });
  const response = await fetch(`${url}/classes/${CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return (body.results ?? []).map((record) => ({
    id: record.objectId,
    email: textValue(record.email),
    locale: textValue(record.locale) || null,
    source: textValue(record.source) || "subscribe",
    status: textValue(record.status) || "active",
    createdAt: typeof record.createdAt === "string" ? record.createdAt : null,
  }));
}

export async function deleteSubscriber(id: string): Promise<void> {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid subscriber id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}/${id}`, { method: "DELETE", headers: writeHeaders(), cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}
