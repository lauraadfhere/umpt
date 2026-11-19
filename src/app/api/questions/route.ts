import { createVisitorQuestion, getApprovedQuestions, readQuestionInput } from "@/lib/questions";
import { getReaderSession, normaliseReaderEmail, startReaderSession } from "@/lib/reader-auth";

export async function GET() {
  try {
    const questions = await getApprovedQuestions();
    return Response.json({ questions }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load questions.";
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

  const parsed = readQuestionInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  const session = await getReaderSession();
  const emailInput = typeof (body as { email?: unknown }).email === "string" ? (body as { email: string }).email.trim() : "";
  const email = session?.email ?? normaliseReaderEmail(emailInput);
  if (!email) {
    return Response.json({ error: "Enter your email to ask a question." }, { status: 400 });
  }

  const name =
    parsed.input.askerName ||
    session?.displayName ||
    email.split("@")[0] ||
    "Visitor";

  try {
    if (!session) await startReaderSession(email);
    const result = await createVisitorQuestion({
      ...parsed.input,
      askerName: name,
      askerEmail: email,
    });
    return Response.json({ id: result.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the question.";
    return Response.json({ error: message }, { status: 503 });
  }
}