"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/ui/form";
import { Button } from "@/ui/button";
import { Loader2 } from "lucide-react";

interface EntityFormProps<T extends z.ZodType<any, any>> {
    schema: T;
    initialData?: z.infer<T> | null;
    onSubmit: (values: z.infer<T>) => Promise<void>;
    children: (form: UseFormReturn<z.infer<T>>) => React.ReactNode;
    loading?: boolean;
}

export function EntityForm<T extends z.ZodType<any, any>>({
    schema,
    initialData,
    onSubmit,
    children,
    loading = false,
}: EntityFormProps<T>) {

    const form = useForm<z.infer<T>>({
        resolver: zodResolver(schema),
        defaultValues: initialData || {},
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {children(form)}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset
                    </Button>
                    <Button type="submit" className="bg-teal-600" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Record" : "Create Record"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}