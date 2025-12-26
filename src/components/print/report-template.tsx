const calculateTotals = (data: any[]) => {
    return data.reduce((acc: any, row: any) => ({
        base: acc.base + ((parseInt(row.base_salary)) + parseInt(row.therapist_bonus)) || 0,
        additions: acc.additions + (parseInt(row.addition) + parseInt(row.recruit_bonus)) || 0,
        deductions: acc.deductions + (parseInt(row.deduction)) || 0,
        grandTotal: acc.grandTotal + (parseInt(row.total)) || 0
    }), { base: 0, additions: 0, deductions: 0, grandTotal: 0 });
};

export const PayrollReportTemplate = ({ data, period }: { data: any[], period: any }) => {
    // 1. Run the calculation based on the current data prop
    const totals = calculateTotals(data);

    return (
        <div className="p-10 bg-white min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8 border-b-2 pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">PAYROLL SUMMARY REPORT</h1>
                    <p className="text-slate-500 uppercase font-semibold">Status: {period?.status || 'DRAFT'}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold uppercase text-xs text-slate-400">Period</p>
                    <p className="text-lg font-bold">{period?.label}</p>
                </div>
            </div>

            {/* Main Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="py-3 px-2 text-left text-sm font-semibold">Employee</th>
                        <th className="py-3 px-2 text-right text-sm font-semibold">Base Salary</th>
                        <th className="py-3 px-2 text-right text-sm font-semibold">Additions</th>
                        <th className="py-3 px-2 text-right text-sm font-semibold">Deductions</th>
                        <th className="py-3 px-2 text-right text-sm font-semibold">Grand Total</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 italic text-sm">
                            <td className="py-3 px-2">{row.employee.complete_name}</td>
                            <td className="py-3 px-2 text-right">{((parseInt(row.base_salary)) + parseInt(row.therapist_bonus)).toLocaleString()}</td>
                            <td className="py-3 px-2 text-right text-emerald-600">+{(parseInt(row.addition) + parseInt(row.recruit_bonus)).toLocaleString()}</td>
                            <td className="py-3 px-2 text-right text-rose-600">-{row.deduction?.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right font-bold text-slate-900">{row.total?.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* 2. Use the 'totals' object here to fix the "Rp 0" issue */}
            <div className="flex justify-end pt-4 border-t-2 border-slate-900">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
                    <span className="text-slate-500 font-medium">Total Base Salary:</span>
                    <span className="font-semibold">Rp {totals.base.toLocaleString()}</span>

                    <span className="text-slate-500 font-medium">Total Adjustments:</span>
                    <span className="font-semibold text-emerald-600">
                        +Rp {(totals.additions - totals.deductions).toLocaleString()}
                    </span>

                    <span className="text-xl font-bold uppercase tracking-tighter pt-2 border-t">Total Payout:</span>
                    <span className="text-xl font-black pt-2 border-t">Rp {totals.grandTotal.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};