import { revalidatePath, revalidateTag } from "next/cache";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { getFaviconSettingsUncached, saveFaviconSettings } from "@/lib/favicon";
import { normaliseFaviconSettings } from "@/lib/favicon-config";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json(await getFaviconSettingsUncached());
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

  const parsed = normaliseFaviconSettings(body as Record<string, unknown>);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const settings = await saveFaviconSettings(parsed);
    revalidatePath("/", "layout");
    revalidateTag("favicon", "max");
    revalidateTag("favicon-asset", "max");
    return Response.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the favicon.";
    return Response.json({ error: message }, { status: 503 });
  }
}