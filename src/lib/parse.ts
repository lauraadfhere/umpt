// Server-only: reads PARSE_REST_KEY / PARSE_MASTER_KEY. Never import from a Client Component.
import { fetchWithTimeout } from "@/lib/cf-timeout";

export type ParseRecord = Record<string, unknown> & { objectId: string };
type ParseResponse = { results?: ParseRecord[]; error?: string };

export function isParseConfigured() {
  return Boolean(process.env.PARSE_SERVER_URL && process.env.PARSE_APP_ID && process.env.PARSE_REST_KEY);
}

export function config() {
  const url = process.env.PARSE_SERVER_URL;
  const appId = process.env.PARSE_APP_ID;
  const restKey = process.env.PARSE_REST_KEY;
  if (!url || !appId || !restKey) {
    throw new Error("Parse is not configured. Add the server-side PARSE_* values to .env.local.");
  }
  return { url: url.replace(/\/$/, ""), appId, restKey };
}

export function writeHeaders() {
  const { appId, restKey } = config();
  const masterKey = process.env.PARSE_MASTER_KEY;
  return {
    "Content-Type": "application/json",
    "X-Parse-Application-Id": appId,
    ...(masterKey ? { "X-Parse-Master-Key": masterKey } : { "X-Parse-REST-API-Key": restKey }),
  };
}

export function textValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

export function fileUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as { url?: unknown }).url === "string") {
    return (value as { url: string }).url;
  }
  return "";
}

function parseQueryTimeoutMs() {
  const raw = process.env.PARSE_QUERY_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed >= 3_000) return Math.min(parsed, 120_000);
  return 25_000;
}

export async function query(className: string, parameters: URLSearchParams, timeoutMs = parseQueryTimeoutMs()): Promise<ParseRecord[]> {
  const { url, appId, restKey } = config();
  const response = await fetchWithTimeout(`${url}/classes/${className}?${parameters}`, {
    headers: { "X-Parse-Application-Id": appId, "X-Parse-REST-API-Key": restKey },
    cache: "no-store",
    timeoutMs,
  });
  const body = (await response.json().catch(() => ({}))) as ParseResponse;
  if (!response.ok) throw new Error(body.error || `Parse returned ${response.status}.`);
  return body.results ?? [];
}

export async function uploadParseFile(name: string, contentType: string, bytes: ArrayBuffer): Promise<string> {
  return uploadParseFileBody(name, contentType, bytes, bytes.byteLength);
}

/**
 * Streams the file body to Parse instead of buffering it again on the app server.
 * Large uploads were slow because every byte was copied twice (client → Next → Parse).
 */
export async function uploadParseFileBody(
  name: string,
  contentType: string,
  body: BodyInit,
  byteLength?: number,
): Promise<string> {
  const { url } = config();
  const headers: Record<string, string> = { ...writeHeaders(), "Content-Type": contentType };
  if (byteLength !== undefined && Number.isFinite(byteLength)) headers["Content-Length"] = String(byteLength);

  const init: RequestInit & { duplex?: "half" } = {
    method: "POST",
    headers,
    body,
    cache: "no-store",
  };
  if (body instanceof ReadableStream) init.duplex = "half";

  const response = await fetchWithTimeout(`${url}/files/${encodeURIComponent(name)}`, {
    ...init,
    timeoutMs: 120_000,
  });
  const parsed = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !parsed.url) throw new Error(parsed.error || `Parse returned ${response.status}.`);
  return parsed.url;
}

export type BackendStatus = { configured: boolean; ok: boolean; message: string };

export async function getBackendStatus(): Promise<BackendStatus> {
  if (!isParseConfigured()) {
    return { configured: false, ok: false, message: "PARSE_* values are missing from .env.local." };
  }
  try {
    const { url, appId } = config();
    const response = await fetchWithTimeout(`${url}/health`, {
      headers: { "X-Parse-Application-Id": appId },
      cache: "no-store",
      timeoutMs: 5000,
    });
    return { configured: true, ok: response.ok, message: response.ok ? "Parse Server is reachable." : `Health check returned ${response.status}.` };
  } catch (error) {
    return { configured: true, ok: false, message: error instanceof Error ? error.message : "Parse Server is unreachable." };
  }
}
