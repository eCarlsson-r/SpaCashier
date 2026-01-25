"use client";

import { useModel } from "@/hooks/useModel";
import { Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { AccountSelect } from "@/components/shared/AccountSelect";
import { AppSelect } from "@/components/shared/AppSelect";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DatePicker } from "../shared/DatePicker";
import { Textarea } from "../ui/textarea";
import { EntityForm } from "../shared/EntityForm";
import { ExpenseSchema } from "@/lib/schemas";
import z from "zod";

type ExpenseFormValues = z.infer<typeof ExpenseSchema>;

function ExpenseFormContent({
  form,
}: {
  form: UseFormReturn<ExpenseFormValues>;
}) {
  const { options: walletOptions } = useModel("wallet", { mode: "select" });
  const { control, register, watch, setValue } = form;

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "items",
  });

  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control,
    name: "payments",
  });

  const watchedItems = watch("items");
  const totalAmount = watchedItems.reduce(
    (acc, item) => acc + (Number(item.amount) || 0),
    0,
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="journal_reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference No.</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <FormControl>
                <DatePicker form={form} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="partner_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partner Category</FormLabel>
              <AppSelect
                options={[
                  { value: "bank", label: "Bank" },
                  { value: "customer", label: "Customer" },
                  { value: "employee", label: "Employee" },
                  { value: "supplier", label: "Supplier" },
                  { value: "agent", label: "Agent" },
                ]}
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  setValue("partner", "");
                }}
              />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="partner"
          render={({ field }) => {
            const currentType = watch("partner_type");
            return (
              <FormItem>
                <FormLabel>Select {currentType || "Partner"}</FormLabel>
                <AppSelect
                  disabled={!currentType}
                  options={
                    useModel(currentType as any, { mode: "select" }).options
                  }
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                />
              </FormItem>
            );
          }}
        />
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Expense Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Type</TableHead>
              <TableHead>Detail (Account, Nominal, Desc)</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemFields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <AppSelect
                    options={[
                      { label: "Biaya", value: "biaya" },
                      { label: "Umum", value: "umum" },
                    ]}
                    value={watch(`items.${index}.type`)}
                    onValueChange={(val) =>
                      setValue(`items.${index}.type`, val)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="grid grid-cols-3 gap-2">
                    <AccountSelect
                      name={`items.${index}.account_id`}
                      form={form}
                    />
                    <Input
                      type="number"
                      {...register(`items.${index}.amount`)}
                      placeholder="Nominal"
                    />
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="Keterangan"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => removeItem(index)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendItem({
              type: "biaya",
              account_id: "",
              amount: 0,
              description: "",
            })
          }
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-medium mb-4">Expense Payments</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Type</TableHead>
              <TableHead>Detail (Account, Nominal, Desc)</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentFields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <AppSelect
                    options={[
                      { label: "Tunai", value: "cash" },
                      { label: "Setoran Bank/Transfer", value: "transfer" },
                      { label: "Warkat Bank", value: "clearing" },
                    ]}
                    value={watch(`payments.${index}.type`)}
                    onValueChange={(val) =>
                      setValue(`payments.${index}.type`, val)
                    }
                  />
                </TableCell>
                <TableCell>
                  <div className="grid grid-cols-3 gap-2">
                    <AppSelect
                      value={watch(`payments.${index}.wallet_id`)}
                      onValueChange={(val) =>
                        setValue(`payments.${index}.wallet_id`, val)
                      }
                      options={walletOptions || []}
                    />
                    <Input
                      type="number"
                      {...register(`payments.${index}.amount`)}
                      placeholder="Nominal"
                    />
                    <Input
                      {...register(`payments.${index}.description`)}
                      placeholder="Keterangan"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => removePayment(index)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            appendPayment({
              type: "cash",
              wallet_id: "",
              amount: 0,
              description: "",
            })
          }
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Payment
        </Button>
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end p-4 bg-muted rounded-lg">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Expense</p>
          <p className="text-2xl font-bold">
            Rp {totalAmount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ExpenseForm({ expenseId }: { expenseId?: string }) {
  return (
    <EntityForm<ExpenseFormValues>
      title={expenseId ? "Edit Expense" : "Add New Expense"}
      schema={ExpenseSchema}
      id={expenseId}
      endpoint="/expense"
      defaultValues={{
        journal_reference: "",
        date: new Date().toISOString().split("T")[0],
        partner_type: "",
        partner: "",
        items: [{ type: "biaya", account_id: "", description: "", amount: 0 }],
        payments: [{ type: "cash", wallet_id: "", amount: 0, description: "" }],
        description: "",
      }}
    >
      {(form) => <ExpenseFormContent form={form} />}
    </EntityForm>
  );
}
