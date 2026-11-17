import { revalidateTag } from "next/cache";
import { createAdminPost, getAdminPostRows, getCategories, readPostInput } from "@/lib/admin-posts";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const [posts, categories] = await Promise.all([getAdminPostRows(), getCategories()]);
    return Response.json({ posts, categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load posts.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = readPostInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const created = await createAdminPost(parsed.input);
    revalidateTag("posts", "max");
    return Response.json({ ...created, slug: parsed.input.slug }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the post.";
    return Response.json({ error: message }, { status: 503 });
  }
}
