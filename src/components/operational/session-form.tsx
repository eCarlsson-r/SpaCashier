"use client"
import { useForm, FormProvider } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { AppSelect } from "@/components/shared/AppSelect";
import { useModel } from "@/hooks/useModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function SessionForm({ sessionId }: { sessionId?: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const methods = useForm({
        defaultValues: {
            reserved_at: "",
            payment: "walk-in", // From your image
            walkin_id: "",
            voucher_id: "",
            customer_id: "",
            treatment_id: "",
            room_id: "",
            bed_id: "",
            employee_id: "",
            start: "",
        }
    });

    const { control, watch, setValue } = methods;
    const paymentType = watch("payment");

    // Top-level hooks to avoid "Rendered more hooks" error
    const { data: walkins, options: walkinOptions } = useModel("walkin", { mode: 'select' });

    const handleWalkinChange = (walkinId: string) => {
        // 1. Set the Walkin ID itself
        setValue("walkin_id", walkinId);

        // 2. Find the full record from your data
        const selectedWalkin = walkins?.find(w => w.value.toString() === walkinId);

        if (selectedWalkin) {
            // 3. Auto-populate Customer and Treatment
            setValue("customer_id", selectedWalkin.customer_id.toString());
            setValue("treatment_id", selectedWalkin.treatment_id.toString());
        }
    };

    const handleVoucherLookup = async (code: string) => {
        if (code.length < 3) return; // Don't trigger for very short inputs

        try {
            // Replace with your actual API endpoint
            const response = await api.get(`/voucher/${code}`);
            const voucher = response.data;

            if (voucher) {
                // 1. Auto-fill the linked data
                setValue("customer_id", voucher.customer_id.toString());
                setValue("treatment_id", voucher.treatment_id.toString());

                toast.success(`Voucher verified for ${voucher.customer_name}`);
            }
        } catch (error) {
            // Optional: clear fields if voucher is invalid
            console.error("Voucher not found");
        }
    };

    // 1. Fetch Rooms (which include their nested beds)
    const { data: rooms } = useModel("room", { mode: 'select', params: {show: 'empty'} });

    // 2. Watch which Room ID is currently selected
    const selectedRoomId = watch("room_id");

    // 3. Find the specific Room object from the list
    const selectedRoom = rooms?.find(r => r.id.toString() === selectedRoomId);

    // 4. Map the nested beds to the format AppSelect needs
    const bedOptions = selectedRoom?.bed?.map((bed: any) => ({
        label: bed.name,
        value: bed.id.toString()
    })) || [];

    const queryClient = useQueryClient();

    const onSubmit = async (data: any) => {
        try {
            // 1. Show a loading state (optional but recommended)
            setIsLoading(true);

            // 2. Post to your SessionController
            const response = await api.post('/session', {
                ...data,
                // Ensure IDs are numbers if your Laravel DB expects integers
                customer_id: data.customer_id,
                treatment_id: data.treatment_id,
                bed_id: data.bed_id,
                walkin_id: data.walkin_id,
            });

            if (response.status === 201) {
                toast.success("Session started successfully!");

                // 3. IMPORTANT: Refresh your global data
                // This removes the bed from "available" lists across the app
                queryClient.invalidateQueries({ queryKey: ['room'], exact: false });
                queryClient.invalidateQueries({ queryKey: ['session'], exact: false });
                queryClient.invalidateQueries({ queryKey: ['walkin'], exact: false });

                router.push('/operational/session');
            }
        } catch (error) {
            toast.error("Failed to start session. Please check bed availability.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormProvider {...methods}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">Create New Session</h1>
                <Button type="submit" className="bg-sky-600 hover:bg-sky-700" onClick={() => onSubmit(methods.getValues())}>
                    Submit
                </Button>
            </div>

            <form className="space-y-3 bg-white border rounded-sm p-4 shadow-sm" >
                {/* Horizontal Row Example: Reserved */}
                <div className="grid grid-cols-12 items-center gap-4">
                    <label className="col-span-2 text-sm text-gray-600">Reserved</label>
                    <div className="col-span-10">
                        <Input type="time" {...methods.register("reserved_at")} />
                    </div>
                </div>

                {/* Horizontal Row: Pembayaran & Walk-in Select */}
                <div className="grid grid-cols-12 items-center gap-4">
                    <label className="col-span-2 text-sm text-gray-600">Pembayaran</label>
                    <div className="col-span-4">
                        <FormField
                            control={control}
                            name="payment"
                            render={({ field }) => (
                                <AppSelect
                                    {...field}
                                    options={[{ label: 'Voucher', value: 'voucher' }, { label: 'Walk-in', value: 'walk-in' }]}
                                    value={field.value}
                                    onValueChange={(val) => setValue("payment", val)}
                                />
                            )}
                        />
                    </div>
                    <div className="col-span-6">
                        {paymentType === "walk-in" ? (
                            <FormField
                                control={control}
                                name="walkin_id"
                                render={({ field }) => (
                                    <AppSelect
                                        {...field}
                                        placeholder="Silahkan pilih perawatan walk-in."
                                        options={walkinOptions}
                                        value={field.value?.toString()}
                                        onValueChange={handleWalkinChange}
                                    />
                                )}
                            />
                        ) : (
                            <FormField
                                control={control}
                                name="voucher_id"
                                render={({ field }) => (
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Scan atau ketik kode voucher..."
                                            // Trigger lookup when user clicks away or scanner finishes
                                            onBlur={(e) => handleVoucherLookup(e.target.value)}
                                            // Optional: Trigger on every change if using a high-speed scanner
                                            onChange={(e) => {
                                                field.onChange(e); // Keep hook-form updated
                                                if (e.target.value.length > 8) handleVoucherLookup(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                )}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-4">
                    <label className="col-span-2 text-sm text-gray-600">Customer</label>
                    <div className="col-span-10">
                        <FormField
                            control={methods.control}
                            name="customer_id"
                            render={({ field }) => (
                                <FormItem>
                                    <AppSelect
                                        {...field}
                                        placeholder="Silahkan pilih customer."
                                        options={useModel("customer", { mode: 'select' }).options}
                                        onValueChange={(val) => setValue("customer_id", val)}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-4">
                    <label className="col-span-2 text-sm text-gray-600">Treatment</label>
                    <div className="col-span-10">
                        <FormField
                            control={methods.control}
                            name="treatment_id"
                            render={({ field }) => (
                                <FormItem>
                                    <AppSelect
                                        {...field}
                                        options={useModel("treatment", { mode: 'select' }).options}
                                        onValueChange={(val) => setValue("treatment_id", val)}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-12 items-center gap-4">
                    <label className="col-span-2 text-sm text-gray-600">Bed</label>
                    <div className="col-span-4">
                        {/* Room Selector */}
                        <FormField
                            control={methods.control}
                            name="room_id"
                            render={({ field }) => (
                                <FormItem>
                                    <AppSelect
                                        {...field}
                                        placeholder="Please select a room"
                                        options={rooms?.map(r => ({ label: r.name, value: r.id.toString() }))}
                                        disabled={!selectedRoomId || bedOptions.length === 0}
                                        onValueChange={field.onChange}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="col-span-6">
                        {/* Bed Selector (Populated from the selected room's array) */}
                        <FormField
                            control={methods.control}
                            name="bed_id"
                            render={({ field }) => (
                                <FormItem>
                                    <AppSelect
                                        {...field}
                                        placeholder={selectedRoomId ? "Select a bed" : "Please select a room first"}
                                        options={bedOptions}
                                        disabled={!selectedRoomId || bedOptions.length === 0}
                                        onValueChange={field.onChange}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* therapist selection from your image */}
                <div className="grid grid-cols-12 items-center gap-4">
                    <label className="col-span-2 text-sm text-gray-600">Therapist</label>
                    <div className="col-span-10">
                        <FormField
                            control={methods.control}
                            name="employee_id"
                            render={({ field }) => (
                                <FormItem>
                                    <AppSelect
                                        {...field}
                                        options={useModel("employee", { mode: 'select' }).options}
                                        onValueChange={field.onChange}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Horizontal Row Example: Reserved */}
                <div className="grid grid-cols-12 items-center gap-4">
                    <label className="col-span-2 text-sm text-gray-600">Mulai</label>
                    <div className="col-span-10">
                        <Input type="time" {...methods.register("start")} />
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}