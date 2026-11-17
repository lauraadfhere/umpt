import { uploadParseFile, uploadParseFileBody } from "@/lib/parse";
import { isAdmin, isSameOriginRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 5 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function parseContentLength(value: string | null) {
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOriginRequest(request)) return Response.json({ error: "Invalid origin." }, { status: 403 });

  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const extension = EXTENSIONS[type];
  if (!extension) return Response.json({ error: "Upload a JPG, PNG, WebP or GIF image." }, { status: 400 });

  const length = parseContentLength(request.headers.get("content-length"));
  if (length === 0) return Response.json({ error: "The file is empty." }, { status: 400 });
  if (length !== null && length > MAX_BYTES) return Response.json({ error: "Keep the image under 5 MB." }, { status: 413 });

  const name = `umpt-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  try {
    if (request.body && length !== null) {
      const url = await uploadParseFileBody(name, type, request.body, length);
      return Response.json({ url }, { status: 201 });
    }

    const bytes = await request.arrayBuffer();
    if (bytes.byteLength === 0) return Response.json({ error: "The file is empty." }, { status: 400 });
    if (bytes.byteLength > MAX_BYTES) return Response.json({ error: "Keep the image under 5 MB." }, { status: 413 });
    const url = await uploadParseFile(name, type, bytes);
    return Response.json({ url }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload the image.";
    const status = message.includes("timeout") || message.includes("Timeout") ? 504 : 503;
    return Response.json({ error: message }, { status });
  }
}