"use client";
import { AddPeriodModal } from '@/components/hrd/add-period-modal';
import { AdjustmentModal } from '@/components/hrd/adjustment-modal';
import { SalarySummary } from '@/components/hrd/salary-summary';
import { PrintContainer } from '@/components/print/print-container';
import { AppSelect } from '@/components/shared/AppSelect';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { useModel } from '@/hooks/useModel';
import api from '@/lib/api';
import { PeriodSchema } from '@/lib/schemas';
import { addDays, addMonths, format, lastDayOfMonth } from 'date-fns';
import { Loader2, Plus, Printer, Save, Trash } from 'lucide-react';
import { useRef, useState, useMemo, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import z from 'zod';

type Period = z.infer<typeof PeriodSchema>;

interface CompensationRecord {
    id: number;
    employee_id: string;
    complete_name: string;
    base_salary: number;
    therapist_bonus: string;
    addition: number;
    addition_description: string;
    deduction: number;
    deduction_description: string;
    total: number;
    total_additions: number;
    total_deductions: number;
    grand_total: number;
    adjustments?: any[];
}

export function usePayrollPeriods() {
    const [periods, setPeriods] = useState<Period[]>([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch periods on mount
    useEffect(() => {
        api.get('/period').then(res => {
            setPeriods(res.data);
            // Default to the most recent period if nothing is selected
            if (res.data.length > 0) setSelectedPeriodId(res.data[0].id);
            setIsLoading(false);
        });
    }, []);

    // Find the full object for the selected period
    const selectedPeriod = useMemo(() => {
        if (!selectedPeriodId) return null;
        return periods.find((p: z.infer<typeof PeriodSchema>) => p.id === selectedPeriodId);
    }, [periods, selectedPeriodId]);

    // UI Logic Helpers
    const isLastPeriod = periods.length > 0 && selectedPeriodId === periods[0].id;

    return {
        periods,
        selectedPeriod,
        selectedPeriodId,
        setSelectedPeriodId,
        setIsLoading,
        isLoading,
        isLastPeriod,
        // Helper to refresh the list after "Add Period"
        refreshPeriods: () => {
            api.get('/period').then(res => {
                setPeriods(res.data);
                // Default to the most recent period if nothing is selected
                if (res.data.length > 0) setSelectedPeriodId(res.data[0].id);
                setIsLoading(false);
            });
        }
    };
}

export default function CompensationPage() {
    const { selectedPeriod, periods, setSelectedPeriodId, refreshPeriods, setIsLoading } = usePayrollPeriods();
    const [tableData, setTableData] = useState<CompensationRecord[]>([]);
    const isLastPeriod = selectedPeriod?.id === periods[0]?.id;
    const [isLocked, setIsLocked] = useState(!!selectedPeriod?.expense_id);

    const [activeModal, setActiveModal] = useState<"addition" | "deduction" | "period" | null>(null);
    // Helper to format currency
    const formatCurr = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    const salaryColumns = [
        { accessorKey: "employee_id", header: "No.Pegawai" },
        { accessorKey: "employee.complete_name", header: "Nama Pegawai" },
        { accessorKey: "base_salary", header: "Gaji Pokok", cell: ({ row }: any) => `Rp. ${formatCurr(row.original.base_salary)},-` },
        { accessorKey: "therapist_bonus", header: "Bonus Therapist", cell: ({ row }: any) => `Rp. ${formatCurr(row.original.therapist_bonus)},-` },
        { accessorKey: "addition", header: "Tambahan", cell: ({ row }: any) => `Rp. ${formatCurr(row.original.addition)},-` },
        { accessorKey: "addition_description", header: "Keterangan", cell: ({ row }: any) => (<div dangerouslySetInnerHTML={{ __html: row.original.addition_description }} />) },
        { accessorKey: "deduction", header: "Potongan", cell: ({ row }: any) => `Rp. ${formatCurr(row.original.deduction)},-` },
        { accessorKey: "deduction_description", header: "Keterangan", cell: ({ row }: any) => (<div dangerouslySetInnerHTML={{ __html: row.original.deduction_description }} />) },
        { accessorKey: "total", header: "Gaji Bersih", cell: ({ row }: any) => `Rp. ${formatCurr(row.original.total)},-` },
        {
            id: "actions",
            cell: ({ row }: any) => {
                if (!isLastPeriod || isLocked) return (
                    <Button
                        disabled={isPreparingPDF}
                        onClick={() => onPreparePrint('slip', [row.original])}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Print Slips
                    </Button>
                )
            }
        }
    ];


    const [endDate, setEndDate] = useState<Date>(new Date(selectedPeriod?.end || new Date()));

    const handleAddPeriod = () => {
        // 1. Calculate the next dates locally or fetch a preview from Laravel
        const nextStart = addDays(periods[0].end, 1);
        const nextEnd = endDate;

        // 2. Show a simple confirmation instead of a form
        api.post('/period', {
            start: format(nextStart, 'yyyy-MM-dd'),
            end: format(nextEnd, 'yyyy-MM-dd')
        }).then(() => {
            refreshPeriods();
        }).catch(e => {
            console.log(e);
        });
    };

    const handleRemovePeriod = () => {
        api.delete('/period/' + selectedPeriod?.id).then(() => {
            refreshPeriods();
        }).catch(e => {
            console.log(e);
        });
    };

    const handleApplyAdjustment = (adjustment: { employee_id: string, amount: number, type: 'addition' | 'deduction', category: string }) => {
        setTableData(prevData => prevData.map(row => {
            console.info(row, adjustment);
            if (row.employee_id == adjustment.employee_id) {
                // Update the array of adjustments for this specific therapist
                const updatedAdjustments = [...(row.adjustments || []), adjustment];

                // Calculate new totals based on the change
                const additionChange = adjustment.type === 'addition' ? adjustment.amount : 0;
                const deductionChange = adjustment.type === 'deduction' ? adjustment.amount : 0;

                const newTotalAdditions = (row.total_additions || 0) + additionChange;
                const newTotalDeductions = (row.total_deductions || 0) + deductionChange;

                const newAddition = (row.addition || 0) + additionChange;
                const newAdditionDescription = (adjustment.type === 'addition') ? (row.addition_description + (row.addition_description !== '' ? '<br/>' : '') || '') + adjustment.category + ' sebesar Rp. ' + formatCurr(additionChange) + ',-' : row.addition_description;
                const newDeduction = (row.deduction || 0) + deductionChange;
                const newDeductionDescription = (adjustment.type === 'deduction') ? (row.deduction_description + (row.deduction_description !== '' ? '<br/>' : '') || '') + adjustment.category + ' sebesar Rp. ' + formatCurr(deductionChange) + ',-' : row.deduction_description;
                const newTotal = row.base_salary + (parseInt(row.therapist_bonus) || 0) + newAddition - newDeduction;

                return {
                    ...row,
                    adjustments: updatedAdjustments,
                    total_additions: newTotalAdditions,
                    total_deductions: newTotalDeductions,
                    addition: newAddition,
                    addition_description: newAdditionDescription,
                    deduction: newDeduction,
                    deduction_description: newDeductionDescription,
                    grand_total: newTotal,
                    total: newTotal
                };
            }
            return row;
        }));
    };

    // Inside your CompensationPage
    useEffect(() => {
        if (!selectedPeriod?.id) return;

        setIsLoading(true);
        // You MUST include the period ID in your API call
        api.get(`/compensation?period_id=${selectedPeriod?.id}`)
            .then(res => {
                setTableData(res.data);
                setIsLocked(res.data.length > 0 || !!selectedPeriod?.expense_id);
                setIsLoading(false);
            });
    }, [selectedPeriod?.id]);

    const fetchNewCompensationData = () => {
        api.get('/compensation', {
            params: {
                start: selectedPeriod?.start,
                end: selectedPeriod?.end
            }
        }).then(res => {
            setTableData(res.data);
        }).catch(e => {
            console.log(e);
        });
    };

    const handleSaveAll = () => {
        api.post('/compensation/', {
            period_id: selectedPeriod?.id,
            compensations: tableData
        }).then(() => {
            refreshPeriods();
        }).catch(e => {
            console.log(e);
        });
    };

    const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
    const [isPreparingPDF, setIsPreparingPDF] = useState(false);

    const [printData, setPrintData] = useState<any>([]);
    const [printType, setPrintType] = useState<'slip' | 'report'>('slip');
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Slip Gaji",
    });

    // Logic: If checkboxes are used, print only those. 
    // If nothing is checked, assume the user wants to print the whole table.
    const recordsToPrint = useMemo(() => {
        if (selectedRowIds.size === 0) {
            return tableData; // Fallback: Print all if none selected
        }

        return tableData.filter((row: CompensationRecord) =>
            selectedRowIds.has(row.id.toString())
        );
    }, [tableData, selectedRowIds]);

    const onPreparePrint = (type: 'slip' | 'report', data: any[]) => {
        setIsPreparingPDF(true);
        setPrintType(type);
        setPrintData(data);

        // Allow React 150ms to render the hidden DOM nodes
        setTimeout(() => {
            handlePrint();
            setIsPreparingPDF(false);
        }, 150);
    };

    const onPrintReport = () => {
        setPrintType('report');
        setPrintData(tableData);
        // Triggering after a small delay ensures the 'report' template is loaded into the ref
        setTimeout(() => {
            if (printRef.current) {
                handlePrint();
            }
        }, 250);
    };

    return (
        <div className="space-y-4 p-6">
            <div className="flex justify-between items-end">
                <div className="flex gap-4 items-end">
                    {/* Period Selector Component */}
                    <div className="w-64">
                        <label className="text-xs font-bold text-slate-500">PAYROLL PERIODE</label>
                        <AppSelect
                            value={selectedPeriod?.id.toString() || ""}
                            options={periods.map((p: Period) => ({
                                value: p.id,
                                label: p.start + ' - ' + p.end,
                            }))}
                            onValueChange={(value) => setSelectedPeriodId(parseInt(value))}
                        />
                    </div>

                    {/* Period Management (Only for Last Period) */}
                    {isLastPeriod && !isLocked && (
                        <div className="flex gap-2">
                            <Button onClick={() => setActiveModal("period")} variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-1" /> Add Period
                            </Button>
                            <Button onClick={handleRemovePeriod} variant="ghost" size="sm" className="text-rose-600">
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main Action Buttons */}
                <div className="flex gap-2">
                    {isLastPeriod && !isLocked ? (
                        <>
                            <Button onClick={fetchNewCompensationData} variant="outline">Fetch Data</Button>
                            <Button onClick={() => setActiveModal('addition')} className="bg-emerald-600 hover:bg-emerald-700">Add to Salary</Button>
                            <Button onClick={() => setActiveModal('deduction')} className="bg-rose-600 hover:bg-rose-700">Deduct</Button>
                            <Button onClick={handleSaveAll} className="bg-sky-600 hover:bg-sky-700">
                                <Save className="w-4 h-4 mr-2" /> Save All
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            {isPreparingPDF && (
                                <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
                                        <p className="text-sm font-medium animate-pulse">Preparing Documents...</p>
                                    </div>
                                </div>
                            )}

                            <Button
                                disabled={isPreparingPDF}
                                onClick={onPrintReport}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Report
                            </Button>
                            <Button
                                disabled={isPreparingPDF}
                                onClick={() => onPreparePrint('slip', selectedRowIds.size > 0 ? recordsToPrint : tableData)}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Slips
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* The Main Table */}
            <DataTable
                columns={salaryColumns}
                data={tableData}
            />

            {/* The real-time summary footer */}
            <SalarySummary data={tableData} />

            <PrintContainer
                ref={printRef}
                period={selectedPeriod}
                type={printType}
                data={printData}
            />

            {/* All our Modals */}
            <AddPeriodModal
                isOpen={activeModal === "period"}
                onClose={() => setActiveModal(null)}
                endDate={endDate}
                setEndDate={setEndDate}
                lastToDate={selectedPeriod?.end}
                onSave={handleAddPeriod}
            />

            <AdjustmentModal
                isOpen={activeModal === "addition" || activeModal === "deduction"}
                onClose={() => setActiveModal(null)}
                type={activeModal === "addition" ? "addition" : "deduction"}
                employees={useModel("employee", { mode: "select" }).options}
                onApply={handleApplyAdjustment}
            />
        </div>
    );
}