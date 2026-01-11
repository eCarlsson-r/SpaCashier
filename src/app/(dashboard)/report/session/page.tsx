"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useModel } from "@/hooks/useModel";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<{date: string, start: string, therapist_name: string, treatment_name: string, payment: string, status: string}>[] = [
    { accessorKey: "date", header: "Date", cell: (info) => (info.getValue())?new Date(info.getValue() as string).toDateString():"" },
    { accessorKey: "start", header: "Time" },
    { accessorKey: "therapist_name", header: "Therapist" },
    { accessorKey: "treatment_name", header: "Treatment" },
    { accessorKey: "payment", header: "Redeemer" },
    { accessorKey: "status", header: "Status" },
];

export default function SessionReport() {
    const {user} = useAuth();
    const employees = useModel('employee', (user?.type == "THERAPIST")?{mode:'select', params:{'id':user?.employee?.id}}:(user?.type == "STAFF"?{mode:'select', params:{'branch_id':user?.employee?.branch_id}}:{mode: "select"})).options;
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<string|undefined>(new Date().toISOString());
    const [selectedEndDate, setSelectedEndDate] = useState<string|undefined>(new Date().toISOString());
    const [selectedStatus, setSelectedStatus] = useState(["completed"]);
    const [selectedOrder, setSelectedOrder] = useState<string>("");
    const [selectedFromEmployee, setSelectedFromEmployee] = useState<string>("");
    const [selectedToEmployee, setSelectedToEmployee] = useState<string>("");

    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get(`/session`, {
                params: {
                    start: selectedStartDate,
                    end: selectedEndDate,
                    status: JSON.stringify(selectedStatus),
                    from_employee: user?.type == "THERAPIST" ? user?.employee?.id : selectedFromEmployee,
                    to_employee: user?.type == "THERAPIST" ? user?.employee?.id : selectedToEmployee,
                    order_by: selectedOrder
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

    const clear = () => {
        setSelectedStartDate(new Date().toDateString());
        setSelectedEndDate(new Date().toDateString());
        setSelectedStatus(["completed"]);
        setSelectedOrder("");
        setSelectedFromEmployee("");
        setSelectedToEmployee("");
        setReportData([]);
    }

    return (
        <DataTable
            title="Session Report"
            columns={columns}
            data={reportData}
            customFilter={
                <div className={`grid grid-cols-${user?.type === "THERAPIST" ? 5 : 3} gap-3`}>
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
                        <Label>Status</Label>
                        <AppSelect
                            options={[
                                { value: "waiting", label: "Waiting" },
                                { value: "ongoing", label: "Ongoing" },
                                { value: "completed", label: "Completed" },
                                { value: "cancelled", label: "Cancelled" },
                            ]} multiple={true}
                            value={JSON.stringify(selectedStatus)}
                            onValueChange={(val) => setSelectedStatus(JSON.parse(val))}
                        />
                    </div>
                    {user?.type !== "THERAPIST" && (
                        <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => generateReport()}>Find</Button>
                    )}
                    {user?.type !== "THERAPIST" && (
                        <div className="mt-2">
                            <Label>From Employee</Label>
                            <AppSelect
                                value={selectedFromEmployee}
                                onValueChange={(value) => setSelectedFromEmployee(value)}
                                options={employees}
                            />
                        </div>
                    )}
                    {user?.type !== "THERAPIST" && (
                        <div className="mt-2">
                            <Label>To Employee</Label>
                            <AppSelect
                                value={selectedToEmployee}
                                onValueChange={(value) => setSelectedToEmployee(value)}
                                options={employees}
                            />
                        </div>
                    )}
                    <div className="mt-2">
                        <Label>Order by</Label>
                        <AppSelect
                            value={selectedOrder}
                            onValueChange={(value) => setSelectedOrder(value)}
                            options={(user?.type !== "THERAPIST")?[
                                { value: "sessions.date", label: "Date" },
                                { value: "sessions.employee_id", label: "Therapist" },
                                { value: "sessions.treatment_id", label: "Treatment" },
                            ]:[
                                { value: "sessions.date", label: "Date" },
                                { value: "sessions.treatment_id", label: "Treatment" },
                            ]}
                        />
                    </div>
                    {user?.type !== "THERAPIST" ? (
                        <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => generateReport()}>Find</Button>
                    ) : (<div className="mt-2 gap-3">
                        <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => generateReport()}>Find</Button>
                        <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => clear()}>Clear Report</Button>
                    </div>)}
                    
                </div>
            }
        />
    );
}