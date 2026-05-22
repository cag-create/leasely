// Client-side image preparation for /api/upload.
// Converts HEIC / large phone photos into a compressed JPEG data URL so they
// fit under the server's 10MB JSON body limit and pass the mime-type allowlist.

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.85;

async function fileToBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  // createImageBitmap handles HEIC on Safari/iOS and is faster than <img> elsewhere.
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> path
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image"));
      el.src = url;
    });
    return img;
  } finally {
    // Revoke after the bitmap has been drawn — caller draws synchronously.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function dimensions(bitmap: ImageBitmap | HTMLImageElement): { w: number; h: number } {
  const w = "width" in bitmap ? bitmap.width : (bitmap as HTMLImageElement).naturalWidth;
  const h = "height" in bitmap ? bitmap.height : (bitmap as HTMLImageElement).naturalHeight;
  return { w, h };
}

/**
 * Returns a JPEG data URL (data:image/jpeg;base64,...) suitable for POSTing
 * to /api/upload. Resizes to MAX_DIMENSION on the longer edge.
 */
export async function prepareImageForUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
    throw new Error("Not an image file");
  }
  const bitmap = await fileToBitmap(file);
  const { w, h } = dimensions(bitmap);
  if (!w || !h) throw new Error("Could not read image dimensions");

  const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
  const targetW = Math.round(w * scale);
  const targetH = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap as CanvasImageSource, 0, 0, targetW, targetH);

  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  if (!dataUrl.startsWith("data:image/jpeg")) {
    throw new Error("Could not encode JPEG");
  }
  return dataUrl;
}
