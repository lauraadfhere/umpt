import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { getSitePage, MANAGED_PAGES, readSitePageInput, saveSitePage, type ManagedPageSlug } from "@/lib/site-pages";

const SLUGS = new Set(MANAGED_PAGES.map((page) => page.slug));

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { slug } = await params;
  if (!SLUGS.has(slug as ManagedPageSlug)) return Response.json({ error: "Unknown page." }, { status: 404 });
  try {
    const page = await getSitePage(slug);
    return Response.json({ page });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load the page.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  const { slug } = await params;
  if (!SLUGS.has(slug as ManagedPageSlug)) return Response.json({ error: "Unknown page." }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = readSitePageInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await saveSitePage(slug as ManagedPageSlug, parsed.input);
    return Response.json({ ok: true, ...saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the page.";
    return Response.json({ error: message }, { status: 503 });
  }
}
