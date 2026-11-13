/**
 * Camera + photo library for work orders and listings. On the phone this uses
 * the native camera / photo picker (@capacitor/camera); on the web it falls
 * back to a normal file chooser. Either way photos are uploaded to
 * /api/upload and the caller receives hosted URLs.
 */
import { isNativeApp } from "./platform";

export type PhotoSource = "camera" | "library";

/** Resize + JPEG-compress so a 12MP phone photo fits the 10MB upload limit. */
async function compress(blob: Blob, maxEdge = 2000, quality = 0.82): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? blob), "image/jpeg", quality));
  } catch {
    return blob;
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function uploadPhoto(blob: Blob, filename = "photo"): Promise<string> {
  const small = blob.size > 1.5 * 1024 * 1024 || blob.type === "image/heic" ? await compress(blob) : blob;
  const dataUrl = await blobToDataUrl(small);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ dataUrl, filename }),
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) throw new Error(data.error || `Upload failed (${res.status})`);
  return data.url;
}

/** Native camera / library. Returns image blobs (empty array if cancelled). */
export async function pickNativePhotos(source: PhotoSource, limit: number): Promise<Blob[]> {
  const { Camera, CameraResultType, CameraSource } = await import("@capacitor/camera");
  try {
    if (source === "camera") {
      const photo = await Camera.getPhoto({
        source: CameraSource.Camera,
        resultType: CameraResultType.Uri,
        quality: 80,
        width: 2000,
        correctOrientation: true,
        saveToGallery: false,
      });
      if (!photo.webPath) return [];
      return [await (await fetch(photo.webPath)).blob()];
    }
    const picked = await Camera.pickImages({ quality: 80, width: 2000, limit: Math.max(1, limit) });
    const out: Blob[] = [];
    for (const p of picked.photos.slice(0, limit)) {
      out.push(await (await fetch(p.webPath)).blob());
    }
    return out;
  } catch (err) {
    const msg = String((err as Error)?.message ?? err);
    if (/cancel/i.test(msg)) return [];
    throw err;
  }
}

/** Web fallback: open a file chooser. */
export function pickWebPhotos(limit: number, capture = false): Promise<Blob[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = limit > 1;
    if (capture) input.setAttribute("capture", "environment");
    input.onchange = () => resolve(Array.from(input.files ?? []).slice(0, limit));
    input.click();
  });
}

/** Pick from the given source and upload. Returns hosted URLs. */
export async function captureAndUpload(source: PhotoSource, limit: number): Promise<string[]> {
  const blobs = isNativeApp() ? await pickNativePhotos(source, limit) : await pickWebPhotos(limit, source === "camera");
  const urls: string[] = [];
  for (let i = 0; i < blobs.length; i++) {
    urls.push(await uploadPhoto(blobs[i], `photo-${Date.now()}-${i}`));
  }
  return urls;
}
