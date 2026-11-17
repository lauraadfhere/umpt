import { createComment, getComments, prepareCommentMessage } from "@/lib/comments";
import { getReaderSession, normaliseReaderEmail, startReaderSession } from "@/lib/reader-auth";

const MAX_NAME_LENGTH = 80;
const MAX_COMMENT_LENGTH = 2_000;
const MAX_SLUG_LENGTH = 200;
const OBJECT_ID = /^[A-Za-z0-9]{1,64}$/;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const slug = params.get("slug")?.trim() ?? "";
  const postId = params.get("postId")?.trim() || undefined;
  if (!slug || slug.length > MAX_SLUG_LENGTH) return Response.json({ error: "A post slug is required." }, { status: 400 });
  if (postId && !OBJECT_ID.test(postId)) return Response.json({ error: "Invalid post id." }, { status: 400 });
  try {
    return Response.json({ comments: await getComments({ slug, postId }) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load comments.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let input: { slug?: unknown; postId?: unknown; name?: unknown; email?: unknown; message?: unknown };
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const slug = typeof input.slug === "string" ? input.slug.trim() : "";
  const postId = typeof input.postId === "string" ? input.postId.trim() : undefined;
  if (postId && !OBJECT_ID.test(postId)) return Response.json({ error: "Invalid post id." }, { status: 400 });
  const rawMessage = typeof input.message === "string" ? input.message.trim() : "";
  const { html: message, text } = prepareCommentMessage(rawMessage);
  const session = await getReaderSession();
  const emailInput = typeof input.email === "string" ? input.email.trim() : "";
  const email = session?.email ?? normaliseReaderEmail(emailInput);
  if (!email) {
    return Response.json({ error: "Enter your email to comment. No password is required." }, { status: 400 });
  }
  const name =
    (typeof input.name === "string" && input.name.trim() ? input.name.trim() : null) || session?.displayName || email.split("@")[0] || "Reader";
  if (!slug || !text || name.length > MAX_NAME_LENGTH || message.length > MAX_COMMENT_LENGTH) {
    return Response.json({ error: "Enter a comment within the allowed length." }, { status: 400 });
  }

  try {
    if (!session) await startReaderSession(email);
    const comment = await createComment({ slug, postId, name, email, message });
    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Unable to save comment.";
    return Response.json({ error: err }, { status: 503 });
  }
}
