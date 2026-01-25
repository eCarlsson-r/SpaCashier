// src/components/master/shared/image-preview.tsx
"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface ImagePreviewProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  form: UseFormReturn<T>;
  currentImageUrl?: string;
}

export function ImagePreview<T extends FieldValues>({
  label,
  name,
  form,
  currentImageUrl,
}: ImagePreviewProps<T>) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = form.register(name);

  // Watch for file changes
  const watchFile = form.watch(name);

  useEffect(() => {
    if (watchFile && watchFile[0] instanceof File) {
      const objectUrl = URL.createObjectURL(watchFile[0]);
      queueMicrotask(() => setPreview(objectUrl));
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      queueMicrotask(() => setPreview(null));
    }
  }, [watchFile]);

  const displayImage =
    preview ||
    (currentImageUrl ? `http://localhost:8000${currentImageUrl}` : null);

  return (
    <div className="space-y-2 border p-4 rounded-lg bg-sky-50/50">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </Label>

      <div className="relative h-32 w-full border-2 border-dashed rounded-md overflow-hidden bg-white flex items-center justify-center">
        {displayImage ? (
          <Image
            src={displayImage}
            alt="Preview"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-8 w-8 opacity-20" />
            <span className="text-xs">No image set</span>
          </div>
        )}
      </div>

      <Input type="file" accept="image/*" {...fileRef} className="text-xs" />
    </div>
  );
}
