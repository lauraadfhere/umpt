import { getSubscribers } from "@/lib/subscribers";
import { isAdmin } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return Response.json({ subscribers: await getSubscribers() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load subscribers.";
    return Response.json({ error: message }, { status: 503 });
  }
}