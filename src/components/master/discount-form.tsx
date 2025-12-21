"use client";

import { EntityForm } from "../shared/EntityForm";
import { DiscountSchema } from "@/lib/schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { AppSelect } from "../shared/AppSelect";
import { AccountSelect } from "../shared/AccountSelect";
import { DatePicker } from "../shared/DatePicker";

export function DiscountForm({ discountId }: { discountId?: string }) {
    return (
        <EntityForm
            title={discountId ? "Edit Discount" : "Add New Discount"}
            schema={DiscountSchema}
            id={discountId}
            endpoint="/discount"
            defaultValues={{
                name: "", type: "POTONGAN", percent: 0, amount: 0, quantity: 0, expiry_date: new Date()
            }}
        >
            {(form) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <FormLabel>Discount Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Type</FormLabel>
                                    <FormControl>
                                        <AppSelect options={[
                                            { value: "POTONGAN", label: "Discount" },
                                            { value: "CASHBACK", label: "Cashback" }
                                        ]} value={field.value} onValueChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <AccountSelect
                            form={form}
                            name="account_id"
                            label="Cashback Account"
                            typeFilter="income"
                        />
                    </div>

                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="percent"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Percent</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Amount</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Quantity</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DatePicker
                            form={form}
                            name="expiry_date"
                            label="Discount Expiry Date"
                        />
                    </div>
                </div>
            )}
        </EntityForm >
    );
}