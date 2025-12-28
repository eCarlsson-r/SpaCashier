"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";

const columns = [
    { accessorKey: "treatment_name", header: "Treatment" },
    { accessorKey: "treatment_price", header: "Treatment Price", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.treatment_price)},-` },
    { accessorKey: "therapist_bonus", header: "Bonus Therapist", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.therapist_bonus)},-` },
    { accessorKey: "recruit_bonus", header: "Bonus Rekruit", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.recruit_bonus)},-` },
    { accessorKey: "total", header: "Total Bonus", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.therapist_bonus+row.original.recruit_bonus)},-` },
];

export default function BonusReport() {
    const employees = useModel(`employee`, {mode: "select"}).options;
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<string|undefined>(new Date().toISOString());
    const [selectedEndDate, setSelectedEndDate] = useState<string|undefined>(new Date().toISOString());
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");


    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get(`/compensation`, {
                params: {
                    start: selectedStartDate,
                    end: selectedEndDate,
                    employee_id: selectedEmployee
                }
            })
                .then((response) => {
                    setReportData(response.data[selectedEmployee]);
                })
                .catch((error) => {
                    console.error("Error fetching attendance report:", error);
                });
        }
    }   

    return (
        <div>
            <DataTable
                title="Bonus Report"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className="grid grid-cols-3 gap-3">
                        <div className="mt-2">
                            <Label>Start Date</Label>
                            <DatePicker
                                value={new Date(selectedStartDate || "")}
                                onChange={(date) => setSelectedStartDate(date)}
                            />
                        </div>
                        <div className="mt-2">
                            <Label>End Date</Label>
                            <DatePicker
                                value={new Date(selectedEndDate || "")}
                                onChange={(date) => setSelectedEndDate(date)}
                            />
                        </div>
                        <div className="mt-2">
                            <Label>Employee</Label>
                            <AppSelect
                                value={selectedEmployee}
                                onValueChange={(value) => setSelectedEmployee(value)}
                                options={employees}
                            />
                        </div>
                    </div>
                }   
                tableAction={() => generateReport()}
                tableActionText="Generate Report"
            />
        </div>
    );
}