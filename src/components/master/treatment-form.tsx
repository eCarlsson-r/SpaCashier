"use client";

import { EntityForm } from "../shared/EntityForm";
import { TreatmentSchema } from "@/lib/schemas";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AccountSelect } from "../shared/AccountSelect";
import { DatePicker } from "../shared/DatePicker";
import { AppSelect } from "../shared/AppSelect";
import { useModel } from "@/hooks/useModel";
import { ImagePreview } from "../shared/ImagePreview";

import z from "zod";

export function TreatmentForm({ treatmentId }: { treatmentId?: string }) {
  return (
    <EntityForm<z.infer<typeof TreatmentSchema>>
      title={treatmentId ? "Edit Treatment" : "Add New Treatment"}
      schema={TreatmentSchema}
      id={treatmentId}
      endpoint="/treatment"
      defaultValues={{
        id: "",
        name: "",
        category_id: "",
        price: 0,
        duration: 0,
        description: "",
        applicable_days: [],
        applicable_time_start: "",
        applicable_time_end: "",
        minimum_quantity: 1,
        voucher_normal_quantity: 0,
        voucher_purchase_quantity: 0,
        body_img: undefined,
        icon_img: undefined,
        room: '["VIPSG","VIPCP","STDRM"]',
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                    <AppSelect
                      options={
                        useModel("category", { mode: "select" }).options ?? []
                      }
                      value={field.value}
                      onValueChange={field.onChange}
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
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ""}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ""}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ""}
                      />
                    </FormControl>
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
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        value={field.value || ""}
                      />
                    </FormControl>
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
                  <FormControl>
                    <AppSelect
                      multiple={true}
                      options={[
                        { value: "1", label: "Monday" },
                        { value: "2", label: "Tuesday" },
                        { value: "3", label: "Wednesday" },
                        { value: "4", label: "Thursday" },
                        { value: "5", label: "Friday" },
                        { value: "6", label: "Saturday" },
                        { value: "0", label: "Sunday" },
                      ]}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
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
                    <FormControl>
                      <Input {...field} type="time" value={field.value || ""} />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} type="time" value={field.value || ""} />
                    </FormControl>
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
                  <FormControl>
                    <Input {...field} type="number" value={field.value || 1} />
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
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <ImagePreview form={form} name="body_img" label="Image" />

              <ImagePreview form={form} name="icon_img" label="Icon Image" />
            </div>
          </div>
        </div>
      )}
    </EntityForm>
  );
}
