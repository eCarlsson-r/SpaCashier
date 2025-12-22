"use client";

import { EntityForm } from "../shared/EntityForm";
import { BannerSchema } from "@/lib/schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { ImagePreview } from "../shared/ImagePreview";

export function BannerForm({ bannerId }: { bannerId?: string }) {
    return (
        <EntityForm
            title={bannerId ? "Edit Banner" : "Add New Banner"}
            schema={BannerSchema}
            id={bannerId}
            endpoint="/banner"
            defaultValues={{
                intro_key: "", title_key: "",
                subtitle_key: "", description_key: "",
                action_key: "", action_page: "", image: ""
            }}
        >
            {(form) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* General Info */}
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="intro_key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Introduction Translation Key</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title_key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title Translation Key</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subtitle_key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subtitle Translation Key</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description_key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description Translation Key</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="action_key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Action Translation Key</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
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
                                    <FormControl><Input {...field} /></FormControl>
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
        </EntityForm >
    );
}