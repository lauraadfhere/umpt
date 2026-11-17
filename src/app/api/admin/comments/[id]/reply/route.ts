import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { createCommentReply, prepareCommentMessage } from "@/lib/comments";

const MAX_COMMENT_LENGTH = 2_000;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  const { id } = await params;
  if (!id) return Response.json({ error: "A comment id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const rawMessage = typeof (body as { message?: unknown })?.message === "string" ? (body as { message: string }).message.trim() : "";
  const { html: message, text } = prepareCommentMessage(rawMessage);
  if (!text || message.length > MAX_COMMENT_LENGTH) {
    return Response.json({ error: "Enter a reply within the allowed length." }, { status: 400 });
  }

  try {
    const reply = await createCommentReply(id, message);
    return Response.json({ reply }, { status: 201 });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "Unable to save the reply.";
    return Response.json({ error: messageText }, { status: 503 });
  }
}
