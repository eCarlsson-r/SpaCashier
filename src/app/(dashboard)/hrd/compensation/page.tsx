"use client";
import { AddPeriodModal } from '@/components/hrd/add-period-modal';
import { AdjustmentModal } from '@/components/hrd/adjustment-modal';
import { SalarySummary } from '@/components/hrd/salary-summary';
import { PrintContainer } from '@/components/print/print-container';
import { AppSelect } from '@/components/shared/AppSelect';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useModel } from '@/hooks/useModel';
import api from '@/lib/api';
import { PeriodSchema } from '@/lib/schemas';
import { Row, Table } from '@tanstack/react-table';
import { addDays, format } from 'date-fns';
import { Loader2, Plus, Printer, Save, Trash } from 'lucide-react';
import { useRef, useState, useMemo, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import z from 'zod';

type Period = z.infer<typeof PeriodSchema>;

interface CompensationRecord {
    id: number;
    employee: object;
    employee_id: string;
    grade: string;
    complete_name: string;
    base_salary: number;
    therapist_bonus: number;
    addition: number;
    addition_description: string;
    deduction: number;
    deduction_description: string;
    total: number;
    total_additions: number;
    total_deductions: number;
    grand_total: number;
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
        {
            accessorKey: "employee_id",
            header: ({ table }: { table: Table<CompensationRecord> }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }: {row: Row<CompensationRecord>}) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        { accessorKey: "employee.complete_name", header: "Nama Pegawai" },
        { accessorKey: "base_salary", header: "Gaji Pokok", cell: ({row}: {row: Row<CompensationRecord>}) => `Rp. ${formatCurr(row.original.base_salary)},-` },
        { accessorKey: "therapist_bonus", header: "Bonus Therapist", cell: ({row}: {row: Row<CompensationRecord>}) => `Rp. ${formatCurr(row.original.therapist_bonus)},-` },
        { accessorKey: "addition", header: "Tambahan", cell: ({row}: {row: Row<CompensationRecord>}) => `Rp. ${formatCurr(row.original.addition)},-` },
        { accessorKey: "addition_description", header: "Keterangan", cell: ({row}: {row: Row<CompensationRecord>}) => (<div dangerouslySetInnerHTML={{ __html: row.original.addition_description }} />) },
        { accessorKey: "deduction", header: "Potongan", cell: ({row}: {row: Row<CompensationRecord>}) => `Rp. ${formatCurr(row.original.deduction)},-` },
        { accessorKey: "deduction_description", header: "Keterangan", cell: ({row}: {row: Row<CompensationRecord>}) => (<div dangerouslySetInnerHTML={{ __html: row.original.deduction_description }} />) },
        { accessorKey: "total", header: "Gaji Bersih", cell: ({row}: {row: Row<CompensationRecord>}) => `Rp. ${formatCurr(row.original.total)},-` }
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
            if (row.employee_id == adjustment.employee_id) {
                // Calculate new totals based on the change
                const additionChange = adjustment.type === 'addition' ? adjustment.amount : 0;
                const deductionChange = adjustment.type === 'deduction' ? adjustment.amount : 0;

                const newTotalAdditions = (row.total_additions || 0) + additionChange;
                const newTotalDeductions = (row.total_deductions || 0) + deductionChange;

                const newAddition = (row.addition || 0) + additionChange;
                const newAdditionDescription = (adjustment.type === 'addition') ? (row.addition_description + (row.addition_description !== '' ? '<br/>' : '') || '') + adjustment.category + ' sebesar Rp. ' + formatCurr(additionChange) + ',-' : row.addition_description;
                const newDeduction = (row.deduction || 0) + deductionChange;
                const newDeductionDescription = (adjustment.type === 'deduction') ? (row.deduction_description + (row.deduction_description !== '' ? '<br/>' : '') || '') + adjustment.category + ' sebesar Rp. ' + formatCurr(deductionChange) + ',-' : row.deduction_description;
                const newTotal = row.base_salary + row.therapist_bonus + newAddition - newDeduction;

                return {
                    ...row,
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
        api.get(`/compensation/${selectedPeriod?.id}`)
            .then(res => {
                setTableData(res.data);
                setIsLocked(res.data.length > 0 || !!selectedPeriod?.expense_id);
                setIsLoading(false);
            });
    }, [selectedPeriod?.id, selectedPeriod?.expense_id, setIsLoading, setIsLocked]);

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

    const [rowSelection, setRowSelection] = useState({});
    const [isPreparingPDF, setIsPreparingPDF] = useState(false);

    const [printData, setPrintData] = useState<unknown>([]);
    const [printType, setPrintType] = useState<'slip' | 'report'>('slip');
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: "Slip Gaji",
    });

    const handleBulkPrint = () => {
        // This gives you the full objects of every selected row
        const selectedIds = Object.keys(rowSelection);
        const selectedRecords = tableData.filter(item =>
            selectedIds.includes(item.employee_id.toString())
        );

        if (selectedRecords.length === 0) {
            toast.error("Silahkan pilih minimal satu terapis");
            return;
        }

        onPreparePrintSlips(selectedRecords);
        setRowSelection({});
    };

    const onPreparePrintSlips = async (records: CompensationRecord[]) => {
        setIsPreparingPDF(true);

        try {
            // Fetch full details for these specific records
            const ids = records.map(r => r.employee_id);
            const response = await api.get('/compensation', {
                params: {
                    "start": selectedPeriod?.start,
                    "end": selectedPeriod?.end,
                    "employees": JSON.stringify(ids)
                }
            });
            const reportDetail: {employee: object, summaryHeader: string[], summaryBody: string[], detailTitle: string, detailHeader: string[], detailBody: string[][], detailFooter: string[], total: string | number, expense_id: number | null | undefined}[] = [];
            tableData.forEach((row) => {
                if (ids.includes(row.employee_id)) {
                    let addition = [];
                    let deduction = [];
                    let kerajinan = 0;
                    let extraBonus = 0;
                    let uangMakan = 0;
                    let thr = 0;
                    let telat = 0;
                    let absensi = 0;
                    let pulangCepat = 0;
                    let tabungan = 0;
                    let pinjaman = 0;
                    let seragam = 0;
                    let gantiRugi = 0;

                    if (row.addition_description) {
                        addition = row.addition_description.split("<br/>");
                        const extraBonusExist = addition.find(function (v: string) { return /BONUS/.test(v) });
                        if (extraBonusExist) extraBonus = parseInt(extraBonusExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const kerajinanExist = addition.find(function (v: string) { return /KERAJINAN/.test(v) });
                        if (kerajinanExist) kerajinan = parseInt(kerajinanExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const uangMakanExist = addition.find(function (v: string) { return /UANG MAKAN/.test(v) });
                        if (uangMakanExist) uangMakan = parseInt(uangMakanExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const thrExist = addition.find(function (v: string) { return /THR/.test(v) });
                        if (thrExist) thr = parseInt(thrExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                    }

                    if (row.deduction_description) {
                        deduction = row.deduction_description.split("<br/>");
                        const telatExist = deduction.find(function (v: string) { return /TELAT/.test(v) });
                        if (telatExist) telat = parseInt(telatExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const absenExist = deduction.find(function (v: string) { return /ABSENSI/.test(v) });
                        if (absenExist) absensi = parseInt(absenExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const pulangCepatExist = deduction.find(function (v: string) { return /PULANG CEPAT/.test(v) });
                        if (pulangCepatExist) pulangCepat = parseInt(pulangCepatExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const tabunganExist = deduction.find(function (v: string) { return /TABUNGAN/.test(v) });
                        if (tabunganExist) tabungan = parseInt(tabunganExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const pinjamanExist = deduction.find(function (v: string) { return /PINJAMAN/.test(v) });
                        if (pinjamanExist) pinjaman = parseInt(pinjamanExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const seragamExist = deduction.find(function (v: string) { return /SERAGAM/.test(v) });
                        if (seragamExist) seragam = parseInt(seragamExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                        const gantiRugiExist = deduction.find(function (v: string) { return /GANTI RUGI/.test(v) });
                        if (gantiRugiExist) gantiRugi = parseInt(gantiRugiExist.split(" sebesar ")[1].replace("Rp. ", "").replace(",-", "").replace(/\./g, ""));
                    }

                    const summaryHeader = [
                        (seragam > 0) ? "Seragam" : "Gaji Pokok",
                        "Uang Kerajinan"
                    ];

                    if (uangMakan > 0) summaryHeader.push("Uang Makan");

                    summaryHeader.push(
                        (gantiRugi > 0) ? "Ganti Rugi" : (
                            (pulangCepat > 0 && telat > 0 && absensi > 0) ? "Pulang Cepat" :
                                ((thr > 0) ? "THR" : ((pinjaman > 0) ? "Pinjaman" : "Tabungan"))
                        )
                    );

                    if (extraBonus > 0 && absensi == 0) summaryHeader.push("Bonus");
                    else if (pulangCepat > 0 && absensi == 0) summaryHeader.push("Pulang Cepat");
                    else summaryHeader.push("Absensi");

                    if (pulangCepat > 0 && telat == 0) summaryHeader.push("Pulang Cepat");
                    else if (extraBonus > 0 && absensi > 0 && telat == 0) summaryHeader.push("Bonus");
                    else summaryHeader.push("Telat");

                    const summaryBody = [
                        `Rp. ${formatCurr((seragam > 0) ? seragam : row["base_salary"])},-`,
                        `Rp. ${formatCurr(kerajinan)},-`
                    ];

                    if (uangMakan > 0) summaryBody.push(`Rp. ${formatCurr(uangMakan)},-`);
                    summaryBody.push(
                        (gantiRugi > 0) ? `Rp. ${formatCurr(gantiRugi)},-` : (
                            (pulangCepat > 0 && telat > 0 && absensi > 0) ? `Rp. ${formatCurr(pulangCepat)},-` : (
                                (thr > 0) ? `Rp. ${formatCurr(thr)},-` : (
                                    (pinjaman > 0) ? `Rp. ${formatCurr(pinjaman)},-` : `Rp. ${formatCurr(tabungan)},-`
                                )
                            )
                        )
                    );

                    if (extraBonus > 0 && absensi == 0) summaryBody.push(`Rp. ${formatCurr(extraBonus)},-`);
                    else if (pulangCepat > 0 && telat > 0 && absensi == 0) summaryBody.push(`Rp. ${formatCurr(pulangCepat)},-`);
                    else summaryBody.push(`Rp. ${formatCurr(absensi)},-`);

                    if (pulangCepat > 0 && telat == 0) summaryBody.push(`Rp. ${formatCurr(pulangCepat)},-`);
                    else if (extraBonus > 0 && absensi > 0 && telat == 0) summaryBody.push(`Rp. ${formatCurr(extraBonus)},-`);
                    else summaryBody.push(`Rp. ${formatCurr(telat)},-`);

                    const bonus = response.data[row.employee_id];
                    let detailTitle;
                    let detailHeader: string[] = [];
                    const detailBody: string[][] = [];
                    let detailFooter: string[] = [];
                    if (bonus) {
                        if (row.grade !== "K") {
                            detailTitle = "Bonus Therapist";
                            detailHeader = [
                                "Treatment", "Nominal Treatment", "Bonus Therapist", "Bonus Rekrut", "Ttl. Bonus"
                            ];
                            let grandTreatment = 0;
                            let grandBonus = 0;
                            let grandRecruit = 0;
                            let grandTotal = 0;
                            bonus.forEach(function(treatment: {treatment_name: string, treatment_price: string, therapist_bonus: string, recruit_bonus: string}) {
                                detailBody.push([
                                    treatment.treatment_name,
                                    `Rp. ${formatCurr(parseInt(treatment.treatment_price))},-`,
                                    `Rp. ${formatCurr(parseInt(treatment.therapist_bonus))},-`,
                                    `Rp. ${formatCurr(parseInt(treatment.recruit_bonus))},-`,
                                    `Rp. ${formatCurr(parseInt(treatment.therapist_bonus) + parseInt(treatment.recruit_bonus))},-`
                                ]);
                                grandTreatment += parseInt(treatment.treatment_price);
                                grandBonus += parseInt(treatment.therapist_bonus);
                                grandRecruit += parseInt(treatment.recruit_bonus);
                                grandTotal += parseInt(treatment.therapist_bonus) + parseInt(treatment.recruit_bonus);
                            });
                            detailFooter = [
                                "Total",
                                `Rp. ${formatCurr(grandTreatment)},-`,
                                `Rp. ${formatCurr(grandBonus)},-`,
                                `Rp. ${formatCurr(grandRecruit)},-`,
                                `Rp. ${formatCurr(grandTotal)},-`
                            ];
                        } else {
                            detailTitle = "Bonus Kasir";
                            detailHeader = [
                                "Treatment", "Ttl. Voucher", "Bonus Rekrut", "Ttl. Bonus"
                            ];
                            let grandVoucher = 0;
                            let grandRecruit = 0;
                            let grandTotal = 0;
                            bonus.forEach(function(voucher: {treatment_name: string, voucher_bonus: string, recruit_bonus: string}) {
                                detailBody.push([
                                    voucher.treatment_name,
                                    `Rp. ${formatCurr(parseInt(voucher.voucher_bonus))},-`,
                                    `Rp. ${formatCurr(parseInt(voucher.recruit_bonus))},-`,
                                    `Rp. ${formatCurr(parseInt(voucher.voucher_bonus) + parseInt(voucher.recruit_bonus))},-`
                                ]);
                                grandVoucher += parseInt(voucher.voucher_bonus);
                                grandRecruit += parseInt(voucher.recruit_bonus);
                                grandTotal += parseInt(voucher.voucher_bonus) + parseInt(voucher.recruit_bonus);
                            });
                            detailFooter = [
                                "Total",
                                `Rp. ${formatCurr(grandVoucher)},-`,
                                `Rp. ${formatCurr(grandRecruit)},-`,
                                `Rp. ${formatCurr(grandTotal)},-`
                            ];
                        }
                    }
                    reportDetail.push(
                        {
                            employee: row.employee,
                            summaryHeader: summaryHeader,
                            summaryBody: summaryBody,
                            detailTitle: detailTitle || "",
                            detailHeader: detailHeader,
                            detailBody: detailBody,
                            detailFooter: detailFooter,
                            total: `Rp. ${formatCurr(row.total)},-`,
                            expense_id: selectedPeriod?.expense_id
                        }
                    );
                }
            });

            // Update the print state with the "Rich" data
            setPrintData(reportDetail);
            setPrintType('slip');

            // Allow React to render the detailed slips
            setTimeout(() => {
                handlePrint();
                setIsPreparingPDF(false);
            }, 300);
        } catch (error) {
            if (error) console.info(error);
            setIsPreparingPDF(false);
        }
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
                            value={selectedPeriod?.id?.toString() || ""}
                            options={periods.map((p: Period) => ({
                                value: p.id?.toString() || "",
                                label: p.start + ' - ' + p.end,
                            }))}
                            onValueChange={(value) => setSelectedPeriodId(parseInt(value))}
                        />
                    </div>

                    {/* Period Management (Only for Last Period) */}
                    {isLastPeriod && (
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
                                <div className="fixed inset-0 z-100 bg-white/60 backdrop-blur-sm flex items-center justify-center">
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
                                onClick={handleBulkPrint}
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
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                getRowId={(row) => row.employee_id?.toString()}
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