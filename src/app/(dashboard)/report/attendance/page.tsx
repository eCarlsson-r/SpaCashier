"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const columns = [
    { accessorKey: "employee.name", header: "Employee Name" },
    { accessorKey: "date", header: "Date", cell: ({row}) => (row.original.date)?new Date(row.original.date).toDateString():"" },
    { accessorKey: "shift_id", header: "Shift" },
    { accessorKey: "clock_in", header: "Clock In" },
    { accessorKey: "clock_out", header: "Clock Out" },
    { accessorKey: "deduction", header: "Deduction", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.deduction)},-` },
];

export default function AttendanceReport() {
    const { user } = useAuth();
    const employees = useModel('employee', (user?.type == "THERAPIST")?{mode:'select', params:{'id':user?.employee?.id}}:(user?.type == "STAFF"?{mode:'select', params:{'branch_id':user?.employee?.branch_id}}:{mode: "select"})).options;
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<string|undefined>(new Date().toISOString());
    const [selectedEndDate, setSelectedEndDate] = useState<string|undefined>(new Date().toISOString());
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");


    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get(`/attendance`, {
                params: {
                    start_date: selectedStartDate,
                    end_date: selectedEndDate,
                    employee_id: selectedEmployee
                }
            })
                .then((response) => {
                    setReportData(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching attendance report:", error);
                });
        }
    }   

    return (
        <div>
            <DataTable
                title="Attendance Report"
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