"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useModel } from "@/hooks/useModel";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { LedgerTemplate } from "@/components/print/ledger-template";
import { ColumnDef } from "@tanstack/react-table";

export default function Ledger() {
    const accounts = useModel(`account`, {mode: "select"}).options;
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Date|undefined>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date|undefined>(new Date());
    const [selectedAccount, setSelectedAccount] = useState<string>("");

    const columns: ColumnDef<{date: string, reference: string, description: string, debit: number, credit: number}>[] = [
        { accessorKey: "date", header: "Date", cell: (info) => (info.getValue())?new Date(info.getValue() as string).toDateString():"" },
        { accessorKey: "reference", header: "Reference" },
        { accessorKey: "description", header: "Description" },
        { accessorKey: "debit", header: "Debit", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-`  },
        { accessorKey: "credit", header: "Credit", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-`  },
    ];

    const [printData, setPrintData] = useState([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Ledger",
    });
    
    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get(`/account/${selectedAccount}`, {
                params: {
                    start: selectedStartDate.toDateString(),
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
        setSelectedStartDate(new Date());
        setSelectedEndDate(new Date());
        setSelectedAccount("");
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
                title="Ledger"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-4 gap-3`}>
                        <div className="mt-2">
                            <Label>Start Date</Label>
                            <DatePicker
                                value={new Date(selectedStartDate || "")}
                                onChange={(date) => setSelectedStartDate(new Date(date||""))}
                            />
                        </div>
                        <div className="mt-2">
                            <Label>End Date</Label>
                            <DatePicker
                                value={new Date(selectedEndDate || "")}
                                onChange={(date) => setSelectedEndDate(new Date(date||""))}
                            />
                        </div>
                        <div className="mt-2">
                            <Label>Account</Label>
                            <AppSelect
                                value={selectedAccount}
                                onValueChange={(value) => setSelectedAccount(value)}
                                options={accounts}
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
                    <LedgerTemplate 
                        startDate={selectedStartDate?.toLocaleDateString("id-ID")||""} 
                        endDate={selectedEndDate?.toLocaleDateString("id-ID")||""} 
                        account={selectedAccount} 
                        data={printData} 
                    />
                </div>
            </div>
        </div>
    );
}