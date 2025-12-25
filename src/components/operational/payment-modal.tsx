import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/AppSelect";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    grandTotal: number;
    bankOptions: any[];
    paymentsAdded: any[];
    setPaymentsAdded: (payments: any[]) => void;
    onFinalize: (payments: any[], change: number) => void;
}

export const PaymentModal = ({ isOpen, onClose, grandTotal, bankOptions, paymentsAdded, setPaymentsAdded, onFinalize }: PaymentModalProps) => {
    const [currentMethod, setCurrentMethod] = useState("");
    const [tempDetails, setTempDetails] = useState({
        amount: 0,
        card_type: "",
        card_edc: "",
        card_number: "",
        wallet_edc: "",
        mobile_number: "",
        voucher_provider: "",
        voucher_number: "",
        qr_edc: ""
    });

    // Calculations
    const totalPaid = useMemo(() => paymentsAdded.reduce((acc, p) => acc + p.amount, 0), [paymentsAdded]);
    const remaining = Math.max(0, grandTotal - totalPaid);
    const change = totalPaid > grandTotal ? totalPaid - grandTotal : 0;

    const handleAddSlice = () => {
        if (tempDetails.amount <= 0) return toast.error("Enter amount");

        const newSlice = {
            method: currentMethod,
            amount: tempDetails.amount,
            details: { ...tempDetails }
        };

        setPaymentsAdded([...paymentsAdded, newSlice]);

        // Reset Inputs
        setCurrentMethod("");
        setTempDetails({ amount: 0, card_type: "", card_edc: "", card_number: "", wallet_edc: "", mobile_number: "", voucher_provider: "", voucher_number: "", qr_edc: "" });
    };

    const removeSlice = (index: number) => {
        setPaymentsAdded(paymentsAdded.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Total: Rp. {grandTotal.toLocaleString()}</DialogTitle>
                </DialogHeader>

                {/* Summary Box */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border text-sm">
                    <div>
                        <span className="text-gray-500 block">Remaining</span>
                        <span className={`font-bold ${remaining > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            Rp. {remaining.toLocaleString()}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-gray-500 block">Change</span>
                        <span className="font-bold text-green-600">Rp. {change.toLocaleString()}</span>
                    </div>
                </div>

                {/* Input Section */}
                <div className="space-y-3 py-4">
                    <AppSelect
                        value={currentMethod}
                        placeholder="Select Method"
                        onValueChange={(v) => {
                            setCurrentMethod(v);
                            setTempDetails(prev => ({ ...prev, amount: remaining }));
                        }}
                        options={[
                            { value: "cash", label: "Cash" },
                            { value: "card", label: "Card" },
                            { value: "ewallet", label: "E-Wallet" },
                            { value: "voucher", label: "Third-party Voucher" },
                            { value: "qr", label: "QRIS" }
                        ]}
                    />

                    {currentMethod === 'card' && (
                        <div className="grid grid-cols-3 gap-2 p-3 border rounded bg-gray-50">
                            <AppSelect
                                value={tempDetails.card_type}
                                placeholder="Type"
                                onValueChange={(v) => setTempDetails(p => ({ ...p, card_type: v }))}
                                options={[{ value: 'credit', label: 'Credit' }, { value: 'debit', label: 'Debit' }]}
                            />
                            <AppSelect
                                value={tempDetails.card_edc}
                                placeholder="EDC"
                                onValueChange={(v) => setTempDetails(p => ({ ...p, card_edc: v }))}
                                options={bankOptions}
                            />
                            <Input
                                placeholder="Last 4 Digits"
                                onChange={(e) => setTempDetails(p => ({ ...p, card_number: e.target.value }))}
                            />
                        </div>
                    )}

                    {currentMethod === 'ewallet' && (
                        <div className="grid grid-cols-2 gap-2 p-3 border rounded bg-gray-50">
                            <AppSelect
                                value={tempDetails.wallet_edc}
                                placeholder="Type"
                                onValueChange={(v) => setTempDetails(p => ({ ...p, wallet_edc: v }))}
                                options={[
                                    { value: 'GOPAY', label: 'Gopay' },
                                    { value: 'OVO', label: 'OVO' },
                                    { value: 'DANA', label: 'DANA' },
                                    { value: 'LINKAJA', label: 'LinkAja' }
                                ]}
                            />
                            <Input
                                placeholder="Mobile Number"
                                onChange={(e) => setTempDetails(p => ({ ...p, mobile_number: e.target.value }))}
                            />
                        </div>
                    )}

                    {currentMethod === 'voucher' && (
                        <div className="grid grid-cols-2 gap-2 p-3 border rounded bg-gray-50">
                            <AppSelect
                                value={tempDetails.voucher_provider}
                                placeholder="Type"
                                onValueChange={(v) => setTempDetails(p => ({ ...p, voucher_provider: v }))}
                                options={[
                                    { value: 'DealJava', label: 'DealJava' },
                                    { value: 'Fave', label: 'Fave' },
                                    { value: 'Traveloka', label: 'Traveloka' }
                                ]}
                            />
                            <Input
                                placeholder="Voucher Number"
                                onChange={(e) => setTempDetails(p => ({ ...p, voucher_number: e.target.value }))}
                            />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Input
                            type="number"
                            value={tempDetails.amount || ""}
                            placeholder="Amount"
                            onChange={(e) => setTempDetails(p => ({ ...p, amount: Number(e.target.value) }))}
                        />
                        <Button onClick={handleAddSlice} className="bg-green-600 hover:bg-green-700">Add</Button>
                    </div>
                </div>

                {/* List of Slices */}
                <div className="space-y-2 max-h-40 overflow-auto">
                    {paymentsAdded.map((p, i) => (
                        <div key={i} className="flex justify-between items-center p-2 border rounded text-xs bg-white">
                            {p.method === 'card' && (
                                <span>{p.method.toUpperCase()} {p.details.card_type} {p.details.card_edc}</span>
                            )}
                            {p.method === 'ewallet' && (
                                <span>{p.method.toUpperCase()} {p.details.wallet_edc}</span>
                            )}
                            {p.method === 'voucher' && (
                                <span>{p.method.toUpperCase()} {p.details.voucher_provider}</span>
                            )}
                            {p.method === 'cash' && (
                                <span>{p.method.toUpperCase()}</span>
                            )}
                            {p.method === 'qr' && (
                                <span>{p.method.toUpperCase()} {p.details.qr_edc}</span>
                            )}

                            <div className="flex items-center gap-2">
                                <span className="font-bold">Rp. {p.amount.toLocaleString()}</span>
                                <Trash2 size={14} className="text-red-500 cursor-pointer" onClick={() => removeSlice(i)} />
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="mt-4">
                    <Button
                        className="w-full h-12 text-lg bg-sky-600 hover:bg-sky-700"
                        disabled={totalPaid < grandTotal}
                        onClick={() => onFinalize(paymentsAdded, change)}
                    >
                        Finalize & Print
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};