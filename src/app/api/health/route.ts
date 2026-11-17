import { getBackendStatus } from "@/lib/parse";

export async function GET() {
  const status = await getBackendStatus();
  return Response.json(status, { status: status.ok ? 200 : 503 });
}
