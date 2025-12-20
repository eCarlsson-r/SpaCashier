"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Pencil } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value?: string | File; // URL from Laravel or a File object
    onChange: (file?: File) => void;
    onRemove?: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        // 1. If it's a string (URL from Laravel), just show it
        if (typeof value === "string") {
            setPreview(value);
        }
        // 2. If it's a File object (New selection), create a local blob URL
        else if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); // Cleanup memory
        }
    }, [value]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative h-40 w-40 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 transition hover:border-muted-foreground/50">
                {preview ? (
                    <>
                        <Image
                            fill
                            src={preview}
                            alt="Upload preview"
                            className="object-cover"
                        />
                        <div className="absolute right-2 top-2 flex gap-1">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                    setPreview(null);
                                    onRemove?.();
                                    onChange(undefined);
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-muted-foreground transition hover:bg-accent">
                        <ImagePlus className="h-8 w-8" />
                        <span className="text-xs">Upload Image</span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onChange(file);
                            }}
                        />
                    </label>
                )}
            </div>
            <p className="text-xs text-muted-foreground italic">
                JPG, PNG or WebP. Max 2MB.
            </p>
        </div>
    );
}