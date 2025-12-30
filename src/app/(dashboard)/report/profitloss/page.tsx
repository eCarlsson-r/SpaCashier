"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { ProfitLossTemplate } from "@/components/print/profit-loss-template";
import { Input } from "@/components/ui/input";
import { AppSelect } from "@/components/shared/AppSelect";
import { useModel } from "@/hooks/useModel";

export default function ProfitLoss() {
    const accounts = useModel(`account`, {mode: "select"}).options;
    const [reportData, setReportData] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Date>(new Date());
    const [selectedEndDate, setSelectedEndDate] = useState<Date>(new Date());

    const [selectedRStartDate, setSelectedRStartDate] = useState<Date>(new Date());
    const [selectedREndDate, setSelectedREndDate] = useState<Date>(new Date());
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [retainedEarning, setRetainedEarning] = useState<string>("");

    const columns = [
        { accessorKey: "category", header: "Account Category" },
        { accessorKey: "name", header: "Account Name" },
        { accessorKey: "current", header: "This Month", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.current)},-`   },
        { accessorKey: "previous", header: "Until This Month", cell: ({row}) => `Rp. ${new Intl.NumberFormat('id-ID').format(row.original.previous)},-`   },
    ];

    const calculateRetainedEarning = () => {
        api.get(`/journal`, {
            params: {
                start: selectedRStartDate.toDateString(),
                end: selectedREndDate.toDateString(),
                account: selectedAccount
            }
        })
            .then((response) => {
                setRetainedEarning(new Intl.NumberFormat('id-ID').format(response.data[0].earning));
            })
            .catch((error) => {
                console.error("Error fetching retained earning:", error);
            });
    }

    const [printData, setPrintData] = useState([]);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "ProfitLoss",
    });
    
    const generateReport = () => {
        if (selectedStartDate && selectedEndDate) {
            api.get(`/account`, {
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
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                    {/* Left Side: Title */}
                    <h1 className="text-2xl font-bold">Retained Earnings</h1>
    
                    {/* Right Side: Search and Button Container */}
                    <div className="flex items-center grid grid-cols-5 gap-2">
                        <div className="mt-2">
                            <Label>Start Date</Label>
                            <DatePicker
                                value={new Date(selectedRStartDate || "")}
                                onChange={(date) => setSelectedRStartDate(new Date(date||""))}
                            />
                        </div>

                        <div className="mt-2">
                            <Label>End Date</Label>
                            <DatePicker
                                value={new Date(selectedREndDate || "")}
                                onChange={(date) => setSelectedREndDate(new Date(date||""))}
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

                        <Button className="bg-sky-600 hover:bg-sky-700" onClick={calculateRetainedEarning}>
                            Calculate
                        </Button>

                        <div className="mt-2">
                            <Label>Retained Earning</Label>
                            <Input readOnly={true}
                                value={retainedEarning}
                                onChange={(event) => setRetainedEarning(event.target.value)}
                                className="max-w-sm bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <DataTable
                title="Profit & Loss"
                columns={columns}
                data={reportData}
                customFilter={
                    <div className={`grid grid-cols-3 gap-3`}>
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
                    <ProfitLossTemplate 
                        startDate={selectedStartDate?.toLocaleDateString("id-ID")||""} 
                        endDate={selectedEndDate?.toLocaleDateString("id-ID")||""} 
                        data={printData} 
                    />
                </div>
            </div>
        </div>
    );
}