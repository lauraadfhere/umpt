import { getReaderSession, startReaderSession, endReaderSession } from "@/lib/reader-auth";

export async function GET() {
  const session = await getReaderSession();
  return Response.json({ session }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email : "";
  try {
    const session = await startReaderSession(email);
    return Response.json({ session }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to sign in.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE() {
  await endReaderSession();
  return new Response(null, { status: 204 });
}