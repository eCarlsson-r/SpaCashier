"use client";

import { EntityForm } from "../shared/EntityForm";
import { TreatmentSchema } from "@/lib/schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AccountSelect } from "../shared/AccountSelect";
import { DatePicker } from "../shared/DatePicker";
import { AppSelect } from "../shared/AppSelect";
import { useMaster } from "@/hooks/useMaster";
import { ImagePreview } from "../shared/ImagePreview";

export function TreatmentForm({ treatmentId }: { treatmentId?: string }) {
    return (
        <EntityForm
            title={treatmentId ? "Edit Treatment" : "Add New Treatment"}
            schema={TreatmentSchema}
            id={treatmentId}
            endpoint="/treatment"
            defaultValues={{
                name: "", price: 0, duration: 0, description: ""
            }}
        >
            {(form) => (
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ID</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                        <AppSelect options={useMaster("category", false).data || []}
                                            value={field.value} onValueChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl><Input {...field} type="number" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration</FormLabel>
                                        <FormControl><Input {...field} type="number" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="voucher_normal_quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Voucher Normal Quantity</FormLabel>
                                        <FormControl><Input {...field} type="number" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="voucher_purchase_quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Voucher Purchase Quantity</FormLabel>
                                        <FormControl><Input {...field} type="number" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="applicable_days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Applicable Days</FormLabel>
                                    <FormControl><AppSelect options={[
                                        { value: 1, label: "Monday" },
                                        { value: 2, label: "Tuesday" },
                                        { value: 3, label: "Wednesday" },
                                        { value: 4, label: "Thursday" },
                                        { value: 5, label: "Friday" },
                                        { value: 6, label: "Saturday" },
                                        { value: 0, label: "Sunday" }
                                    ]} value={field.value} onValueChange={field.onChange} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="applicable_time_start"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available from time</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="applicable_time_end"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available until time</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="minimum_quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Quantity</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
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
                                    <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <ImagePreview
                                form={form}
                                name="body_img"
                                label="Image"
                            />

                            <ImagePreview
                                form={form}
                                name="icon_img"
                                label="Icon Image"
                            />
                        </div>
                    </div>
                </div>
            )}
        </EntityForm >
    );
}