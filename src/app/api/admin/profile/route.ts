import { revalidatePath, revalidateTag } from "next/cache";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";
import { routing } from "@/i18n/routing";
import { getProfileSettingsUncached, saveProfileSettings } from "@/lib/profile";
import { normaliseProfileSettings } from "@/lib/profile-config";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  return Response.json(await getProfileSettingsUncached());
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

  const parsed = normaliseProfileSettings(body as Record<string, unknown>);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const saved = await saveProfileSettings(parsed);
    revalidateTag("profile", "max");
    for (const locale of routing.locales) {
      revalidatePath(`/${locale}/dashboard/profile`);
      revalidatePath(`/${locale}/posts`, "layout");
      revalidatePath(`/${locale}/people`, "layout");
      revalidatePath(`/${locale}/blogs`, "layout");
    }
    return Response.json(saved);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the profile.";
    return Response.json({ error: message }, { status: 503 });
  }
}
