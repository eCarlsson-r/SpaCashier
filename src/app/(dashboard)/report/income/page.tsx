"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMemo, useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { useModel } from "@/hooks/useModel";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { CashflowReportTemplate } from "@/components/print/cashflow-report-template";

export default function IncomeReport() {
    const wallets = useModel(`wallet`, {mode: "select"}).options;
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Date|undefined>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date|undefined>(new Date());
    const [selectedVariant, setSelectedVariant] = useState<string>("");
    const [selectedAccount, setSelectedAccount] = useState<string>("");

    const columns = useMemo(() => {
        const baseColumns = [
            { accessorKey: "date", header: "Date" },
            { accessorKey: "journal_reference", header: "Reference" },
            { accessorKey: "partner", header: "Partner" },
            { accessorKey: "description", header: "Description" },
        ];

        // Variant 2 adds extra columns (e.g., Tax and Service)
        if (selectedVariant === "2") {
            return [
                ...baseColumns,
                { accessorKey: "pay_type", header: "Payment Type" },
                { accessorKey: "pay_tool", header: "Payment Tool" },
                { accessorKey: "amount", header: "Amount", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.amount)},-` },
            ];
  }

        // Variant 1 (Default 5 columns)
        return [
            ...baseColumns,
            { accessorKey: "amount", header: "Amount", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.amount)},-` },
        ];
    }, [selectedVariant]);

    const [printData, setPrintData] = useState([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Income Report",
    });
    
    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get(`/income`, {
                params: {
                    variant: selectedVariant,
                    start: selectedStartDate,
                    end: selectedEndDate,
                    account: selectedAccount
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
        setSelectedVariant("1");
        setSelectedAccount("");
        setReportData([]);
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
                title="Income Report"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-5 gap-3`}>
                        <div className="mt-2">
                            <Label>Variant</Label>
                            <AppSelect
                                options={[
                                    { value: "1", label: "Variant 1" },
                                    { value: "2", label: "Variant 2" },
                                ]}
                                value={selectedVariant}
                                onValueChange={(val) => setSelectedVariant(val)}
                            />
                        </div>
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
                                options={wallets}
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
                    <CashflowReportTemplate 
                        reportTitle="Income Report"
                        variant={selectedVariant}
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