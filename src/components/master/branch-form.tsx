"use client";

import { EntityForm } from "../shared/EntityForm";
import { BranchSchema } from "@/lib/schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AccountSelect } from "../shared/AccountSelect";
import { ImagePreview } from "../shared/ImagePreview";

export function BranchForm({ branchId }: { branchId?: string }) {
    return (
        <EntityForm
            title={branchId ? "Edit Branch" : "Add New Branch"}
            schema={BranchSchema}
            id={branchId}
            endpoint="/branch"
            defaultValues={{
                name: "", address: "", city: "Medan", country: "Indonesia",
                phone: "", description: "", cash_account: "1",
                walkin_account: "", voucher_purchase_account: "", voucher_usage_account: ""
            }}
        >
            {(form) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* General Info */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Branch Name</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
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
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Address</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
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
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Accounting Accounts - Use Selects here later */}
                    <div className="md:col-span-2 border-t pt-4 mt-2">
                        <h3 className="text-sm font-semibold mb-3">Accounting Mapping</h3>

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
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <ImagePreview
                        label="Branch Image"
                        name="branch_img"
                        form={form}
                        currentImageUrl={form.getValues("branch_img")}
                    />
                </div>
            )}
        </EntityForm >
    );
}