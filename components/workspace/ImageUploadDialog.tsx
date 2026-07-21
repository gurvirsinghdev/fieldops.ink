"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoaderIcon, UploadIcon, XIcon } from "lucide-react";
import Image from "next/image";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  uploadEndpoint: string;
  onSuccess: (data: unknown) => void;
  imageShapeClass?: string;
};

export function ImageUploadDialog({
  open,
  onOpenChange,
  title,
  description,
  uploadEndpoint,
  onSuccess,
  imageShapeClass = "rounded-full",
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;

    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setError(null);

    if (f) {
      if (f.size > 2 * 1024 * 1024) {
        setError("File must be under 2MB.");
        setFile(null);
        return;
      }
      setFile(f);
      setPreview(URL.createObjectURL(f));
    } else {
      setFile(null);
    }
  }

  function clearSelection() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setError(null);
  }

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error ?? "Upload failed");
      }

      const data = await res.json();
      onSuccess(data);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      clearSelection();
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {preview ? (
            <div className="relative">
              <Image
                src={preview}
                alt="Preview"
                width={128}
                height={128}
                unoptimized
                className={`h-32 w-32 ${imageShapeClass} object-cover ring-1 ring-border`}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute -top-1 -right-1 size-6 rounded-full bg-background shadow ring-1 ring-border"
                onClick={clearSelection}
                disabled={uploading}
              >
                <XIcon className="size-3" />
              </Button>
            </div>
          ) : (
            <div className={`flex h-32 w-32 items-center justify-center ${imageShapeClass} bg-muted ring-1 ring-border`}>
              <span className="text-4xl text-muted-foreground select-none">
                ?
              </span>
            </div>
          )}

          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? (
              <LoaderIcon className="animate-spin" />
            ) : (
              <UploadIcon />
            )}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
