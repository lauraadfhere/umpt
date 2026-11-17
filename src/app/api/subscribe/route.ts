import { createSubscriber, readSubscribeInput } from "@/lib/subscribers";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = readSubscribeInput(body);
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 });

  try {
    const result = await createSubscriber(parsed.input);
    return Response.json({ id: result.id, created: result.created }, { status: result.created ? 201 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save the subscription.";
    return Response.json({ error: message }, { status: 503 });
  }
}
