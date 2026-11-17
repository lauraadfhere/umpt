import { revalidateTag } from "next/cache";
import { deleteAdminPost, getAdminPostById, readPostInput, updateAdminPost } from "@/lib/admin-posts";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

async function guard(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  return null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    const post = await getAdminPostById(id);
    if (!post) return Response.json({ error: "Post not found." }, { status: 404 });
    return Response.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the post.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A post id is required." }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const existingPublishedAt =
    typeof (body as { publishedAt?: unknown })?.publishedAt === "string" ? (body as { publishedAt: string }).publishedAt : null;

  const parsed = readPostInput(body, existingPublishedAt);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    await updateAdminPost(id, parsed.input);
    revalidateTag("posts", "max");
    return Response.json({ ok: true, slug: parsed.input.slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the post.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard(request);
  if (denied) return denied;

  const { id } = await params;
  if (!id) return Response.json({ error: "A post id is required." }, { status: 400 });

  try {
    await deleteAdminPost(id);
    revalidateTag("posts", "max");
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the post.";
    return Response.json({ error: message }, { status: 503 });
  }
}
