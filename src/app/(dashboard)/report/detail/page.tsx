"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMemo, useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { DetailedReportTemplate } from "@/components/print/detail-report-template";

export default function DetailedReport() {
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Date|undefined>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date|undefined>(new Date());
    const [selectedVariant, setSelectedVariant] = useState<string>("voucher-sales");
    const [reportTitle, setReportTitle] = useState<string>("");

    const columns = useMemo(() => {
        if (selectedVariant === "voucher-sales") {
            return [
                { accessorKey: "date", header: "Date", cell: (info) => (info.getValue())?new Date(info.getValue() as string).toDateString():"" },
                { accessorKey: "journal_reference", header: "Reference" },
                { accessorKey: "description", header: "Description" },
                { accessorKey: "quantity", header: "Quantity" },
                { accessorKey: "price", header: "Price", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-` },
                { accessorKey: "total", header: "Total", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-` },
            ];
        } else if (selectedVariant === "walkin-voucher-usage") {
            return [
                { accessorKey: "date", header: "Date", cell: (info) => (info.getValue())?new Date(info.getValue() as string).toDateString():"" },
                { accessorKey: "time", header: "Time" },
                { accessorKey: "reference", header: "Reference" },
                { accessorKey: "therapist_name", header: "Therapist" },
                { accessorKey: "description", header: "Description" },
                { accessorKey: "price", header: "Price", cell: (info) => `Rp. ${new Intl.NumberFormat('id-ID').format(info.getValue() as number)},-` },
            ];
        } else if (selectedVariant === "sales-by-date") {
            return [
                { accessorKey: "date", header: "Date", cell: (info) => (info.getValue())?new Date(info.getValue() as string).toDateString():"" },
                { accessorKey: "treatment", header: "Treatment" },
                { accessorKey: "voucher_quantity", header: "Voucher Sales Qty." },
                { accessorKey: "voucher_price", header: "Voucher Sales Amount" },
                { accessorKey: "walkin_quantity", header: "WalkIn Sales Qty." },
                { accessorKey: "walkin_price", header: "WalkIn Sales Amount" },
                { accessorKey: "voucher_usage", header: "Voucher Usage"},
                { accessorKey: "total_quantity", header: "Total Qty" },
                { accessorKey: "total_price", header: "Total Amount" },
            ];
        } else if (selectedVariant === "sales-by-treatment") {
            return [
                { accessorKey: "treatment", header: "Treatment" },
                { accessorKey: "voucher_quantity", header: "Qty. Penjualan Voucher" },
                { accessorKey: "voucher_price", header: "Nominal Penjualan Voucher" },
                { accessorKey: "walkin_quantity", header: "Qty. Penjualan WalkIn" },
                { accessorKey: "walkin_price", header: "Nominal Penjualan WalkIn" },
                { accessorKey: "voucher_usage", header: "Voucher Usage"},
                { accessorKey: "total_quantity", header: "Total Qty" },
                { accessorKey: "total_price", header: "Total Nominal" },
            ];
        } else return [];
    }, [selectedVariant]);

    const [printData, setPrintData] = useState([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Voucher Usage Report",
    });
    
    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get((selectedVariant == "walkin-voucher-usage")?`/session`:`/voucher`, {
                params: {
                    variant: selectedVariant,
                    start: selectedStartDate,
                    end: selectedEndDate
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
        setSelectedVariant("voucher-sales");
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
                title="Voucher Usage Report"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-5 gap-3`}>
                        <div className="col-span-2 mt-2">
                            <Label>Variant</Label>
                            <AppSelect
                                options={[
                                    { value: "voucher-sales", label: "Voucher Sales Report" },
                                    { value: "walkin-voucher-usage", label: "Walk-in Sales & Voucher Usage Report" },
                                    { value: "sales-by-date", label: "Sales Summary by Date" },
                                    { value: "sales-by-treatment", label: "Sales Summary by Treatment" },
                                ]}
                                value={selectedVariant}
                                onValueChange={(val) => {
                                    setSelectedVariant(val);
                                    setReportData([]);
                                    switch (val) {
                                        case "voucher-sales":
                                            setReportTitle("Voucher Sales Report");
                                            break;
                                        case "walkin-voucher-usage":
                                            setReportTitle("Walk-in Sales & Voucher Usage Report");
                                            break;
                                        case "sales-by-date":
                                            setReportTitle("Sales Summary by Date");
                                            break;
                                        case "sales-by-treatment":
                                            setReportTitle("Sales Summary by Treatment");
                                            break;
                                    }
                                }}
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
                    <DetailedReportTemplate 
                        variant={selectedVariant}
                        reportTitle={reportTitle}
                        startDate={selectedStartDate?.toDateString()||""} 
                        endDate={selectedEndDate?.toDateString()||""} 
                        data={printData} 
                    />
                </div>
            </div>
        </div>
    );
}