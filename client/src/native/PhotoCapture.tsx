import { useState } from "react";
import { Camera, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { captureAndUpload, type PhotoSource } from "./photos";
import { isNativeApp } from "./platform";

/**
 * "Take photo" / "Choose photos" buttons. Native camera + photo library in the
 * Keycove app, a regular file chooser on the web. Calls onUploaded with the
 * hosted URLs once uploads finish.
 */
export function PhotoCapture({
  onUploaded,
  remaining,
  disabled,
  className,
}: {
  onUploaded: (urls: string[]) => void;
  /** How many more photos are allowed. 0 disables the buttons. */
  remaining: number;
  disabled?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState<PhotoSource | null>(null);
  const native = isNativeApp();
  const off = disabled || remaining <= 0 || busy !== null;

  async function run(source: PhotoSource) {
    setBusy(source);
    try {
      const urls = await captureAndUpload(source, remaining);
      if (urls.length) {
        onUploaded(urls);
        toast.success(urls.length === 1 ? "Photo added" : `${urls.length} photos added`);
      }
    } catch (err) {
      const msg = String((err as Error)?.message ?? err);
      toast.error(/denied|permission/i.test(msg)
        ? "Camera access is off. Turn it on in Settings → Keycove."
        : msg || "Couldn't add the photo. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      <Button type="button" variant="outline" size="sm" disabled={off} onClick={() => run("camera")} className="rounded-xl">
        {busy === "camera" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Camera className="h-4 w-4 mr-1.5" />}
        Take photo
      </Button>
      <Button type="button" variant="outline" size="sm" disabled={off} onClick={() => run("library")} className="rounded-xl">
        {busy === "library" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ImagePlus className="h-4 w-4 mr-1.5" />}
        {native ? "Choose from library" : "Upload photos"}
      </Button>
    </div>
  );
}
