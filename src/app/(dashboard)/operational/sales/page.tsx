"use client";
import { useEffect, useState } from "react";
import { Button } from "@/ui/button";
import { FilePlus, Banknote, Trash2 } from "lucide-react";
import { AppSelect } from "@/components/shared/AppSelect";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useModel } from "@/hooks/useModel";
import { toast } from "sonner";
import api from "@/lib/api";
import { PaymentModal } from "@/components/operational/payment-modal";
import { SalesCart } from "@/components/operational/sales-cart";
import { ThermalReceipt } from "@/components/operational/thermal-receipt";
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

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
    const [selectedBranch, setSelectedBranch] = useState<any>(null); // This holds logo, address, etc.

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (items.length > 0) {
                const message = "You have items in the cart. Are you sure you want to leave?";
                e.preventDefault();
                e.returnValue = message; // Standard for most browsers
                return message;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // Cleanup the event listener when the component unmounts
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [items]);

    const banks = useModel("bank", { mode: "select" }).options;
    const branches = useModel("branch", { mode: "select" }).options;
    const customers = useModel("customer", { mode: "select" }).options;
    const employees = useModel("employee", { mode: "select" }).options;
    const treatmentOptions = useModel("treatment", { mode: "select" }).options;

    const [isPayModalOpen, setIsPayModalOpen] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deduction = form.watch("deduction_amount") || 0;

    // Step 1: Subtotal - Discount
    const netTotal = subtotal - deduction;

    // Step 2: Apply Rounding (to nearest 100)
    const grandTotal = Math.ceil(netTotal / 100) * 100;
    const rounding = grandTotal - netTotal;

    const handleApplyDiscount = async () => {
        const code = form.getValues("discount_code");
        const currentBranchId = form.getValues("branch");

        if (!code) return toast.error("Please enter a discount code");
        if (!currentBranchId) return toast.error("Please select a branch first");

        try {
            // Replace with your actual Laravel API route
            const response = await api.get(`/discount/${code}`);

            const { percent, amount, name, expiry_date } = response.data;
            // type: 'percentage' or 'fixed'

            if (expiry_date && (new Date() > new Date(expiry_date))) {
                return toast.error("Discount code expired");
            }
            let calculatedDeduction = 0;
            if (percent > 0 && amount > 0) {
                calculatedDeduction = (subtotal * percent) / 100 + amount;
            } else if (percent > 0 && amount == 0) {
                calculatedDeduction = (subtotal * percent) / 100;
            } else if (amount > 0 && percent == 0) {
                calculatedDeduction = amount;
            }

            form.setValue("deduction_amount", calculatedDeduction);
            toast.success(`Discount "${name}" applied!`);
        } catch (error: any) {
            const message = error.response?.data?.message || "Invalid discount code";
            toast.error(message);
            form.setValue("deduction_amount", 0);
        }
    };

    // Using a useEffect to watch subtotal changes
    useEffect(() => {
        const deductionAmount = form.getValues("deduction_amount");
        const code = form.getValues("discount_code");

        // If a discount is already active, you may want to re-run the logic
        // to update the deduction if the subtotal has grown.
        if (code && deductionAmount > 0) {
            handleApplyDiscount();
        }
    }, [subtotal]);

    const handleNewSale = () => {
        // 1. Reset the react-hook-form state to initial values
        form.reset({
            branch: "",
            customer: "",
            employee: "",
            treatment_id: "",
            quantity: 1,
            redeem_type: "walkin",
            discount_code: "",
            deduction_amount: 0, // Crucial: clear the discount value
            voucher_start_code: ""
        });

        // 2. Clear the table items
        setItems([]);

        toast.info("Form cleared for new transaction");
    };

    const [currentSaleId, setCurrentSaleId] = useState<number | null>(null);

    const handleProcessSale = async (formData: any) => {
        try {
            const payload = {
                branch_id: formData.branch, // Make sure this is a plain object/value
                customer_id: formData.customer,
                employee_id: formData.employee,
                subtotal: subtotal,
                discount: deduction,
                rounding: rounding,
                total: netTotal,
                records: items
            };

            // Step 1: Create the Sale and SalesRecords
            const response = await api.post('/sales', payload);

            const newSaleId = response.data.id;
            setCurrentSaleId(newSaleId);

            // Step 2: Now that the records exist, open the payment modal
            setIsPayModalOpen(true);

        } catch (error) {
            toast.error("Failed to create sales record");
        }
    };

    const [paymentsAdded, setPaymentsAdded] = useState<any[]>([]);

    // Calculate these inside your component
    const totalPaidSoFar = paymentsAdded.reduce((acc, p) => acc + Number(p.amount), 0);
    // Change is only relevant if the total paid exceeds the grand total
    const changeAmount = totalPaidSoFar > grandTotal ? totalPaidSoFar - grandTotal : 0;

    const receiptRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Receipt_${Date.now()}`,
    });

    const [isReadyToPrint, setIsReadyToPrint] = useState(false);

    // This waits until the component has actually updated the UI
    useEffect(() => {
        if (isReadyToPrint && selectedBranch && currentSaleId) {
            handlePrint();
            setIsReadyToPrint(false); // Reset
            resetEntirePage();
        }
    }, [isReadyToPrint, selectedBranch, currentSaleId]);

    const resetEntirePage = () => {
        setItems([]);
        setPaymentsAdded([]);
        // Reset everything
        setIsPayModalOpen(false);
        handleNewSale();
    };

    const handleFinalize = async () => {
        try {
            let res = await api.put(`/sales/${currentSaleId}`, {
                id: currentSaleId,
                payments: paymentsAdded,
                change_amount: changeAmount, // Send this for accounting
                total_paid: totalPaidSoFar
            });

            if (res.status === 200) {
                setSelectedBranch(res.data.branch);
                setCurrentSaleId(res.data.income.journal_reference);
                setIsReadyToPrint(true); // This triggers the useEffect above
            }
        } catch (error) {
            toast.error("Finalization failed");
        }
    };

    return (
        <Form {...form}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">Sales</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleNewSale}><FilePlus size={16} /> New</Button>
                    <Button className="bg-green-600 text-white" onClick={() => handleProcessSale(form.getValues())}><Banknote size={16} /> Pay</Button>
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
                        name="customer"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex gap-2">
                                    <FormLabel>Customer</FormLabel>
                                    <Button size="icon" variant="outline">+</Button>
                                </div>
                                <FormControl>
                                    <AppSelect options={customers} {...field} onValueChange={field.onChange} />
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
                        name="employee"
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
                                        <Input {...form.register("discount_code")} placeholder="Enter code" />
                                        <Button type="button" variant="outline" onClick={handleApplyDiscount}>Apply</Button>
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
                    <TotalRow label="Deduction" value={deduction} />
                    <TotalRow label="Rounding" value={rounding} />
                    <TotalRow label="Grand Total" value={grandTotal} highlight />
                </div>
            </div>

            <SalesCart
                items={items} setItems={setItems}
                treatmentOptions={treatmentOptions}
            />

            <PaymentModal
                isOpen={isPayModalOpen}
                grandTotal={grandTotal}
                bankOptions={banks}
                paymentsAdded={paymentsAdded}
                setPaymentsAdded={setPaymentsAdded}
                onClose={() => setIsPayModalOpen(false)}
                onFinalize={handleFinalize}
            />

            {/* The Hidden Receipt Component */}
            <div className="hidden">
                <ThermalReceipt
                    ref={receiptRef}
                    receiptNumber={currentSaleId}
                    branch={selectedBranch} // Passes the object with Base64 logo
                    items={items}
                    payments={paymentsAdded}
                    changeAmount={changeAmount}
                />
            </div>
        </Form >
    );
}