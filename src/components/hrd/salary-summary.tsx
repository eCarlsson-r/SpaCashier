import { Card, CardContent } from "@/components/ui/card";

export function SalarySummary({ data }: { data: any }) {
    // Calculate totals from the table data state
    if (!data || data.length === 0) return null;
    const totals = data.reduce((acc: any, row: any) => ({
        base: acc.base + ((parseInt(row.base_salary)) + parseInt(row.therapist_bonus)) || 0,
        additions: acc.additions + (parseInt(row.addition) + parseInt(row.recruit_bonus)) || 0,
        deductions: acc.deductions + (parseInt(row.deduction)) || 0,
        grandTotal: acc.grandTotal + (parseInt(row.total)) || 0
    }), { base: 0, additions: 0, deductions: 0, grandTotal: 0 });

    return (
        <Card className="mt-6 bg-slate-50 border-dashed border-2">
            <CardContent className="p-6">
                <div className="flex flex-wrap justify-between items-center gap-6">

                    {/* Individual Pillars */}
                    <div className="flex gap-12">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Base</p>
                            <p className="text-xl font-semibold text-slate-900">
                                Rp {totals.base.toLocaleString()}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xl text-slate-300">+</span>
                            <div>
                                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Additions</p>
                                <p className="text-xl font-semibold text-emerald-700">
                                    Rp {totals.additions.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-xl text-slate-300">-</span>
                            <div>
                                <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Deductions</p>
                                <p className="text-xl font-semibold text-rose-700">
                                    Rp {totals.deductions.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Final Payout */}
                    <div className="text-right">
                        <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">Total Company Outlay</p>
                        <p className="text-3xl font-black text-slate-900">
                            Rp {totals.grandTotal.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 italic">
                            Ready for Xendit Disbursement
                        </p>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}