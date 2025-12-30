"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { BalanceSheetTemplate } from "@/components/print/balance-sheet-template";

export default function BalanceSheet() {
    const [reportData, setReportData] = useState([]);
    const [selectedEndDate, setSelectedEndDate] = useState<Date|undefined>(new Date());

    const columns = [
        { accessorKey: "type", header: "Type" },
        { accessorKey: "category", header: "Category" },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "balance", header: "Balance", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.balance)},-`  },
    ];

    const [printData, setPrintData] = useState([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Balance Sheet",
    });
    
    const generateReport = () => {
        if (selectedEndDate) {
            api.get(`/account`, {
                params: {
                    end: selectedEndDate.toDateString()
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
        setSelectedEndDate(new Date());
        setReportData([]);
        setPrintData([]);
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

    return (
        <div>
            <DataTable
                title="Balance Sheet"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-2 gap-3`}>
                        <div className="mt-2">
                            <Label>End Date</Label>
                            <DatePicker
                                value={new Date(selectedEndDate || "")}
                                onChange={(date) => setSelectedEndDate(new Date(date||""))}
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
                    <BalanceSheetTemplate 
                        endDate={selectedEndDate?.toLocaleDateString("id-ID")||""} 
                        data={printData} 
                    />
                </div>
            </div>
        </div>
    );
}