// Server-only contact inbox against the shared Parse ContactMessage class.
import { config, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";
import { plainToRichHtml, sanitizeRichText } from "@/lib/richtext";

const CLASS = "ContactMessage";
const OBJECT_ID = /^[A-Za-z0-9]{1,64}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  messageHtml: string;
  locale: string | null;
  isHandled: boolean;
  createdAt: string | null;
};

export type ContactInput = {
  name: string;
  email: string;
  subject: string;
  messageHtml: string;
  locale: string | null;
};

function toMessage(record: ParseRecord): ContactMessage {
  return {
    id: record.objectId,
    name: textValue(record.name),
    email: textValue(record.email),
    subject: textValue(record.subject),
    messageHtml: textValue(record.messageHtml) || textValue(record.message),
    locale: textValue(record.locale) || null,
    isHandled: record.isHandled === true,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : null,
  };
}

export function readContactInput(body: unknown): { input: ContactInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const subject = typeof raw.subject === "string" ? raw.subject.trim() : "";
  const messageRaw = typeof raw.message === "string" ? raw.message.trim() : "";
  const locale = typeof raw.locale === "string" ? raw.locale.trim().slice(0, 8) : "";

  if (!name || name.length > 80) return { error: "Enter a name of up to 80 characters." };
  if (!email || email.length > 120 || !EMAIL.test(email)) return { error: "Enter a valid email address." };
  if (!subject || subject.length > 160) return { error: "Enter a subject of up to 160 characters." };
  if (!messageRaw || messageRaw.length > 4_000) return { error: "Enter a message of up to 4,000 characters." };

  const { html: messageHtml, text } = /<[a-z]/i.test(messageRaw)
    ? sanitizeRichText(messageRaw)
    : { html: plainToRichHtml(messageRaw), text: messageRaw };
  if (!text) return { error: "Enter a message." };

  return {
    input: {
      name,
      email,
      subject,
      messageHtml,
      locale: locale || null,
    },
  };
}

export async function createContactMessage(input: ContactInput): Promise<{ id: string }> {
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      subject: input.subject,
      messageHtml: input.messageHtml,
      message: input.messageHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(),
      locale: input.locale,
      isHandled: false,
      status: "pending",
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || `Parse returned ${response.status}.`);
  return { id: body.objectId };
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const { url } = config();
  const parameters = new URLSearchParams({ order: "-createdAt", limit: "200" });
  const response = await fetch(`${url}/classes/${CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return (body.results ?? []).map(toMessage);
}

export async function setContactHandled(id: string, isHandled: boolean) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid message id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ isHandled }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}

export async function deleteContactMessage(id: string) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid message id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}/${id}`, {
    method: "DELETE",
    headers: writeHeaders(),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}
