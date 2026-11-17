// Server-only book reader reviews (Parse class Review).
import { config, textValue, writeHeaders, type ParseRecord } from "@/lib/parse";

const REVIEW_CLASS = "Review";
const OBJECT_ID = /^[A-Za-z0-9]{1,64}$/;

export const MAX_REVIEW_NAME = 80;
export const MAX_REVIEW_TITLE = 120;
export const MAX_REVIEW_BODY = 2_000;

export type BookReview = {
  id: string;
  bookSlug: string;
  name: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string | null;
};

export type ReviewSummary = {
  count: number;
  average: number;
};

function dateValue(value: unknown): string | null {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && typeof (value as { iso?: unknown }).iso === "string") return (value as { iso: string }).iso;
  return null;
}

function ratingValue(value: unknown): number {
  const rating = typeof value === "number" ? value : Number(textValue(value));
  if (!Number.isFinite(rating)) return 0;
  return Math.min(5, Math.max(1, Math.round(rating)));
}

async function queryReviews(where: unknown, order = "-createdAt", limit = 200): Promise<ParseRecord[]> {
  const { url } = config();
  const parameters = new URLSearchParams({ where: JSON.stringify(where), order, limit: String(limit) });
  const response = await fetch(`${url}/classes/${REVIEW_CLASS}?${parameters}`, { headers: writeHeaders(), cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as { results?: ParseRecord[]; error?: string };
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

function toReview(record: ParseRecord): BookReview {
  return {
    id: record.objectId,
    bookSlug: textValue(record.bookSlug),
    name: textValue(record.userName) || textValue(record.author) || "Reader",
    rating: ratingValue(record.rating),
    title: textValue(record.title),
    content: textValue(record.content),
    createdAt: dateValue(record.createdAt),
  };
}

export function summariseReviews(reviews: BookReview[]): ReviewSummary {
  const rated = reviews.filter((review) => review.rating >= 1 && review.rating <= 5);
  const total = rated.reduce((sum, review) => sum + review.rating, 0);
  return {
    count: rated.length,
    average: rated.length ? Math.round((total / rated.length) * 10) / 10 : 0,
  };
}

export async function getApprovedBookReviews(bookSlug: string): Promise<BookReview[]> {
  const records = await queryReviews({
    $and: [{ bookSlug }, { isApproved: true }, { isDeleted: { $ne: true } }, { isAdminReply: { $ne: true } }],
  });
  return records.map(toReview).sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
}

export async function createBookReview(input: {
  bookSlug: string;
  name: string;
  email?: string;
  rating: number;
  title: string;
  content: string;
}) {
  const { url } = config();
  const response = await fetch(`${url}/classes/${REVIEW_CLASS}`, {
    method: "POST",
    headers: writeHeaders(),
    body: JSON.stringify({
      bookSlug: input.bookSlug,
      userName: input.name,
      author: input.name,
      userEmail: input.email,
      rating: input.rating,
      title: input.title,
      content: input.content,
      isApproved: false,
      isDeleted: false,
      isAdminReply: false,
    }),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => ({}))) as { objectId?: string; error?: string };
  if (!response.ok || !body.objectId) throw new Error(body.error || `Parse returned ${response.status}.`);
  return { id: body.objectId };
}

export type ModeratedBookReview = BookReview & { isApproved: boolean };

export async function getBookReviewsForModeration(): Promise<ModeratedBookReview[]> {
  const records = await queryReviews({ isDeleted: { $ne: true }, isAdminReply: { $ne: true } });
  return records.map((record) => ({ ...toReview(record), isApproved: record.isApproved === true }));
}

export async function setBookReviewApproval(id: string, isApproved: boolean) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid review id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${REVIEW_CLASS}/${id}`, {
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

export async function deleteBookReview(id: string) {
  if (!OBJECT_ID.test(id)) throw new Error("Invalid review id.");
  const { url } = config();
  const response = await fetch(`${url}/classes/${REVIEW_CLASS}/${id}`, {
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

export function readReviewInput(body: unknown): { bookSlug: string; name: string; email?: string; rating: number; title: string; content: string } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body." };
  const raw = body as Record<string, unknown>;
  const bookSlug = typeof raw.bookSlug === "string" ? raw.bookSlug.trim() : "";
  const name = typeof raw.name === "string" ? raw.name.trim().slice(0, MAX_REVIEW_NAME) : "";
  const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : undefined;
  const title = typeof raw.title === "string" ? raw.title.trim().slice(0, MAX_REVIEW_TITLE) : "";
  const content = typeof raw.content === "string" ? raw.content.trim().slice(0, MAX_REVIEW_BODY) : "";
  const rating = ratingValue(raw.rating);
  if (!bookSlug || bookSlug.length > 120) return { error: "A book is required." };
  if (!name) return { error: "Enter your name." };
  if (!content) return { error: "Write your review." };
  if (rating < 1) return { error: "Choose a star rating." };
  return { bookSlug, name, email, rating, title, content };
}