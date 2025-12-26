import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format, addDays } from "date-fns"
import { CalendarIcon, Info } from "lucide-react"
import { useState } from "react";

interface AddPeriodModalProps {
    isOpen: boolean;
    onClose: () => void;
    endDate: Date;
    setEndDate: (endDate: Date) => void;
    lastToDate: string | undefined;
    onSave: (endDate: Date) => void;
}

export function AddPeriodModal({ isOpen, onClose, endDate, setEndDate, lastToDate, onSave }: AddPeriodModalProps) {
    // Logic: Next start is always last end + 1
    const nextStartDate = lastToDate ? addDays(new Date(lastToDate), 1) : new Date();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Initialize New Period</DialogTitle>
                    <DialogDescription>
                        Set the closing date for the next payroll cycle.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Read-only Start Date Context */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-blue-900">Automatic Start Date</p>
                            <p className="text-blue-700">{nextStartDate !== undefined ? format(nextStartDate, "PPP") : ""}</p>
                        </div>
                    </div>

                    {/* User Input: End Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Next Period Ends On</label>
                        <Calendar
                            required
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            disabled={(date) => date < nextStartDate} // Prevent invalid ranges
                            className="rounded-md border shadow-sm"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => onSave(endDate)}
                        disabled={!endDate}
                        className="bg-sky-600 hover:bg-sky-700"
                    >
                        Create Period
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}