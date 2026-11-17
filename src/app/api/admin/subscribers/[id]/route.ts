import { deleteSubscriber } from "@/lib/subscribers";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const { id } = await params;
  try {
    await deleteSubscriber(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the subscriber.";
    return Response.json({ error: message }, { status: 503 });
  }
}