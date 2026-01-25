"use client";

import { EntityForm } from "../shared/EntityForm";
import { BranchSchema } from "@/lib/schemas";
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
import { ImagePreview } from "../shared/ImagePreview";

import z from "zod";

export function BranchForm({ branchId }: { branchId?: string }) {
  return (
    <EntityForm<z.infer<typeof BranchSchema>>
      title={branchId ? "Edit Branch" : "Add New Branch"}
      schema={BranchSchema}
      id={branchId}
      endpoint="/branch"
      defaultValues={{
        name: "",
        address: "",
        city: "Medan",
        country: "Indonesia",
        phone: "",
        description: "",
        cash_account: "1",
        walkin_account: "",
        voucher_purchase_account: "",
        voucher_usage_account: "",
        branch_img: undefined,
      }}
    >
      {(form) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Info */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <AccountSelect
              form={form}
              name="cash_account"
              label="Default Cash Account"
              typeFilter="cash"
            />

            {/* Only shows accounts where type === 'income' (Services, Product Sales) */}
            <AccountSelect
              form={form}
              name="walkin_account"
              label="Walk-in Sales Account"
              typeFilter="income"
            />

            <AccountSelect
              form={form}
              name="voucher_purchase_account"
              label="Voucher Purchase Account"
              typeFilter="income"
            />

            {/* Only shows accounts where type === 'account-payable' or 'other-current-liabilities' */}
            <AccountSelect
              form={form}
              name="voucher_usage_account"
              label="Voucher Liability Account"
              typeFilter="account-payable"
            />

            <ImagePreview
              label="Branch Image"
              name="branch_img"
              form={form}
              currentImageUrl={form.getValues("branch_img")}
            />
          </div>
        </div>
      )}
    </EntityForm>
  );
}
