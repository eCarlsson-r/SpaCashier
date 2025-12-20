"use client";

import { BranchSchema } from "@/lib/schemas";
import { EntityForm } from "@/components/shared/EntityForm";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import api from "@/lib/api";
import { useBranch } from "@/hooks/useBranch";

export default function BranchFormPage({ params }: { params: { branchId: string } }) {
    const isEdit = params.branchId !== "new";

    // Fetch data if isEdit is true (TanStack Query)
    const { data: branch, isLoading } = useBranch(params.branchId);

    const handleSubmit = async (values: any) => {
        if (isEdit) {
            await api.put(`/branches/${params.branchId}`, values);
        } else {
            await api.post("/branches", values);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{isEdit ? "Edit Branch" : "Add New Branch"}</h1>

            <EntityForm
                schema={BranchSchema}
                initialData={branch}
                onSubmit={handleSubmit}
            >
                {(form) => (
                    <>
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
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
            </EntityForm>
        </div>
    );
}