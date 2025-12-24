"use client";
import { useState } from "react";
import { Button } from "@/ui/button";
import { FilePlus, Banknote, Trash2 } from "lucide-react";
import { AppSelect } from "@/components/shared/AppSelect";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useModel } from "@/hooks/useModel";
import { toast } from "sonner";

interface SalesItem {
    treatment_id: number | string;
    treatment_name: string;
    description: string;
    quantity: number;
    price: number;
    discount: number;
}

const TotalRow = ({ label, value, highlight = false }: { label: string, value: number, highlight?: boolean }) => (
    <div className={`flex justify-between py-1 ${highlight ? 'border-t-2 border-gray-800 mt-2 pt-2' : ''}`}>
        <span className={`text-sm ${highlight ? 'font-bold' : 'text-gray-600'}`}>{label}</span>
        <span className={`text-sm ${highlight ? 'font-bold text-lg' : 'font-medium'}`}>
            {new Intl.NumberFormat('id-ID').format(value)}
        </span>
    </div>
);

export default function SalesForm() {
    const form = useForm();
    const [items, setItems] = useState<SalesItem[]>([]); // The treatment list table

    const branches = useModel("branch", { mode: "select" }).options;
    const customers = useModel("customer", { mode: "select" }).options;
    const employees = useModel("employee", { mode: "select" }).options;
    const treatments = useModel("treatment", { mode: "table" }).data;
    const treatmentOptions = useModel("treatment", { mode: "select" }).options;

    // Helper to format currency
    const formatCurr = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deduction = form.watch("deduction_amount") || 0;
    const grandTotal = subtotal - deduction;
    const rounding = Math.ceil(grandTotal / 100) * 100 - grandTotal;

    const handleAddToList = () => {
        const values = form.getValues();
        const treatment = treatments.find(t => t.id === values.treatment_id);

        if (!treatment) return toast.error("Please select a treatment first");

        const isVoucher = values.redeemer === "voucher";
        let dynamicDescription = "";

        if (isVoucher) {
            if (!values.voucher_start_code) return toast.error("Voucher Code is required");

            // Calculate the range of voucher numbers
            const qty = parseInt(values.quantity) || 1;
            const startNum = parseInt(values.voucher_start_code.split(treatment.id)[1]);

            if (isNaN(startNum)) return toast.error("Starting code must be a number");

            // Format: "Nomor Voucher 1001 - 1012"
            const endNum = startNum + qty - 1;
            dynamicDescription = qty > 1
                ? `Nomor Voucher ${treatment.id + (("0000000000" + (startNum)).slice(-6))} - ${treatment.id + (("0000000000" + (endNum)).slice(-6))}`
                : `Nomor Voucher ${treatment.id + (("0000000000" + (startNum)).slice(-6))}`;
        } else {
            // Format: "Walk In Aromatherapy Massage 1.5 Jam"
            dynamicDescription = `Walk In ${treatment.treatment_name}`;
        }

        setItems(prev => [...prev, {
            treatment_id: treatment.id,
            treatment_name: treatment.name,
            description: dynamicDescription,
            price: Number(treatment.price),
            quantity: parseInt(values.quantity) || 1,
            discount: 0,
            isVoucher: isVoucher,
            start_code: values.voucher_start_code
        }]);

        // Clear specific fields after adding
        form.setValue("treatment_id", "");
        form.setValue("voucher_start_code", "");
    };

    return (
        <Form {...form}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">Sales</h1>
                <div className="flex gap-2">
                    <Button variant="outline"><FilePlus size={16} /> New</Button>
                    <Button className="bg-green-600 text-white"><Banknote size={16} /> Pay</Button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Left Column: Core Details */}
                <div className="col-span-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="branch"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Branch</FormLabel>
                                <FormControl>
                                    <AppSelect options={branches} {...field} onValueChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="customer_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        <AppSelect options={customers} {...field} onValueChange={field.onChange} />
                                        <Button size="icon" variant="outline">+</Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Middle Column: Employee & Discounts */}
                <div className="col-span-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="employee_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Employee</FormLabel>
                                <FormControl>
                                    <AppSelect options={employees} {...field} onValueChange={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="discount_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Discount Code</FormLabel>
                                <FormControl>
                                    <div className="flex gap-2">
                                        <Input placeholder="Enter code" />
                                        <Button variant="outline">Apply</Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Right Column: Totals (Read Only) */}
                <div className="col-span-4 space-y-2 bg-gray-50 p-4 rounded border">
                    <TotalRow label="Subtotal" value={subtotal} />
                    <TotalRow label="Deduction" value={0} />
                    <TotalRow label="Rounding" value={0} />
                    <TotalRow label="Grand Total" value={grandTotal} highlight />
                </div>
            </div>

            {/* Item Adder Row */}
            <div className="grid grid-cols-12 gap-4 items-end bg-blue-50/50 p-4 rounded border-blue-100">
                <div className="col-span-4">
                    <FormField
                        control={form.control}
                        name="treatment_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-bold">Treatment</FormLabel>
                                <FormControl>
                                    <AppSelect options={treatmentOptions} {...field} onValueChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="col-span-1">
                    <label className="text-sm font-bold">Quantity</label>
                    <Input type="number" {...form.register("quantity")} defaultValue={1} />
                </div>

                <div className="col-span-2">
                    <FormField
                        control={form.control}
                        name="redeemer"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-bold">Redeemer</FormLabel>
                                <FormControl>
                                    <AppSelect
                                        options={[
                                            { label: "Pengunjung Walk-In", value: "walk-in" },
                                            { label: "Voucher", value: "voucher" }
                                        ]}
                                        {...field}
                                        onValueChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Conditional Field: Only shows if Redeemer is 'voucher' */}
                {form.watch("redeemer") === "voucher" && (
                    <div className="col-span-3">
                        <FormField
                            control={form.control}
                            name="voucher_start_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-bold">Voucher Code starts from</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter start code..." {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="col-span-2">
                    <Button type="button" onClick={handleAddToList} className="w-full">Add to List</Button>
                </div>
            </div>

            {/* The Data Table */}
            <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-2 text-left">Treatment</th>
                            <th className="p-2 text-left">Quantity</th>
                            <th className="p-2 text-left">Price</th>
                            <th className="p-2 text-left">Discount</th>
                            <th className="p-2 text-left">Total</th>
                            <th className="p-2 text-left">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {items.map((item, index) => (
                            <tr key={index} className="text-[13px]">
                                {/* Treatment Code & Name Column */}
                                <td className="p-2 border border-gray-300 w-1/4">
                                    <div className="font-semibold uppercase">{item.treatment_id}</div>
                                    <div>{item.treatment_name}</div>
                                </td>

                                <td className="p-2 border border-gray-300 text-center w-20">
                                    {item.quantity}
                                </td>

                                <td className="p-2 border border-gray-300 text-right">
                                    Rp. {formatCurr(item.price)},-
                                </td>

                                <td className="p-2 border border-gray-300 text-right">
                                    Rp. {formatCurr(item.discount)},-
                                </td>

                                {/* Total per Line Column */}
                                <td className="p-2 border border-gray-300 text-right">
                                    Rp. {formatCurr(item.price * item.quantity)},-
                                </td>

                                {/* Dynamic Description Column */}
                                <td className="p-2 border border-gray-300 italic text-gray-600">
                                    {item.description}
                                </td>

                                {/* Delete Action */}
                                <td className="p-2 border border-gray-300 text-center w-12">
                                    <button
                                        type="button"
                                        onClick={() => setItems(items.filter((_, i) => i !== index))}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <Trash2 size={18} strokeWidth={3} /> {/* Blue X-style icon */}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Form >
    );
}