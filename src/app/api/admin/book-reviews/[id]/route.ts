import { deleteBookReview, setBookReviewApproval } from "@/lib/book-reviews";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });
  const { id } = await params;
  let body: { isApproved?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof body.isApproved !== "boolean") return Response.json({ error: "isApproved is required." }, { status: 400 });
  try {
    await setBookReviewApproval(id, body.isApproved);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update the review.";
    return Response.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const { id } = await params;
  try {
    await deleteBookReview(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete the review.";
    return Response.json({ error: message }, { status: 503 });
  }
}