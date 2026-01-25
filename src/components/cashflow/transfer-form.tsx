"use client";

import { EntityForm } from "../shared/EntityForm";
import { TransferSchema } from "@/lib/schemas";
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

import z from "zod";

export function TransferForm({ transferId }: { transferId?: string }) {
  return (
    <EntityForm<z.infer<typeof TransferSchema>>
      title={transferId ? "Edit Transfer" : "Add New Transfer"}
      schema={TransferSchema}
      id={transferId}
      endpoint="/transfer"
      defaultValues={{
        journal_reference: "",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        description: "",
        from_wallet_id: "",
        to_wallet_id: "",
      }}
    >
      {(form) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General Info */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="journal_reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal Reference</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <DatePicker {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
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
              name="from_wallet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Wallet</FormLabel>
                  <FormControl>
                    <AccountSelect form={form} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="to_wallet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Wallet</FormLabel>
                  <FormControl>
                    <AccountSelect form={form} {...field} />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </EntityForm>
  );
}
