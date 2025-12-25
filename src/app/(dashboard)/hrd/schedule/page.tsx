"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useState } from "react";
import { DatePicker, Modal } from 'antd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatShift = (info: any) => {
    if (info.getValue() === "M") return "Morning";
    else if (info.getValue() === "A") return "Afternoon";
    else if (info.getValue() === "D") return "Whole Day";
    else if (info.getValue() === "L") return "On Leave";
    else if (info.getValue() === "N") return "New Normal";
};

const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "job_type", header: "Job Type", cell: (info: any) => info.getValue() === "cashier" ? "Cashier" : "Therapist" },
    { accessorKey: "monday", header: "Monday", cell: formatShift },
    { accessorKey: "tuesday", header: "Tuesday", cell: formatShift },
    { accessorKey: "wednesday", header: "Wednesday", cell: formatShift },
    { accessorKey: "thursday", header: "Thursday", cell: formatShift },
    { accessorKey: "friday", header: "Friday", cell: formatShift },
    { accessorKey: "saturday", header: "Saturday", cell: formatShift },
    { accessorKey: "sunday", header: "Sunday", cell: formatShift },
];

export default function SchedulePage() {
    const [selectedWeek, setSelectedWeek] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const [activeModal, setActiveModal] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);

    const handleAddNew = () => {
        setSelectedItem(null); // Ensure form is empty
        setActiveModal("schedule");
    };

    const { data: scheduleData } = useModel(`attendance/${selectedWeek}`, {
        mode: "table"
    });

    return (
        <div>
            <DataTable
                title="Schedule"
                columns={columns}
                data={scheduleData}
                customFilter={
                    <div className="flex items-center gap-2" >
                        <span className="text-sm font-medium">Week</span>
                        <div className="w-[200px]">
                            <DatePicker
                                value={selectedDate}
                                onChange={(date, dateString) => {
                                    setSelectedDate(date);
                                    if (dateString) {
                                        let weekString = dateString.split("-");
                                        let year = weekString[0];
                                        let week = weekString[1].slice(0, -2);
                                        if (parseInt(week) < 10) {
                                            week = "0" + week;
                                        }
                                        setSelectedWeek(year + "-W" + week || "");
                                    }
                                }}
                                picker="week"
                            />
                        </div>
                    </div>
                }
                tableAction={() => handleAddNew()}
            />

            <Dialog
                open={activeModal === "schedule"}
                onOpenChange={() => setActiveModal("")}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{activeModal === "schedule" ? "Add New Schedule" : "Edit Schedule"}</DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    );
}