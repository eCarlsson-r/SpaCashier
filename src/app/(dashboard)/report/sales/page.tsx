"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useModel } from "@/hooks/useModel";
import { Button } from "@/components/ui/button";
import { SalesReportTemplate } from "@/components/print/sales-report-template";
import { useReactToPrint } from "react-to-print";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";
import { SalesRecordSchema } from "@/lib/schemas";

const columns: ColumnDef<{date: string, income: {journal_reference: string}, customer: {name: string}, subtotal: number, discount: number, total: number, description: string, records: z.infer<typeof SalesRecordSchema>[]}>[] = [
    { accessorKey: "date", header: "Date", cell: (info) => (info.getValue())?new Date(info.getValue() as string).toDateString():"" },
    { accessorKey: "income.journal_reference", header: "Reference" },
    { accessorKey: "customer.name", header: "Customer Name" },
    { accessorKey: "subtotal", header: "Amount", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-` },
    { accessorKey: "discount", header: "Discount", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-` },
    { accessorKey: "total", header: "Total", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-` },
    { accessorKey: "description", header: "Description", cell: (info) => info.row.original.records[0].description },
];

export default function SalesReport() {
    const activeUser = useAuth().user;
    let branchData = {};
    if (activeUser?.employee) {
        branchData = {
            mode: "select", 
            params: {
                branch_id: activeUser.employee.branch_id.toString()
            }
        };
    } else {
        branchData = {
            mode: "select"
        }
    }
    
    const branches = useModel(`branch`, branchData).options;
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<string>(new Date().toDateString());
    const [selectedEndDate, setSelectedEndDate] = useState<string>(new Date().toDateString());
    const [selectedBranch, setSelectedBranch] = useState<string>((activeUser?.employee)?activeUser.employee.branch_id.toString():"");

    const [printData, setPrintData] = useState([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Sales Report",
    });

    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get(`/sales`, {
                params: {
                    start: selectedStartDate,
                    end: selectedEndDate,
                    branch: selectedBranch
                }
            })
                .then((response) => {
                    setReportData(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching sales report:", error);
                });
        }
    }  

    const printReport = () => {
        setPrintData(reportData);
        // Triggering after a small delay ensures the 'report' template is loaded into the ref
        setTimeout(() => {
            if (printRef.current) {
                handlePrint();
            }
        }, 250);
    };
    
    const clear = () => {
        setSelectedStartDate(new Date().toDateString());
        setSelectedEndDate(new Date().toDateString());
        setSelectedBranch((activeUser?.employee)?activeUser.employee.branch_id.toString():"");
        setReportData([]);
        setPrintData([]);
    }

    return (
        <div>
            <DataTable
                title="Sales Report"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-4 gap-3`}>
                        <div className="mt-2">
                            <Label>Start Date</Label>
                            <DatePicker
                                value={new Date(selectedStartDate || "")}
                                onChange={(date) => setSelectedStartDate(date||"")}
                            />
                        </div>
                        <div className="mt-2">
                            <Label>End Date</Label>
                            <DatePicker
                                value={new Date(selectedEndDate || "")}
                                onChange={(date) => setSelectedEndDate(date||"")}
                            />
                        </div>
                        <div className="mt-2">
                            <Label>Branch</Label>
                            <AppSelect
                                value={selectedBranch}
                                onValueChange={(value) => setSelectedBranch(value)}
                                options={branches}
                            />
                        </div>
                        <div className="grid grid-cols-2 mt-2 gap-2">
                            <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => generateReport()}>Find</Button>
                            <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => clear()}>Clear Report</Button>
                        </div>
                    </div>
                }   
                tableAction={() => printReport()}
                tableActionText="Print Report"
            />

            <div className="hidden">
                <div ref={printRef} className="print:block p-3 bg-white">
                    <SalesReportTemplate 
                        startDate={selectedStartDate} 
                        endDate={selectedEndDate} 
                        branch={selectedBranch} 
                        data={printData} 
                    />
                </div>
            </div>  
        </div>
    );
}