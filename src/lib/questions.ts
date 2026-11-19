// Server-only visitor Q&A stored in Parse (class VisitorQuestion).
import { config, query, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";
import { plainToRichHtml, richTextToPlain, sanitizeRichText } from "@/lib/richtext";

const CLASS = "VisitorQuestion";
const OBJECT_ID = /^[A-Za-z0-9]{1,64}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type VisitorQuestion = {
  id: string;
  title: string;
  bodyHtml: string;
  excerpt: string;
  askerName: string;
  askerEmail: string;
  locale: string | null;
  answerCount: number;
  createdAt: string | null;
};

export type ModeratedQuestion = VisitorQuestion & { isApproved: boolean };

export type QuestionInput = {
  title: string;
  bodyHtml: string;
  askerName: string;
  askerEmail: string;
  locale: string | null;
};

function dateValue(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && typeof (value as { iso?: unknown }).iso === "string") return (value as { iso: string }).iso;
  return null;
}

function countValue(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

export function prepareQuestionBody(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return { html: "", text: "" };
  return /<[a-z]/i.test(trimmed) ? sanitizeRichText(trimmed) : { html: plainToRichHtml(trimmed), text: trimmed };
}

export function readQuestionInput(body: unknown): { input: QuestionInput } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const bodyRaw = typeof raw.body === "string" ? raw.body.trim() : "";
  const askerName = typeof raw.name === "string" ? raw.name.trim() : "";
  const askerEmail = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
  const locale = typeof raw.locale === "string" ? raw.locale.trim().slice(0, 8) : "";

  if (!title || title.length > 200) return { error: "Enter a title of up to 200 characters." };
  if (!askerName || askerName.length > 80) return { error: "Enter a name of up to 80 characters." };
  if (!askerEmail || askerEmail.length > 120 || !EMAIL.test(askerEmail)) return { error: "Enter a valid email address." };

  const { html: bodyHtml, text } = prepareQuestionBody(bodyRaw);
  if (!text || bodyHtml.length > 12_000) return { error: "Enter a question body within the allowed length." };

  return {
    input: {
      title,
      bodyHtml,
      askerName,
      askerEmail,
      locale: locale || null,
    },
  };
}

function excerptFromHtml(html: string, max = 220) {
  const plain = richTextToPlain(sanitizeRichText(html)) || html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 40)).replace(/[\s,;:.–-]+$/, "")}…`;
}

function toQuestion(record: ParseRecord): VisitorQuestion {
  const bodyHtml = textValue(record.bodyHtml) || textValue(record.body);
  return {
    id: record.objectId,
    title: textValue(record.title),
    bodyHtml,
    excerpt: textValue(record.excerpt) || excerptFromHtml(bodyHtml),
    askerName: textValue(record.askerName) || textValue(record.userName),
    askerEmail: textValue(record.askerEmail),
    locale: textValue(record.locale) || null,
    answerCount: countValue(record.answerCount),
    createdAt: dateValue(record.createdAt),
  };
}

export async function getApprovedQuestions(limit = 80): Promise<VisitorQuestion[]> {
  const parameters = new URLSearchParams({
    where: JSON.stringify({ $and: [{ isApproved: true }, { isDeleted: { $ne: true } }] }),
    order: "-createdAt",
    limit: String(limit),
  });
  const records = await query(CLASS, parameters);
  return records.map(toQuestion);
}

export async function getApprovedQuestion(id: string): Promise<VisitorQuestion | null> {
  if (!OBJECT_ID.test(id)) return null;
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}/${id}`, { headers: writeHeaders(), cache: "no-store" });
  const record = (await response.json().catch(() => ({}))) as ParseRecord;
  if (!response.ok || record.isApproved !== true || record.isDeleted === true) return null;
  return toQuestion(record);
}

export async function createVisitorQuestion(input: QuestionInput): Promise<{ id: string }> {
  const { url } = config();
  const plain = richTextToPlain(sanitizeRichText(input.bodyHtml));
  const response = await fetch(`${url}/classes/${CLASS}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({
      title: input.title,
      bodyHtml: input.bodyHtml,
      bodyPlain: plain,
      excerpt: excerptFromHtml(input.bodyHtml),
      askerName: input.askerName,
      askerEmail: input.askerEmail,
      locale: input.locale,
      isApproved: false,
      isDeleted: false,
      answerCount: 0,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || "Unable to save the question.");
  return { id: body.objectId };
}

async function adminQuery(parameters: URLSearchParams): Promise<ParseRecord[]> {
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

export async function getQuestionsForModeration(): Promise<ModeratedQuestion[]> {
  const records = await adminQuery(
    new URLSearchParams({ where: JSON.stringify({ isDeleted: { $ne: true } }), order: "-createdAt", limit: "200" }),
  );
  return records.map((record) => ({
    ...toQuestion(record),
    isApproved: record.isApproved === true,
  }));
}

export async function setQuestionApproval(id: string, isApproved: boolean) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid question id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ isApproved }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}

export async function deleteQuestion(id: string) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid question id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${CLASS}/${id}`, {
    method: "PUT",
    headers: writeHeaders(),
    body: JSON.stringify({ isDeleted: true }),
    cache: "no-store",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Parse returned ${response.status}.`);
  }
}