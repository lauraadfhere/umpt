import { createBookReview, getApprovedBookReviews, readReviewInput, summariseReviews } from "@/lib/book-reviews";
import { getReaderSession, normaliseReaderEmail, startReaderSession } from "@/lib/reader-auth";

export async function GET(request: Request) {
  const bookSlug = new URL(request.url).searchParams.get("bookSlug")?.trim() ?? "";
  if (!bookSlug || bookSlug.length > 120) return Response.json({ error: "A book slug is required." }, { status: 400 });
  try {
    const reviews = await getApprovedBookReviews(bookSlug);
    return Response.json({ reviews, summary: summariseReviews(reviews) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load reviews.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = readReviewInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const session = await getReaderSession();
  const emailInput = typeof (body as { email?: unknown }).email === "string" ? String((body as { email: string }).email) : "";
  const email = session?.email ?? normaliseReaderEmail(emailInput);
  if (!email) return Response.json({ error: "Enter your email to leave a review." }, { status: 400 });

  const name = parsed.name || session?.displayName || email.split("@")[0] || "Reader";

  try {
    if (!session) await startReaderSession(email);
    const created = await createBookReview({ ...parsed, name, email });
    return Response.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the review.";
    return Response.json({ error: message }, { status: 503 });
  }
}