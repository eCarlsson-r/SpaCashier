"use client";

import { EntityForm } from "../shared/EntityForm";
import { CustomerSchema } from "@/lib/schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { AccountSelect } from "../shared/AccountSelect";
import { DatePicker } from "../shared/DatePicker";
import { AppSelect } from "../shared/AppSelect";

export function CustomerForm({ customerId }: { customerId?: string }) {
    return (
        <EntityForm
            title={customerId ? "Edit Customer" : "Add New Customer"}
            schema={CustomerSchema}
            id={customerId}
            endpoint="/customer"
            defaultValues={{
                name: "", gender: "M", address: "", place_of_birth: "", date_of_birth: "", email: "", mobile: "", liability_account: ""
            }}
        >
            {(form) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-6">
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
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <FormControl><AppSelect options={[
                                        { value: "M", label: "Male" },
                                        { value: "F", label: "Female" }
                                    ]} value={field.value} onValueChange={field.onChange} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="place_of_birth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Place of Birth</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date_of_birth"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <FormControl><DatePicker {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="mobile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mobile Number</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>E-mail address</FormLabel>
                                    <FormControl><Input {...field} type="email" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <AccountSelect
                            form={form}
                            name="liability_account"
                            label="Liability Account"
                            typeFilter="account-receivable"
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            )}
        </EntityForm >
    );
}