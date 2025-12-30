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

const columns = [
    { accessorKey: "date", header: "Date", cell: ({row}) => (row.original.date)?new Date(row.original.date).toDateString():"" },
    { accessorKey: "start", header: "Time" },
    { accessorKey: "therapist_name", header: "Therapist" },
    { accessorKey: "treatment_name", header: "Treatment" },
    { accessorKey: "payment", header: "Redeemer" },
    { accessorKey: "status", header: "Status" },
];

export default function SessionReport() {
    const employees = useModel(`employee`, {mode: "select"}).options;
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
                    from_employee: selectedFromEmployee,
                    to_employee: selectedToEmployee,
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
        <div>
            <DataTable
                title="Session Report"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-${useAuth().user?.type === "THERAPIST" ? 6 : 4} gap-3`}>
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
                        {useAuth().user?.type !== "THERAPIST" && (
                            <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => generateReport()}>Find</Button>
                        )}
                        {useAuth().user?.type !== "THERAPIST" && (
                            <div className="mt-2">
                                <Label>From Employee</Label>
                                <AppSelect
                                    value={selectedFromEmployee}
                                    onValueChange={(value) => setSelectedFromEmployee(value)}
                                    options={employees}
                                />
                            </div>
                        )}
                        {useAuth().user?.type !== "THERAPIST" && (
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
                                options={(useAuth().user?.type !== "THERAPIST")?[
                                    { value: "sessions.date", label: "Date" },
                                    { value: "sessions.employee_id", label: "Therapist" },
                                    { value: "sessions.treatment_id", label: "Treatment" },
                                ]:[
                                    { value: "sessions.date", label: "Date" },
                                    { value: "sessions.treatment_id", label: "Treatment" },
                                ]}
                            />
                        </div>
                        {useAuth().user?.type == "THERAPIST" && (<Button className="bg-sky-600 hover:bg-sky-700" onClick={() => generateReport()}>Find</Button>)}
                        <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => clear()}>Clear Report</Button>
                    </div>
                }   
                tableAction={() => printReport()}
                tableActionText="Print Report"
            />
        </div>
    );
}