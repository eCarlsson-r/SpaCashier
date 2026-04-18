"use client";

import { EntityForm } from "../shared/EntityForm";
import { CategorySchema } from "@/lib/schemas";
import { ImagePreview } from "../shared/ImagePreview";
import {
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { MagicAI } from "../shared/MagicAI";

import z from "zod";

export function CategoryForm({ categoryId }: { categoryId?: string }) {
  return (
    <EntityForm<z.infer<typeof CategorySchema>>
      id={categoryId}
      endpoint="/category"
      schema={CategorySchema}
      defaultValues={{
        name: "",
        description: "",
        id: "",
        i18n: "",
        header_img: undefined,
        body_img1: undefined,
        body_img2: undefined,
        body_img3: undefined,
      }}
      title="Category Management"
    >
      {(form) => (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Description</FormLabel>
                  <MagicAI
                    type="Treatment Category"
                    mode="description"
                    form={form}
                    fieldName="description"
                    sourceFields={["name"]}
                  />
                </div>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Header Image</span>
                <MagicAI
                  type="Treatment Category"
                  mode="image"
                  form={form}
                  fieldName="header_img"
                />
              </div>
              <ImagePreview
                label=""
                name="header_img"
                form={form}
                currentImageUrl={form.getValues("header_img")}
              />
            </div>
            <ImagePreview
              label="Body Image 1"
              name="body_img1"
              form={form}
              currentImageUrl={form.getValues("body_img1")}
            />
            <ImagePreview
              label="Body Image 2"
              name="body_img2"
              form={form}
              currentImageUrl={form.getValues("body_img2")}
            />
            <ImagePreview
              label="Body Image 3"
              name="body_img3"
              form={form}
              currentImageUrl={form.getValues("body_img3")}
            />
          </div>
        </div>
      )}
    </EntityForm>
  );
}
