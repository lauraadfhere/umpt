import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { seedMockCommentsForPosts, seedMockCommentsForSlug } from "@/lib/comments";
import { mockCommentsForPost } from "@/lib/mock-comments";
import { getPosts } from "@/lib/posts";

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  let slug = "";
  try {
    const body = (await request.json().catch(() => ({}))) as { slug?: string };
    slug = typeof body.slug === "string" ? body.slug.trim() : "";
  } catch {
    slug = "";
  }

  try {
    if (slug) {
      const posts = await getPosts("en");
      const post = posts.find((item) => item.slug === slug);
      if (!post) return Response.json({ error: "Post not found." }, { status: 404 });
      const drafts = mockCommentsForPost(post);
      const result = await seedMockCommentsForSlug(post, drafts);
      return Response.json({ ...result, slug, targetTotal: drafts.length });
    }
    const posts = await getPosts("en");
    const result = await seedMockCommentsForPosts(posts, mockCommentsForPost);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to seed comments.";
    return Response.json({ error: message }, { status: 503 });
  }
}