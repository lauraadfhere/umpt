import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { getHomePostsAccentSettings, saveHomePostsAccentSettings } from "@/lib/home-posts-accent";
import { normaliseHomePostsAccentSettings } from "@/lib/home-posts-accent-config";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json(await getHomePostsAccentSettings());
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!body || typeof body !== "object") return Response.json({ error: "Invalid request body." }, { status: 400 });

  const parsed = normaliseHomePostsAccentSettings(body as Record<string, unknown>);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    return Response.json(await saveHomePostsAccentSettings(parsed));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save home settings.";
    return Response.json({ error: message }, { status: 503 });
  }
}