"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AccountSelect } from "./AccountSelect";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "../ui/input";
import { AppSelect } from "./AppSelect";
import { useModel } from "@/hooks/useModel";

interface EntityModalProps {
    type: "bank" | "wallet";
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
    initialData?: any; // Add this to pass existing record
}

export function EntityModal({ type, isOpen, onClose, onSuccess, initialData }: EntityModalProps) {
    const [loading, setLoading] = useState(false);// Fetch bank options specifically for the Wallet dropdown
    const { options: bankOptions } = useModel("bank", { mode: "select" });

    const isEdit = !!initialData;
    const form = useForm({
        defaultValues: {
            id: "",
            bank_account_number: "",
            name: "",
            bank_id: "",
            account_id: "",
            has_edc: "no"
        }
    });

    // Reset form whenever initialData changes or modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Pre-fill fields with existing record data
                form.reset({
                    id: initialData.id || "",
                    name: initialData.name || "",
                    account_id: initialData.account_id?.toString() || "",
                    bank_account_number: initialData.bank_account_number || "",
                    bank_id: initialData.bank_id?.toString() || "",
                    has_edc: initialData.has_edc || "no"
                });
            } else {
                // Clear fields for "Add New"
                form.reset({
                    id: "",
                    name: "",
                    account_id: "",
                    bank_account_number: "",
                    bank_id: "",
                    has_edc: "no"
                });
            }
        }
    }, [initialData, isOpen, form]);

    const onSubmit = async (data: any) => {
        setLoading(true);
        try {
            const endpoint = type === "bank" ? "/api/bank" : "/api/wallet";

            if (isEdit) {
                // Use PUT or PATCH for updates
                await axios.put(`${endpoint}/${initialData.id}`, data);
            } else {
                await axios.post(endpoint, data);
            }

            onSuccess(data);
            onClose();
        } catch (error) {
            console.error("Submission failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Edit ${type}` : `Add New ${type}`}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-2">
                            {type === "bank" && (
                                <FormField
                                    control={form.control}
                                    name="id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kode Bank</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {type === "wallet" && (
                                <FormField
                                    control={form.control}
                                    name="bank_account_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>No. Rekening</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="0000-0000" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            )}

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{type === "wallet" ? "Atas Nama" : "Name"}</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={type === "wallet" ? "Account holder name" : "Name"} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {type === "wallet" && (
                                <FormField
                                    control={form.control}
                                    name="bank_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bank</FormLabel>
                                            <FormControl>
                                                <AppSelect
                                                    options={bankOptions}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="Select a bank..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {type === "wallet" && (
                                <FormField
                                    control={form.control}
                                    name="account_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account</FormLabel>
                                            <FormControl>
                                                <AccountSelect
                                                    form={form}
                                                    name="account_id"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {type === "wallet" && (
                                <FormField
                                    control={form.control}
                                    name="has_edc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Has EDC</FormLabel>
                                            <FormControl>
                                                <AppSelect
                                                    options={[
                                                        { value: "yes", label: "Yes" },
                                                        { value: "no", label: "No" },
                                                    ]}
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    placeholder="Select an option..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700">
                                {isEdit ? "Update Changes" : "Save New"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}