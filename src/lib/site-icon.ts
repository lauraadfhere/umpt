// Server-only: resolves and proxies favicon bytes for /site-icon.
import { getFaviconSettings } from "@/lib/favicon";
import { resolveIconSource } from "@/lib/favicon-config";

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="UMPT"><rect width="32" height="32" fill="#1a5276"/><circle cx="22" cy="10" r="5.5" fill="#ffffff"/><text x="8" y="21" fill="#ffffff" font-family="system-ui,sans-serif" font-size="9" font-weight="700">DL</text></svg>`;

function cacheHeaders(maxAge = 3_600) {
  return {
    "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=86400`,
  };
}

function guessContentType(url: string, header: string | null) {
  if (header?.startsWith("image/")) return header;
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".ico")) return "image/x-icon";
  return "image/png";
}

function readFallbackSvg(): Response {
  return new Response(FALLBACK_SVG, {
    headers: {
      ...cacheHeaders(604_800),
      "Content-Type": "image/svg+xml",
    },
  });
}

async function readPublicPath(relativePath: string, origin: string): Promise<Response | null> {
  if (!relativePath.startsWith("/") || relativePath.startsWith("//")) return null;
  try {
    const response = await fetch(new URL(relativePath, origin));
    if (!response.ok) return null;
    const bytes = await response.arrayBuffer();
    return new Response(bytes, {
      headers: {
        ...cacheHeaders(),
        "Content-Type": guessContentType(relativePath, response.headers.get("content-type")),
      },
    });
  } catch {
    return null;
  }
}

async function proxyRemote(url: string): Promise<Response> {
  // Plain fetch works on Cloudflare Workers; avoid Next data-cache options that can mask failures.
  const upstream = await fetch(url, {
    headers: { Accept: "image/*,*/*;q=0.8" },
    cache: "force-cache",
  });
  if (!upstream.ok) throw new Error(`Icon upstream returned ${upstream.status}.`);
  const bytes = await upstream.arrayBuffer();
  if (!bytes.byteLength) throw new Error("Icon upstream returned an empty file.");
  return new Response(bytes, {
    headers: {
      ...cacheHeaders(3_600),
      "Content-Type": guessContentType(url, upstream.headers.get("content-type")),
    },
  });
}

export async function buildSiteIconResponse(apple: boolean, origin: string): Promise<Response> {
  const settings = await getFaviconSettings();
  const source = resolveIconSource(settings, apple);

  if (!source) return readFallbackSvg();

  if (source.startsWith("/") && !source.startsWith("//")) {
    const local = await readPublicPath(source, origin);
    if (local) return local;
    return readFallbackSvg();
  }

  if (source.startsWith("http://") || source.startsWith("https://")) {
    try {
      return await proxyRemote(source);
    } catch {
      return readFallbackSvg();
    }
  }

  return readFallbackSvg();
}