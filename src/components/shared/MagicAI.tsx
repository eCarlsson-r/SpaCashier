"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { UseFormReturn, FieldValues, Path, PathValue } from "react-hook-form";
import { AxiosError } from "axios";

interface MagicAIProps<T extends FieldValues> {
  type: string;
  mode: "description" | "image";
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  sourceFields?: Path<T>[];
  label?: string;
}

export function MagicAI<T extends FieldValues>({
  type,
  mode,
  form,
  fieldName,
  sourceFields = ["name" as Path<T>],
  label,
}: MagicAIProps<T>) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (mode === "description") {
        const fields: Record<string, unknown> = {};
        sourceFields.forEach((f) => {
          fields[f as string] = form.getValues(f);
        });

        const response = await api.post("/ai/generate-description", {
          type,
          fields,
        });

        form.setValue(fieldName, response.data.description as PathValue<T, Path<T>>, { 
          shouldValidate: true, 
          shouldDirty: true 
        });
        toast.success("Description generated!");
      } else {
        const promptValue = form.getValues("description" as Path<T>) || form.getValues("name" as Path<T>) || type;
        const prompt = typeof promptValue === "string" ? promptValue : type;
        
        const response = await api.post("/ai/generate-image", {
          type,
          prompt,
        });

        form.setValue(fieldName, response.data.image_url as PathValue<T, Path<T>>, { 
          shouldValidate: true, 
          shouldDirty: true 
        });
        toast.success("Image generated!");
      }
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = "Failed to generate content";
      
      if (error instanceof AxiosError) {
        errorMessage = error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-2 text-xs h-7 px-2"
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Sparkles className="w-3 h-3 text-purple-500" />
      )}
      {label || (mode === "description" ? "Magic Write" : "Magic Image")}
    </Button>
  );
}
