import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { AppSelect } from "../shared/AppSelect";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../ui/table";
import { useModel } from "@/hooks/useModel";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import api from "@/lib/api";

export const SalesCart = ({ items, setItems, treatmentOptions }: any) => {
    const form = useFormContext(); // Access the parent's form state
    const treatments = useModel("treatment", { mode: "table" }).data;

    const handleAddToList = async () => {
        const values = form.getValues();
        const treatment = treatments.find(t => t.id === values.treatment_id);

        if (!treatment) return toast.error("Please select a treatment first");

        const isVoucher = values.redeem_type === "voucher";
        let dynamicDescription = "";
        let voucherStart = "";
        let voucherEnd = "";

        if (isVoucher) {
            if (!values.voucher_start_code) return toast.error("Voucher Code is required");
            const voucherDetails = await api.get(
                `/voucher/${values.voucher_start_code}`,
                { params: { quantity: values.quantity } }
            );

            if (voucherDetails.data.filter((v: any) => v.sales_id > 0).length > 0) {
                return toast.error("Voucher already sold.");
            }
            // Calculate the range of voucher numbers
            const qty = parseInt(values.quantity) || 1;
            const startNum = parseInt(values.voucher_start_code.split(treatment.id)[1]);
            if (isNaN(startNum)) return toast.error("Starting code must be a number");
            const endNum = startNum + qty - 1;
            voucherStart = treatment.id + (("0000000000" + (startNum)).slice(-6));
            voucherEnd = treatment.id + (("0000000000" + (endNum)).slice(-6));

            dynamicDescription = qty > 1
                ? `Nomor Voucher ${voucherStart} - ${voucherEnd}`
                : `Nomor Voucher ${voucherStart}`;
        } else {
            dynamicDescription = `Walk In ${treatment.name}`;
        }

        setItems((prev: any) => [...prev, {
            treatment_id: treatment.id,
            treatment_name: treatment.name,
            description: dynamicDescription,
            price: Number(treatment.price),
            quantity: parseInt(values.quantity) || 1,
            discount: 0,
            redeem_type: values.redeem_type || "walkin",
            total_price: Number(treatment.price) * (parseInt(values.quantity) || 1),
            voucher_start: voucherStart,
            voucher_end: voucherEnd
        }]);

        // Clear specific fields after adding
        form.setValue("treatment_id", "");
        form.setValue("voucher_start_code", "");
    };
    // Helper to format currency
    const formatCurr = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    return (
        <div className="space-y-6">
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
                                <FormMessage />
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
                        name="redeem_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-bold">Redeemer</FormLabel>
                                <FormControl>
                                    <AppSelect
                                        options={[
                                            { label: "Pengunjung Walk-In", value: "walkin" },
                                            { label: "Voucher", value: "voucher" }
                                        ]}
                                        {...field}
                                        onValueChange={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Conditional Field: Only shows if Redeemer is 'voucher' */}
                {form.watch("redeem_type") === "voucher" && (
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <div className="col-span-2">
                    <Button type="button" onClick={handleAddToList} className="w-full bg-sky-600 hover:bg-sky-700">Add to List</Button>
                </div>
            </div>

            {/* The Data Table */}
            <Table className="w-full text-sm">
                <TableHeader className="bg-sky-100 border-b">
                    <TableRow>
                        <TableHead className="p-2 text-left">Treatment</TableHead>
                        <TableHead className="p-2 text-left">Quantity</TableHead>
                        <TableHead className="p-2 text-left">Price</TableHead>
                        <TableHead className="p-2 text-left">Discount</TableHead>
                        <TableHead className="p-2 text-left">Total</TableHead>
                        <TableHead className="p-2 text-left">Description</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-200 bg-white">
                    {items.map((item: any, index: number) => (
                        <TableRow key={index} className="text-[13px]">
                            {/* Treatment Code & Name Column */}
                            <TableCell className="p-2 border border-gray-300 w-1/4">
                                <div className="font-semibold uppercase">{item.treatment_id}</div>
                                <div>{item.treatment_name}</div>
                            </TableCell>

                            <TableCell className="p-2 border border-gray-300 text-center w-20">
                                {item.quantity}
                            </TableCell>

                            <TableCell className="p-2 border border-gray-300 text-right">
                                Rp. {formatCurr(item.price)},-
                            </TableCell>

                            <TableCell className="p-2 border border-gray-300 text-right">
                                Rp. {formatCurr(item.discount)},-
                            </TableCell>

                            {/* Total per Line Column */}
                            <TableCell className="p-2 border border-gray-300 text-right">
                                Rp. {formatCurr(item.price * item.quantity)},-
                            </TableCell>

                            {/* Dynamic Description Column */}
                            <TableCell className="p-2 border border-gray-300 italic text-gray-600">
                                {item.description}
                            </TableCell>

                            {/* Delete Action */}
                            <TableCell className="p-2 border border-gray-300 text-center w-12">
                                <button
                                    type="button"
                                    onClick={() => setItems(items.filter((_: any, i: number) => i !== index))}
                                    className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={18} strokeWidth={3} /> {/* Blue X-style icon */}
                                </button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}