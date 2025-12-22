"use client";

import { EntityForm } from "../shared/EntityForm";
import { AgentSchema } from "@/lib/schemas";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { AppSelect } from "../shared/AppSelect";
import { AccountSelect } from "../shared/AccountSelect";
import { DatePicker } from "../shared/DatePicker";
import { Textarea } from "../ui/textarea";

export function AgentForm({ agentId }: { agentId?: string }) {
    return (
        <EntityForm
            title={agentId ? "Edit Agent" : "Add New Agent"}
            schema={AgentSchema}
            id={agentId}
            endpoint="/agent"
            defaultValues={{
                name: "", type: "POTONGAN", percent: 0, amount: 0, quantity: 0, expiry_date: new Date()
            }}
        >
            {(form) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-6 col-span-2">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Address</FormLabel>
                                    <FormControl><Textarea {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent City</FormLabel>
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
                                    <FormLabel>Agent Email</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6">
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Phone</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="commission"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Commission</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
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
                                    <FormLabel>Agent Mobile</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="discount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Discount</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-6 col-span-2">
                        <FormField
                            control={form.control}
                            name="liability_account"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Agent Liability Account</FormLabel>
                                    <FormControl><AccountSelect form={form} name="liability_account" /></FormControl>
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