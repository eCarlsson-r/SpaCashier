import React from "react";

export const BulkSlipTemplate = React.forwardRef(({ selectedRecords, period }: { selectedRecords: any, period: any }, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div ref={ref} className="hidden print:block">
            {selectedRecords.map((record: any, index: number) => (
                <div
                    key={record.id}
                    className="p-8 h-screen border-b border-slate-200"
                    style={{ breakAfter: 'page' }} // The "Magic" CSS line
                >
                    {/* Your Individual Slip Gaji Design Here */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">SLIP GAJI</h2>
                        <span className="text-sm">#{record.employee_id}</span>
                    </div>

                    <div className="space-y-2">
                        <p><strong>Nama:</strong> {record.employee.complete_name}</p>
                        <p><strong>Periode:</strong> {period.label}</p>
                    </div>

                    {/* ... Table of Additions/Deductions ... */}
                    <table className="w-full mt-4">
                        <thead>
                            <tr>
                                <th className="py-3 px-2 text-left text-sm font-semibold">Addition</th>
                                <th className="py-3 px-2 text-right text-sm font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.addition_description.split("<br/>").map((addition: any) => (
                                <tr key={addition.id} className="border-b border-slate-100 italic text-sm">
                                    <td className="py-3 px-2">{addition.split(" sebesar ")[0]}</td>
                                    <td className="py-3 px-2 text-right">{addition.split(" sebesar ")[1]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <table className="w-full mt-4">
                        <thead>
                            <tr>
                                <th className="py-3 px-2 text-left text-sm font-semibold">Deduction</th>
                                <th className="py-3 px-2 text-right text-sm font-semibold">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {record.deduction_description.split("<br/>").map((deduction: any) => (
                                <tr key={deduction.id} className="border-b border-slate-100 italic text-sm">
                                    <td className="py-3 px-2">{deduction.split(" sebesar ")[0]}</td>
                                    <td className="py-3 px-2 text-right">{deduction.split(" sebesar ")[1]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
});