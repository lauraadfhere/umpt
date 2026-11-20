/** Browser-only: shrink large photos before they hit the server (Parse hop is often the slow part). */

const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.86;
const SKIP_BYTES = 450_000;

function canResize(type: string) {
  return type === "image/jpeg" || type === "image/png" || type === "image/webp";
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not read the image."));
      image.src = url;
    });
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Downscales oversized raster images; GIF and small files pass through unchanged. */
export async function prepareImageForUpload(file: File): Promise<{ body: Blob; contentType: string }> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size <= SKIP_BYTES || !canResize(file.type)) {
    return { body: file, contentType: file.type || "application/octet-stream" };
  }

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight, 1));
  if (scale >= 1 && file.size <= SKIP_BYTES) {
    return { body: file, contentType: file.type };
  }

  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { body: file, contentType: file.type };
  ctx.drawImage(image, 0, 0, width, height);

  const outputType = file.type === "image/png" && file.size < 1_200_000 ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, JPEG_QUALITY));
  if (!blob || blob.size >= file.size) return { body: file, contentType: file.type };
  return { body: blob, contentType: outputType };
}

function contentTypeForUpload(file: File, preparedType: string) {
  if (preparedType && preparedType !== "application/octet-stream") return preparedType;
  const name = file.name.toLowerCase();
  if (name.endsWith(".svg")) return "image/svg+xml";
  if (name.endsWith(".ico")) return "image/x-icon";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return preparedType || "application/octet-stream";
}

export async function uploadAdminImage(file: File): Promise<string> {
  const { body, contentType } = await prepareImageForUpload(file);
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    headers: { "Content-Type": contentTypeForUpload(file, contentType) },
    body,
  });
  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) throw new Error(data.error || "Upload failed.");
  return data.url;
}

export async function uploadPublicImage(file: File): Promise<string> {
  const { body, contentType } = await prepareImageForUpload(file);
  const response = await fetch("/api/public/uploads", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) throw new Error(data.error || "Upload failed.");
  return data.url;
}