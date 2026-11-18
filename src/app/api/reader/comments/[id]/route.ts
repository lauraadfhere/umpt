import { prepareCommentMessage, updateReaderPendingComment, withdrawReaderComment } from "@/lib/comments";
import { getReaderSession } from "@/lib/reader-auth";

const MAX_COMMENT_LENGTH = 2_000;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getReaderSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawMessage = typeof body.message === "string" ? body.message.trim() : "";
  const { html: message, text } = prepareCommentMessage(rawMessage);
  if (!text || message.length > MAX_COMMENT_LENGTH) {
    return Response.json({ error: "Enter an answer within the allowed length." }, { status: 400 });
  }

  try {
    await updateReaderPendingComment(id, session.email, message);
    return Response.json({ ok: true });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unable to update the comment.";
    return Response.json({ error: messageText }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getReaderSession();
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    await withdrawReaderComment(id, session.email);
    return new Response(null, { status: 204 });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unable to remove the comment.";
    return Response.json({ error: messageText }, { status: 400 });
  }
}