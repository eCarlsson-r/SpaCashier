"use client";

import { EntityForm } from "../shared/EntityForm";
import { BannerSchema } from "@/lib/schemas";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { ImagePreview } from "../shared/ImagePreview";

import z from "zod";

export function BannerForm({ bannerId }: { bannerId?: string }) {
  return (
    <EntityForm<z.infer<typeof BannerSchema>>
      title={bannerId ? "Edit Banner" : "Add New Banner"}
      schema={BannerSchema}
      id={bannerId}
      endpoint="/banner"
      defaultValues={{
        introduction: "",
        title: "",
        subtitle: "",
        description: "",
        action: "",
        action_page: "",
        image: undefined,
      }}
    >
      {(form) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Info */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="introduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Introduction</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="action_page"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Page</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ImagePreview
              label="Banner Image"
              name="image"
              form={form}
              currentImageUrl={form.getValues("image")}
            />
          </div>
        </div>
      )}
    </EntityForm>
  );
}
