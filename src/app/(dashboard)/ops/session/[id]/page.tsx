"use client"
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { AppSelect } from "@/components/shared/AppSelect";
import { useGlobalOptions } from "@/hooks/useGlobalOptions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewSessionPage() {
    const { data: options, isLoading } = useGlobalOptions();
    if (isLoading) return <p>Loading options...</p>;
    const form = useForm({ defaultValues: { entry_type: 'walk-in' } });
    const entryType = form.watch("entry_type");

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Create New Session</h1>

            <Form {...form}>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border shadow-sm">
                    <AppSelect label="Branch" options={options.branches} name="branch_id" />
                    <AppSelect label="Therapist" options={options.employees} name="employee_id" />

                    <div className="col-span-2 border-t pt-4">
                        <h3 className="font-semibold mb-4">Entry Details</h3>
                        <AppSelect
                            label="Type"
                            options={[{ value: 'walk-in', label: 'Walk-in' }, { value: 'voucher', label: 'Voucher' }]}
                            name="entry_type"
                        />
                    </div>

                    {entryType === 'walk-in' ? (
                        <AppSelect label="Unused Walk-ins" options={options.walkins} name="walkin_id" />
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Voucher Barcode</label>
                            <Input placeholder="Scan now..." className="font-mono" />
                        </div>
                    )}

                    <Button className="col-span-2 mt-4">Start Session</Button>
                </form>
            </Form>
        </div>
    );
}