"use client";

import { EntityForm } from "../shared/EntityForm";
import { JournalSchema } from "@/lib/schemas";
import { Input } from "../ui/input";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { DatePicker } from "../shared/DatePicker";
import z from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { AccountSelect } from "../shared/AccountSelect";
import { toast } from "sonner";

type JournalFormValues = z.infer<typeof JournalSchema>;

function JournalFormContent({
  form,
}: {
  form: UseFormReturn<JournalFormValues>;
}) {
  const { fields, append, remove } = useFieldArray<JournalFormValues>({
    control: form.control,
    name: "records",
  });

  const handleAddRecord = () => {
    const tempAccount = form.getValues("temp_account_id");
    const tempDebit = form.getValues("temp_debit");
    const tempCredit = form.getValues("temp_credit");
    const tempDesc = form.getValues("temp_description");

    if (!tempAccount) {
      toast.error("Please select an account first");
      return;
    }

    append({
      account_id: tempAccount,
      debit: Number(tempDebit) || 0,
      credit: Number(tempCredit) || 0,
      description: tempDesc || "",
    });

    form.setValue("temp_account_id", "");
    form.setValue("temp_debit", 0);
    form.setValue("temp_credit", 0);
    form.setValue("temp_description", "");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-6 grid grid-cols-12 gap-5">
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference No.</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-3">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <DatePicker form={form} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-7">
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
      </div>

      <h3 className="font-medium">Journal Records</h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-2 text-left">Account Name</th>
              <th className="p-2 text-left">Debit</th>
              <th className="p-2 text-left">Credit</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.id} className="border-b bg-white">
                <td className="p-2 font-medium">
                  <AccountSelect
                    form={form}
                    name={`records.${index}.account_id`}
                    label=""
                    placeholder="Select Account..."
                  />
                </td>
                <td className="p-2 text-slate-500">{field.debit}</td>
                <td className="p-2 text-slate-500">{field.credit}</td>
                <td className="p-2 text-slate-500">{field.description}</td>
                <td className="p-2 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}

            <tr className="bg-blue-50/50">
              <td className="p-2">
                <AccountSelect form={form} name="temp_account_id" />
              </td>
              <td className="p-2">
                <Input {...form.register("temp_debit")} type="number" />
              </td>
              <td className="p-2">
                <Input {...form.register("temp_credit")} type="number" />
              </td>
              <td className="p-2">
                <Input {...form.register("temp_description")} />
              </td>
              <td className="p-2 text-right">
                <Button
                  className="bg-sky-600 hover:bg-sky-700"
                  type="button"
                  size="sm"
                  onClick={handleAddRecord}
                >
                  Add
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function JournalForm({ journalId }: { journalId?: string }) {
  return (
    <EntityForm<JournalFormValues>
      title={journalId ? "Edit Journal" : "Add New Journal"}
      schema={JournalSchema}
      id={journalId}
      endpoint="/journal"
      defaultValues={{
        reference: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        records: [],
        temp_account_id: "",
        temp_debit: 0,
        temp_credit: 0,
        temp_description: "",
      }}
    >
      {(form) => <JournalFormContent form={form} />}
    </EntityForm>
  );
}
