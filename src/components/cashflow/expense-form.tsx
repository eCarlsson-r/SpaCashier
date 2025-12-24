"use client";
import { useModel } from "@/hooks/useModel";
import { Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { AccountSelect } from "@/components/shared/AccountSelect";
import { AppSelect } from "@/components/shared/AppSelect";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DatePicker } from "../shared/DatePicker";
import { Textarea } from "../ui/textarea";
import { useEffect } from "react";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function ExpenseForm({ expenseId }: { expenseId?: string }) {
    const { options: walletOptions } = useModel("wallet", { mode: "select" });

    const { data: expenseData, isLoading } = useQuery({
        queryKey: ['expense', expenseId],
        queryFn: () => api.get(`/expense/${expenseId}`).then(res => res.data),
        enabled: !!expenseId // Only fetch if we are editing
    });

    const methods = useForm({
        defaultValues: {
            journal_reference: "",
            date: new Date(),
            partner_type: "",
            partner: "",
            items: [{ type: "biaya", account_id: "", description: "", amount: 0 }],
            payments: [{ type: "cash", wallet_id: "", amount: 0, description: "" }],
            description: ""
        }
    });

    // This is the "Magic" that loads the data when the API responds
    useEffect(() => {
        if (expenseData) {
            methods.reset({
                ...expenseData,
                // Ensure dates are actual Date objects, not strings
                date: new Date(expenseData.date),
                items: expenseData.items?.map((p: any) => ({
                    ...p,
                    account_id: p.account_id?.toString()
                })),
                payments: expenseData.payments?.map((p: any) => ({
                    ...p,
                    wallet_id: p.wallet_id?.toString()
                }))
            });
        }
    }, [expenseData, methods]);

    const { control, register, watch, setValue, handleSubmit } = methods;

    const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
        control,
        name: "items"
    });

    const { fields: paymentFields, append: appendPayment, remove: removePayment } = useFieldArray({
        control,
        name: "payments"
    });

    const watchedItems = watch("items");
    const totalAmount = watchedItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    return (
        <FormProvider {...methods}>
            <form className="space-y-8" onSubmit={handleSubmit((data) => console.log(data))}>
                <FormField
                    control={control}
                    name="journal_reference"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Reference No.</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control} // or methods.control
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* 1. TOP HEADER SECTION */}
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
                                        { value: "agent", label: "Agent" }
                                    ]}
                                    value={field.value}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        setValue("partner", ""); // Reset right select
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
                                        // This dynamically fetches the list based on the left select
                                        options={useModel(currentType, { mode: "select" }).options}
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setValue("partner", val);
                                        }}
                                    />
                                </FormItem>
                            );
                        }}
                    />
                </div>

                {/* 2. EXPENSE ITEMS TABLE */}
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
                                                { label: "Umum", value: "umum" }
                                            ]}
                                            value={watch(`items.${index}.type`)}
                                            onValueChange={(val) => setValue(`items.${index}.type`, val)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* Dependent on Biaya/Umum inside AccountSelect? */}
                                            <AccountSelect name={`items.${index}.account_id`} form={methods} />

                                            <Input type="number" {...register(`items.${index}.amount`)} placeholder="Nominal" />
                                            <Input {...register(`items.${index}.description`)} placeholder="Keterangan" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" type="button" onClick={() => removeItem(index)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendItem({ type: "biaya", account_id: "", amount: 0, description: "" })} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </div>

                {/* 3. PAYMENTS TABLE */}
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
                                                { label: "Warkat Bank", value: "clearing" }
                                            ]}
                                            value={watch(`payments.${index}.type`)}
                                            onValueChange={(val) => setValue(`payments.${index}.type`, val)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="grid grid-cols-3 gap-2">
                                            <AppSelect
                                                value={watch(`payments.${index}.wallet_id`)}
                                                onValueChange={(val) => setValue(`payments.${index}.wallet_id`, val)}
                                                options={walletOptions}
                                            />

                                            <Input type="number" {...register(`payments.${index}.amount`)} placeholder="Nominal" />
                                            <Input {...register(`payments.${index}.description`)} placeholder="Keterangan" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" type="button" onClick={() => removePayment(index)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button type="button" variant="outline" size="sm" onClick={() => appendPayment({ type: "cash", wallet_id: "", amount: 0, description: "" })} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add Payment
                    </Button>
                </div>

                <FormField
                    control={control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end p-4 bg-muted rounded-lg">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Expense</p>
                        <p className="text-2xl font-bold">Rp {totalAmount.toLocaleString()}</p>
                    </div>
                </div>

                <Button className="bg-sky-600 hover:bg-sky-700" type="submit">Save Expense</Button>
            </form>
        </FormProvider>
    );
}