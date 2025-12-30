interface Props {
  data: any[];
  startDate: string;
  endDate: string;
  account: string;
}

export const LedgerTemplate = ({ data, startDate, endDate, account }: Props) => {
    // Calculate Grand Totals
    const grandTotal = Object.values(data).reduce((acc: any, curr: any) => ({
        credit: acc.credit + parseInt(curr.credit),
        debit: acc.debit + parseInt(curr.debit)
    }), { credit: 0, debit: 0 });

    const formatIDR = (val: number) => `Rp. ${new Intl.NumberFormat('id-ID').format(val)},-`;

    return (
        <div>
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8 border-b-2 pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ledger</h1>
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
                        <th className="py-3 px-2 text-sm font-semibold">Description</th>
                        <th className="py-3 px-2 text-sm font-semibold">Debit</th>
                        <th className="py-3 px-2 text-right text-sm font-semibold">Credit</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 italic text-sm">
                            <td className="py-3 px-2">{row.date}</td>
                            <td className="py-3 px-2">{row.reference}</td>
                            <td className="py-3 px-2">{row.description}</td>
                            <td className="py-3 px-2 text-right font-bold text-slate-900">{formatIDR(row.debit)}</td>
                            <td className="py-3 px-2 text-right font-bold text-slate-900">{formatIDR(row.credit)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="bg-stone-600 text-white font-bold">
                        <td colSpan={3} className="text-right pr-3">Saldo Akhir</td>
                        <td>{formatIDR(grandTotal.credit)}</td>
                        <td>{formatIDR(grandTotal.debit)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};