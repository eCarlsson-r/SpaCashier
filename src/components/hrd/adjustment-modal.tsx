import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AdjustmentModalProps {
    type: "addition" | "deduction";
    isOpen: boolean;
    onClose: () => void;
    employees: { value: string; label: string }[];
    // ADD THIS: The handler to update the parent state
    onApply: (data: {
        employee_id: string;
        amount: number;
        category: string;
        type: "addition" | "deduction"
    }) => void;
}

export function AdjustmentModal({ type, isOpen, onClose, employees, onApply }: AdjustmentModalProps) {
    // 1. Add internal state for the form fields
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [amount, setAmount] = useState<string>("0");

    const categories = type === "addition"
        ? ["KERAJINAN", "UANG MAKAN", "LEMBUR", "BONUS", "TRANSPORT", "THR"]
        : ["TELAT", "ABSENSI", "PINJAMAN", "GANTI RUGI", "SERAGAM"];

    // 2. Handle the Save action
    const handleSave = () => {
        if (!selectedEmployee || !selectedCategory || Number(amount) <= 0) {
            return; // Basic validation
        }

        onApply({
            employee_id: selectedEmployee,
            amount: Number(amount),
            category: selectedCategory,
            type: type
        });

        // 3. Reset and Close
        setSelectedEmployee("");
        setSelectedCategory("");
        setAmount("0");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className={type === "addition" ? "text-emerald-600" : "text-rose-600"}>
                            Tambah {type === "addition" ? "Penambahan" : "Potongan"}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <Label>Employee</Label>
                        <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee..." />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.value} value={emp.value}>{emp.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <Label>{type === "addition" ? "Addition Type" : "Deduction Type"}</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <Label>Cash (Rp)</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">Rp</span>
                            <Input
                                type="number"
                                className="pl-9"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 mt-2">
                            {[50000, 100000, 200000].map((val) => (
                                <Button
                                    key={val}
                                    variant="outline"
                                    size="sm"
                                    type="button" // Important: prevent form submit
                                    className="text-[10px] h-7"
                                    onClick={() => setAmount(val.toString())}
                                >
                                    +{val / 1000}k
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        className={type === "addition" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}
                    >
                        Apply Adjustment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}