import { voteComment } from "@/lib/comments";

const OBJECT_ID = /^[A-Za-z0-9]{1,64}$/;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  if (!OBJECT_ID.test(id)) return Response.json({ error: "Invalid comment id." }, { status: 400 });

  let body: { direction?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const direction = body.direction === "dislike" ? "dislike" : body.direction === "like" ? "like" : null;
  if (!direction) return Response.json({ error: "Choose like or dislike." }, { status: 400 });

  try {
    const counts = await voteComment(id, direction);
    return Response.json(counts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record your vote.";
    return Response.json({ error: message }, { status: 503 });
  }
}