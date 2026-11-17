import { revalidateTag } from "next/cache";
import { deleteAdminProject, getAdminProjectById, readProjectInput, updateAdminProject } from "@/lib/admin-projects";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  const project = await getAdminProjectById(id);
  if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
  return Response.json(project);
}

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const existing = await getAdminProjectById(id);
  if (!existing) return Response.json({ error: "Project not found." }, { status: 404 });

  const parsed = readProjectInput(body, existing);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    await updateAdminProject(id, parsed);
    revalidateTag("projects", "max");
    return Response.json({ id, slug: parsed.slug });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the project.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    await deleteAdminProject(id);
    revalidateTag("projects", "max");
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the project.";
    return Response.json({ error: message }, { status: 503 });
  }
}