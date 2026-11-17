import { revalidateTag } from "next/cache";
import { createAdminProject, getAdminProjects, importLegacyProceedings, readProjectInput } from "@/lib/admin-projects";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return Response.json({ projects: await getAdminProjects() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load projects.";
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

  if (body && typeof body === "object" && (body as { action?: string }).action === "importLegacy") {
    try {
      const result = await importLegacyProceedings();
      revalidateTag("projects", "max");
      return Response.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to import projects.";
      return Response.json({ error: message }, { status: 503 });
    }
  }

  const parsed = readProjectInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const created = await createAdminProject(parsed);
    revalidateTag("projects", "max");
    return Response.json({ ...created, slug: parsed.slug }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create the project.";
    return Response.json({ error: message }, { status: 503 });
  }
}