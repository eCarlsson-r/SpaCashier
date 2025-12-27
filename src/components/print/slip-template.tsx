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

                    <table className="w-full mt-4">
                        <thead>
                            <tr>
                                {record.summaryHeader.map((header: string, index: number) => (
                                    <th key={'summaryHeader' + index} className="py-3 px-2 text-left text-sm font-semibold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-100 italic text-sm">
                                {record.summaryBody.map((body: string, index: number) => (
                                    <td key={'summaryBody' + index} className="py-3 px-2">{body}</td>
                                ))}
                            </tr>
                        </tbody>
                    </table>

                    <table className="w-full mt-4">
                        <thead>
                            <tr>
                                {record.detailHeader.map((header: string, index: number) => (
                                    <th key={'detailHeader' + index} className="py-3 px-2 text-left text-sm font-semibold">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {record.detailBody.map((body: string[], index: number) => (
                                <tr key={'detailBody' + index} className="border-b border-slate-100 italic text-sm">
                                    {body.map((item: string, index: number) => (
                                        <td key={'detailBody' + index} className="py-3 px-2">{item}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                {record.detailFooter.map((footer: string, index: number) => (
                                    <td key={'detailFooter' + index} className="py-3 px-2 text-left text-sm font-semibold">{footer}</td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Nett Payable</h2>
                        <span className="text-xl font-bold">{record.total}</span>
                    </div>

                    {record.expenseId && (<div className="flex justify-between items-center mb-6">
                        <span className="text-sm">Gaji sudah ditransfer ke rekening :</span>
                        <span className="text-sm">Bank : {record.employee.bank}</span>
                        <span className="text-sm">Nomor Rekening : {record.employee.bank_account}</span>
                        <span className="text-sm">Atas nama : {record.employee.complete_name}</span>
                    </div>)}
                </div>
            ))}
        </div>
    );
});