"use client";

import { EntityForm } from "../shared/EntityForm";
import { AccountSchema } from "@/lib/schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ACCOUNT_TYPES } from "@/lib/validations/account";

export function AccountForm({ accountId }: { accountId?: string }) {
    return (
        <EntityForm
            title={accountId ? "Edit Account" : "Add New Account"}
            schema={AccountSchema}
            id={accountId}
            endpoint="/account"
            defaultValues={{
                name: "", type: "cash", category: "cash"
            }}
        >
            {(form) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Name</FormLabel>
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
                                <FormLabel>Account Type</FormLabel>
                                <FormControl><Select onValueChange={field.onChange} defaultValue={field.value} >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an account type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACCOUNT_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account Category</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}
        </EntityForm >
    );
}