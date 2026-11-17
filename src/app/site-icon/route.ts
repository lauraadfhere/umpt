import type { NextRequest } from "next/server";
import { buildSiteIconResponse } from "@/lib/site-icon";

/** Same-origin favicon for browsers and Next metadata (cached; CMS URL proxied when set). */
export async function GET(request: NextRequest) {
  const apple = request.nextUrl.searchParams.get("apple") === "1";
  const origin = request.nextUrl.origin;
  try {
    return await buildSiteIconResponse(apple, origin);
  } catch {
    return new Response(null, { status: 502 });
  }
}