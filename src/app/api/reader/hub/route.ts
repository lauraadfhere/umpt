import { buildReaderActivityStats, getCommentsForReader } from "@/lib/comments";
import { getReaderSession } from "@/lib/reader-auth";

export async function GET() {
  const session = await getReaderSession();
  if (!session) return Response.json({ error: "Sign in with your reader email first." }, { status: 401 });
  try {
    const comments = await getCommentsForReader(session.email);
    const stats = buildReaderActivityStats(comments);
    return Response.json({ session, comments, stats }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load your reader space.";
    return Response.json({ error: message }, { status: 503 });
  }
}