interface Props {
  data: any[];
  reportTitle: string;
  startDate: string;
  endDate: string;
  account: string;
  variant?: string;
}

export const CashflowReportTemplate = ({ data, reportTitle, startDate, endDate, account, variant = '1' }: Props) => {
    // Calculate Grand Totals
    const grandTotal = Object.values(data).reduce((acc: any, curr: any) => ({
        total: acc.total + parseInt(curr.amount)
    }), { total: 0 });

    const formatIDR = (val: number) => `Rp. ${new Intl.NumberFormat('id-ID').format(val)},-`;

    return (
        <div className={variant === '2' ? 'landscape-print' : 'portrait-print'}>
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8 border-b-2 pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{reportTitle}</h1>
                    <p className="text-slate-500 uppercase font-semibold">Account: {account}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold uppercase text-xs text-slate-400">Date</p>
                    {startDate === endDate ? (<p className="text-lg font-bold">{startDate}</p>):(<p className="text-lg font-bold">{startDate} until {endDate}</p>)}
                </div>
            </div>

            {/* Main Table */}
            <table className="w-full">
                <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                        <th className="py-3 px-2 text-sm font-semibold">Date</th>
                        <th className="py-3 px-2 text-sm font-semibold">Reference No.</th>
                        <th className="py-3 px-2 text-sm font-semibold">Partner</th>
                        <th className="py-3 px-2 text-sm font-semibold">Description</th>
                        {variant === '2' && (
                            <>
                                <th className="py-3 px-2 text-sm font-semibold">Payment Type</th>
                                <th className="py-3 px-2 text-sm font-semibold">Payment Tool</th>
                            </>
                        )}
                        <th className="py-3 px-2 text-right text-sm font-semibold">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 italic text-sm">
                            <td className="py-3 px-2">{row.date}</td>
                            <td className="py-3 px-2">{row.journal_reference}</td>
                            <td className="py-3 px-2">{row.partner}</td>
                            <td className="py-3 px-2">{row.description}</td>
                            {/* These only show in Variant 2 */}
                            {variant === '2' && (
                                <>
                                    <td className="py-3 px-2">{row.pay_type}</td>
                                    <td className="py-3 px-2">{row.pay_tool}</td>
                                </>
                            )}
                            <td className="py-3 px-2 text-right font-bold text-slate-900">{formatIDR(row.amount)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-stone-600 text-white font-bold">
                        <td colSpan={variant === '2' ? 6 : 4} className="text-right pr-3">GRAND TOTAL</td>
                        <td>{formatIDR(grandTotal.total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};