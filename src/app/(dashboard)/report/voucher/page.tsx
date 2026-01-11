"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMemo, useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { VoucherReportTemplate } from "@/components/print/voucher-report-template";
import { ColumnDef } from "@tanstack/react-table";

export default function VoucherStockReport() {
    const [reportData, setReportData] = useState([]);
    const [selectedEndDate, setSelectedEndDate] = useState<Date|undefined>(new Date());
    const [selectedVariant, setSelectedVariant] = useState<string>("");
    const [selectedMetric, setSelectedMetric] = useState(["in-stock", "sold-out"]);

    const columns = useMemo(() => {
        const baseColumns:ColumnDef<{name: string, range: string, count: number, customer_name: string, period: string, month: string, year: string, amount: number}>[] = [
            { accessorKey: "name", header: "Treatment Name" },
        ];

        // Variant 2 adds extra columns (e.g., Tax and Service)
        if (selectedVariant === "QTY") {
            return [
                ...baseColumns,
                { accessorKey: "range", header: "Vouchers" },
                { accessorKey: "count", header: "Count" },
                { accessorKey: "customer-name", header: "Customer Name" },
            ];
        }

        // Variant 1 (Default 5 columns)
        return [
            ...baseColumns,
            { accessorKey: "period", header: "Period", cell: (info) => `${info.row.original.month} ${info.row.original.year}` },
            { accessorKey: "count", header: "Count" },
            { accessorKey: "amount", header: "Amount", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.row.original.amount)},-` },
        ];
    }, [selectedVariant]);

    const [printData, setPrintData] = useState([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Voucher Stock Report",
    });
    
    const generateReport = () => {
        if (selectedEndDate) {
            api.get(`/voucher`, {
                params: {
                    variant: selectedVariant,
                    end: selectedEndDate,
                    metric: JSON.stringify(selectedMetric)
                }
            }).then((response) => {
                // Normalize the nested structure from backend into a flat array for the table
                const flattened = response.data.flatMap((treatment: {voucher: unknown, sales: unknown}) => 
                    selectedVariant === "QTY" ? treatment.voucher : treatment.sales
                );
                setReportData(flattened);
            })
            .catch((error) => {
                console.error("Error fetching attendance report:", error);
            });
        }
    }

    const clear = () => {
        setSelectedEndDate(new Date());
        setSelectedVariant("QTY");
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
                title="Voucher Stock Report"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-4 gap-3`}>
                        <div className="mt-2">
                            <Label>Variant</Label>
                            <AppSelect
                                options={[
                                    { value: "QTY", label: "Quantity" },
                                    { value: "REKAP_TANGGAL_PENJUALAN", label: "Sales Recap" },
                                ]}
                                value={selectedVariant}
                                onValueChange={(val) => setSelectedVariant(val)}
                            />
                        </div>
                        <div className="mt-2">
                            <Label>Report until</Label>
                            <DatePicker
                                value={new Date(selectedEndDate || "")}
                                onChange={(date) => setSelectedEndDate(new Date(date||""))}
                            />
                        </div>
                        {
                            selectedVariant == "QTY" && (<div className="mt-2">
                                <Label>Metric</Label>
                                <AppSelect
                                    value={JSON.stringify(selectedMetric)} multiple={true}
                                    onValueChange={(value) => setSelectedMetric(JSON.parse(value))}
                                    options={[
                                        { value: "in-stock", label: "In Stock" },
                                        { value: "sold-out", label: "Sold Out" },
                                    ]}
                                />
                            </div>)
                        }
                        
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
                    <VoucherReportTemplate 
                        variant={selectedVariant} 
                        endDate={selectedEndDate?.toLocaleDateString("id-ID")||""} 
                        data={printData} 
                    />
                </div>
            </div>
        </div>
    );
}