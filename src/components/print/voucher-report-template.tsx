import { Fragment, useMemo } from "react";

export const groupVoucherByTreatmentName = (data: any[]) => {
  return data.reduce((acc, voucher) => {
    const key = voucher.name;
    if (!acc[key]) {
      acc[key] = {
        items: [],
        subAmount: 0
      };
    }
    
    acc[key].items.push(voucher);
    acc[key].subAmount += parseInt(voucher.amount);

    return acc;
  }, {});
};

export const VoucherReportTemplate = ({ variant, endDate, data }: { variant: string, endDate: string, data: any[] }) => {
    // Use useMemo so we don't re-calculate totals on every render
    const voucherRecords = useMemo(() => groupVoucherByTreatmentName(data), [data]);

    // Calculate Grand Totals
    const grandTotal = Object.values(voucherRecords).reduce((acc: any, curr: any) => ({
        amount: acc.amount + curr.subAmount,
    }), { amount: 0 });

    const formatIDR = (val: number) => `Rp. ${new Intl.NumberFormat('id-ID').format(val)},-`;

    return (
        <div className="p-3 bg-white min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8 border-b-2 pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Voucher Stock Report</h1>
                    <p className="text-slate-500 uppercase font-semibold">Report Variant: {variant}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold uppercase text-xs text-slate-400">Report until</p>
                    <p className="text-lg font-bold">{endDate}</p>
                </div>
            </div>

            {/* Main Table */}
            <table className="w-full">
                <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                        {variant == "QTY" ? (
                                <>
                                    <th className="py-3 px-2 text-sm font-semibold">Treatment Name</th>
                                    <th className="py-3 px-2 text-sm font-semibold">Vouchers</th>
                                    <th className="py-3 px-2 text-sm font-semibold">Count</th>
                                    <th className="py-3 px-2 text-sm font-semibold">Customer Name</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3 px-2 text-sm font-semibold">Treatment Name</th>
                                    <th className="py-3 px-2 text-sm font-semibold">Period</th>
                                    <th className="py-3 px-2 text-sm font-semibold">Count</th>
                                    <th className="py-3 px-2 text-sm font-semibold">Amount</th>
                                </>
                            )}
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(voucherRecords).map(([treatmentName, group]: [string, any]) => (
                    <Fragment key={treatmentName}>
                        {/* Payment Group Header */}
                        <tr className="bg-brown-50 font-bold">
                            <td colSpan={6} className="p-2">{treatmentName}</td>
                        </tr>

                        {/* Individual Records */}
                        {group.items.map((item, idx) => (
                        <tr key={idx} className="border-b">
                            {variant == "QTY" ? (
                                <>
                                    <td className="text-sm">{item.name}</td>
                                    <td className="text-sm">{item.range}</td>
                                    <td className="text-sm">{item.count}</td>
                                    <td className="text-sm">{item["customer-name"]}</td>
                                </>
                            ) : (
                                <>
                                    <td className="text-sm">{item.name}</td>
                                    <td className="text-sm">{item.month} {item.year}</td>
                                    <td className="text-sm">{item.count}</td>
                                    <td className="text-sm">{formatIDR(item.amount)}</td>
                                </>
                            )}
                        </tr>
                        ))}

                        {/* Subtotal Row */}
                        {variant != "QTY" && (
                        <tr className="font-bold italic bg-gray-50">
                            <td colSpan={3} className="text-right text-sm pr-3">Subtotal</td>
                            <td className="text-sm">{formatIDR(group.subAmount)}</td>
                        </tr>
                        )}
                    </Fragment>
                    ))}
                </tbody>
                {variant != "QTY" && (
                <tfoot>
                    <tr className="bg-stone-600 text-white font-bold">
                        <td colSpan={3} className="text-right pr-3">GRAND TOTAL</td>
                        <td>{formatIDR(grandTotal.subtotal)}</td>
                    </tr>
                </tfoot>
                )}
            </table>
        </div>
    );
};