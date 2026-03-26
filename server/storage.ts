/**
 * File storage via Cloudinary (free tier — no credit card needed).
 * Set in Railway Variables:
 *   CLOUDINARY_CLOUD_NAME  → your cloud name from cloudinary.com dashboard
 *   CLOUDINARY_API_KEY     → API key
 *   CLOUDINARY_API_SECRET  → API secret
 *
 * Sign up free at https://cloudinary.com — free tier gives 25 GB storage.
 */

import { createHash } from "crypto";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Railway Variables."
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function buildSignature(params: Record<string, string>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha256").update(sorted + apiSecret).digest("hex");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();

  // Derive a Cloudinary public_id from the key (strip extension for images)
  const publicId = relKey.replace(/^\/+/, "").replace(/\.[^.]+$/, "");
  const timestamp = String(Math.floor(Date.now() / 1000));

  const paramsToSign: Record<string, string> = {
    public_id: publicId,
    timestamp,
  };

  const signature = buildSignature(paramsToSign, apiSecret);

  const formData = new FormData();
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([Buffer.from(data as Buffer)], { type: contentType });

  const filename = relKey.replace(/^.*[\\/]/, "") || "file";
  formData.append("file", blob, filename);
  formData.append("public_id", publicId);
  formData.append("timestamp", timestamp);
  formData.append("api_key", apiKey);
  formData.append("signature", signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const response = await fetch(uploadUrl, { method: "POST", body: formData });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`Cloudinary upload failed (${response.status}): ${text}`);
  }

  const result = await response.json() as { secure_url: string; public_id: string };
  return { key: result.public_id, url: result.secure_url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const { cloudName } = getCloudinaryConfig();
  const key = relKey.replace(/^\/+/, "");
  // Cloudinary public URLs don't need signing for public assets
  const url = `https://res.cloudinary.com/${cloudName}/image/upload/${key}`;
  return { key, url };
}
