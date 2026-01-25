import { Fragment, useMemo } from "react";

// --- Type Definitions ---

type VoucherSalesRow = {
  date: string;
  journal_reference: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
};

type WalkinVoucherUsageRow = {
  date: string;
  time: string;
  reference: string;
  therapist_name: string;
  description: string;
  price: number;
};

type SalesByDateRow = {
  date: string;
  treatment: string;
  voucher_quantity: number;
  voucher_price: number;
  walkin_quantity: number;
  walkin_price: number;
  voucher_usage: number;
  total_quantity: number;
  total_price: number;
};

type SalesByTreatmentRow = {
  treatment: string;
  voucher_quantity: number;
  voucher_price: number;
  walkin_quantity: number;
  walkin_price: number;
  voucher_usage: number;
  total_quantity: number;
  total_price: number;
};

export const groupVoucherSalesByDate = (data: VoucherSalesRow[]) => {
  return data.reduce(
    (
      acc: {
        [key: string]: {
          items: VoucherSalesRow[];
          subQuantity: number;
          subPrice: number;
          subTotal: number;
        };
      },
      record: VoucherSalesRow,
    ) => {
      const key = record.date;
      if (!acc[key]) {
        acc[key] = {
          items: [],
          subQuantity: 0,
          subPrice: 0,
          subTotal: 0,
        };
      }

      acc[key].items.push(record);
      acc[key].subQuantity += record.quantity;
      acc[key].subPrice += record.price;
      acc[key].subTotal += record.total;

      return acc;
    },
    {},
  );
};

export const groupWalkinVoucherUsageByDate = (
  data: WalkinVoucherUsageRow[],
) => {
  return data.reduce(
    (
      acc: {
        [key: string]: { items: WalkinVoucherUsageRow[]; subPrice: number };
      },
      record: WalkinVoucherUsageRow,
    ) => {
      const key = record.date;
      if (!acc[key]) {
        acc[key] = {
          items: [],
          subPrice: 0,
        };
      }

      acc[key].items.push(record);
      acc[key].subPrice += record.price;

      return acc;
    },
    {},
  );
};

export const groupRecordByDate = (data: SalesByDateRow[]) => {
  return data.reduce(
    (
      acc: {
        [key: string]: {
          items: SalesByDateRow[];
          subVoucherQuantity: number;
          subVoucherPrice: number;
          subWalkinQuantity: number;
          subWalkinPrice: number;
          subVoucherUsage: number;
          subTotalQuantity: number;
          subTotalPrice: number;
        };
      },
      record: SalesByDateRow,
    ) => {
      const key = record.date;
      if (!acc[key]) {
        acc[key] = {
          items: [],
          subVoucherQuantity: 0,
          subVoucherPrice: 0,
          subWalkinQuantity: 0,
          subWalkinPrice: 0,
          subVoucherUsage: 0,
          subTotalQuantity: 0,
          subTotalPrice: 0,
        };
      }

      acc[key].items.push(record);
      acc[key].subVoucherQuantity += record.voucher_quantity;
      acc[key].subVoucherPrice += record.voucher_price;
      acc[key].subWalkinQuantity += record.walkin_quantity;
      acc[key].subWalkinPrice += record.walkin_price;
      acc[key].subVoucherUsage += record.voucher_usage;
      acc[key].subTotalQuantity += record.total_quantity;
      acc[key].subTotalPrice += record.total_price;

      return acc;
    },
    {},
  );
};

export const groupRecordByTreatment = (data: SalesByTreatmentRow[]) => {
  return data.reduce(
    (
      acc: {
        [key: string]: {
          items: SalesByTreatmentRow[];
          subVoucherQuantity: number;
          subVoucherPrice: number;
          subWalkinQuantity: number;
          subWalkinPrice: number;
          subVoucherUsage: number;
          subTotalQuantity: number;
          subTotalPrice: number;
        };
      },
      record: SalesByTreatmentRow,
    ) => {
      const key = record.treatment;
      if (!acc[key]) {
        acc[key] = {
          items: [],
          subVoucherQuantity: 0,
          subVoucherPrice: 0,
          subWalkinQuantity: 0,
          subWalkinPrice: 0,
          subVoucherUsage: 0,
          subTotalQuantity: 0,
          subTotalPrice: 0,
        };
      }

      acc[key].items.push(record);
      acc[key].subVoucherQuantity += record.voucher_quantity;
      acc[key].subVoucherPrice += record.voucher_price;
      acc[key].subWalkinQuantity += record.walkin_quantity;
      acc[key].subWalkinPrice += record.walkin_price;
      acc[key].subVoucherUsage += record.voucher_usage;
      acc[key].subTotalQuantity += record.total_quantity;
      acc[key].subTotalPrice += record.total_price;

      return acc;
    },
    {},
  );
};

export const DetailedReportTemplate = ({
  reportTitle,
  variant,
  startDate,
  endDate,
  data,
}: {
  reportTitle: string;
  variant: string;
  startDate: string;
  endDate: string;
  data:
    | VoucherSalesRow[]
    | WalkinVoucherUsageRow[]
    | SalesByDateRow[]
    | SalesByTreatmentRow[];
}) => {
  // Use useMemo so we don't re-calculate totals on every render

  const records = useMemo(() => {
    if (variant === "voucher_sales") {
      return groupVoucherSalesByDate(data as VoucherSalesRow[]);
    } else if (variant === "walkin_voucher_usage") {
      return groupWalkinVoucherUsageByDate(data as WalkinVoucherUsageRow[]);
    } else if (variant === "sales_by_date") {
      return groupRecordByDate(data as SalesByDateRow[]);
    } else if (variant === "sales_by_treatment") {
      return groupRecordByTreatment(data as SalesByTreatmentRow[]);
    } else return data;
  }, [variant, data]);

  // Calculate Grand Totals
  const grandTotal = Object.values(records).reduce(
    (acc, curr) => ({
      quantity: acc.quantity + curr.subQuantity,
      price: acc.price + curr.subPrice,
      total: acc.total + curr.subTotal,
      voucher_quantity: acc.voucher_quantity + curr.subVoucherQuantity,
      voucher_price: acc.voucher_price + curr.subVoucherPrice,
      walkin_quantity: acc.walkin_quantity + curr.subWalkinQuantity,
      walkin_price: acc.walkin_price + curr.subWalkinPrice,
      voucher_usage: acc.voucher_usage + curr.subVoucherUsage,
      total_quantity: acc.total_quantity + curr.subTotalQuantity,
      total_price: acc.total_price + curr.subTotalPrice,
    }),
    {
      quantity: 0,
      price: 0,
      total: 0,
      voucher_quantity: 0,
      voucher_price: 0,
      walkin_quantity: 0,
      walkin_price: 0,
      voucher_usage: 0,
      total_quantity: 0,
      total_price: 0,
    },
  );

  const formatIDR = (val: number) =>
    `Rp. ${new Intl.NumberFormat("id-ID").format(val)},-`;

  return (
    <div className="p-3 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{reportTitle}</h1>
        </div>
        <div className="text-right">
          <p className="font-bold uppercase text-xs text-slate-400">Date</p>
          {startDate === endDate ? (
            <p className="text-lg font-bold">{startDate}</p>
          ) : (
            <p className="text-lg font-bold">
              {startDate} s/d {endDate}
            </p>
          )}
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full">
        <thead>
          {variant == "voucher-sales" && (
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="py-2 px-2 text-sm font-semibold">Reference</th>
              <th className="py-2 px-2 text-sm font-semibold">Description</th>
              <th className="py-2 px-2 text-sm font-semibold">Quantity</th>
              <th className="py-2 px-2 text-sm font-semibold">Price</th>
              <th className="py-2 px-2 text-sm font-semibold">Total</th>
            </tr>
          )}
          {variant == "walkin-voucher-usage" && (
            <tr className="bg-slate-50 border-y border-slate-200">
              <th className="py-3 px-2 text-sm font-semibold">Date</th>
              <th className="py-3 px-2 text-sm font-semibold">Time</th>
              <th className="py-3 px-2 text-sm font-semibold">Reference</th>
              <th className="py-3 px-2 text-sm font-semibold">Therapist</th>
              <th className="py-3 px-2 text-sm font-semibold">Description</th>
              <th className="py-3 px-2 text-sm font-semibold">Price</th>
            </tr>
          )}
          {variant == "sales-by-date" && (
            <>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-3 px-2 text-sm font-semibold" rowSpan={2}>
                  Treatment
                </th>
                <th className="py-3 px-2 text-sm font-semibold" colSpan={2}>
                  Voucher Sales
                </th>
                <th className="py-3 px-2 text-sm font-semibold" colSpan={2}>
                  WalkIn Sales
                </th>
                <th className="py-3 px-2 text-sm font-semibold" rowSpan={2}>
                  Voucher Usage
                </th>
                <th className="py-3 px-2 text-sm font-semibold" colSpan={2}>
                  Total
                </th>
              </tr>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-3 px-2 text-sm font-semibold">Qty.</th>
                <th className="py-3 px-2 text-sm font-semibold">Amount</th>
                <th className="py-3 px-2 text-sm font-semibold">Qty</th>
                <th className="py-3 px-2 text-sm font-semibold">Amount</th>
                <th className="py-3 px-2 text-sm font-semibold">Qty</th>
                <th className="py-3 px-2 text-sm font-semibold">Amount</th>
              </tr>
            </>
          )}
          {variant == "sales-by-treatment" && (
            <>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-3 px-2 text-sm font-semibold" rowSpan={2}>
                  Treatment
                </th>
                <th className="py-3 px-2 text-sm font-semibold" colSpan={2}>
                  Voucher Sales
                </th>
                <th className="py-3 px-2 text-sm font-semibold" colSpan={2}>
                  WalkIn Sales
                </th>
                <th className="py-3 px-2 text-sm font-semibold" rowSpan={2}>
                  Voucher Usage
                </th>
                <th className="py-3 px-2 text-sm font-semibold" colSpan={2}>
                  Total
                </th>
              </tr>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-3 px-2 text-sm font-semibold">Qty.</th>
                <th className="py-3 px-2 text-sm font-semibold">Amount</th>
                <th className="py-3 px-2 text-sm font-semibold">Qty</th>
                <th className="py-3 px-2 text-sm font-semibold">Amount</th>
                <th className="py-3 px-2 text-sm font-semibold">Qty</th>
                <th className="py-3 px-2 text-sm font-semibold">Amount</th>
              </tr>
            </>
          )}
        </thead>
        <tbody>
          {Object.entries(records).map(([treatmentName, group]) => (
            <Fragment key={treatmentName}>
              {/* Payment Group Header */}
              {treatmentName && (
                <tr className="bg-brown-50 font-bold">
                  <td colSpan={6} className="p-2">
                    {treatmentName}
                  </td>
                </tr>
              )}

              {/* Individual Records */}
              {variant == "voucher-sales" &&
                group.items.map((item: VoucherSalesRow, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="text-sm">{item.journal_reference}</td>
                    <td className="text-sm">{item.description}</td>
                    <td className="text-sm">{item.quantity}</td>
                    <td className="text-sm">{formatIDR(item.price)}</td>
                    <td className="text-sm">{formatIDR(item.total)}</td>
                  </tr>
                ))}
              {variant == "walkin-voucher-usage" &&
                group.items.map((item: WalkinVoucherUsageRow, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="text-sm">{item.date}</td>
                    <td className="text-sm">{item.time}</td>
                    <td className="text-sm">{item.reference}</td>
                    <td className="text-sm">{item.therapist_name}</td>
                    <td className="text-sm">{item.description}</td>
                    <td className="text-sm">{item.price}</td>
                  </tr>
                ))}
              {variant == "sales-by-date" &&
                group.items.map((item: SalesByDateRow, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="text-sm">{item.treatment}</td>
                    <td className="text-sm">{item.voucher_quantity}</td>
                    <td className="text-sm">{formatIDR(item.voucher_price)}</td>
                    <td className="text-sm">{item.walkin_quantity}</td>
                    <td className="text-sm">{formatIDR(item.walkin_price)}</td>
                    <td className="text-sm">{item.voucher_usage}</td>
                    <td className="text-sm">{item.total_quantity}</td>
                    <td className="text-sm">{formatIDR(item.total_price)}</td>
                  </tr>
                ))}
              {variant == "sales-by-treatment" &&
                group.items.map((item: SalesByTreatmentRow, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="text-sm">{item.treatment}</td>
                    <td className="text-sm">{item.voucher_quantity}</td>
                    <td className="text-sm">{formatIDR(item.voucher_price)}</td>
                    <td className="text-sm">{item.walkin_quantity}</td>
                    <td className="text-sm">{formatIDR(item.walkin_price)}</td>
                    <td className="text-sm">{item.voucher_usage}</td>
                    <td className="text-sm">{item.total_quantity}</td>
                    <td className="text-sm">{formatIDR(item.total_price)}</td>
                  </tr>
                ))}

              {/* Subtotal Row */}
              {variant == "voucher-sales" && (
                <tr className="font-bold italic bg-gray-50">
                  <td colSpan={2} className="text-right text-sm pr-3">
                    Subtotal
                  </td>
                  <td className="text-sm">{group.subQuantity}</td>
                  <td className="text-sm">{formatIDR(group.subPrice)}</td>
                  <td className="text-sm">{formatIDR(group.subTotal)}</td>
                </tr>
              )}
              {variant == "walkin-voucher-usage" && (
                <tr className="font-bold italic bg-gray-50">
                  <td colSpan={5} className="text-right text-sm pr-3">
                    Subtotal
                  </td>
                  <td className="text-sm">{formatIDR(group.subPrice)}</td>
                </tr>
              )}
              {variant == "sales-by-date" && (
                <tr className="font-bold italic bg-gray-50">
                  <td className="text-right text-sm pr-3">Subtotal</td>
                  <td className="text-sm">{group.subVoucherQuantity}</td>
                  <td className="text-sm">
                    {formatIDR(group.subVoucherPrice)}
                  </td>
                  <td className="text-sm">{group.subWalkinQuantity}</td>
                  <td className="text-sm">{formatIDR(group.subWalkinPrice)}</td>
                  <td className="text-sm">{group.subVoucherUsage}</td>
                  <td className="text-sm">{group.subTotalQuantity}</td>
                  <td className="text-sm">{formatIDR(group.subTotalPrice)}</td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          {variant == "voucher-sales" && (
            <tr className="bg-stone-600 text-white font-bold">
              <td colSpan={2} className="text-right pr-3">
                GRAND TOTAL
              </td>
              <td className="text-sm">{grandTotal.quantity}</td>
              <td className="text-sm">{formatIDR(grandTotal.price)}</td>
              <td className="text-sm">{formatIDR(grandTotal.total)}</td>
            </tr>
          )}
          {variant == "walkin-voucher-usage" && (
            <tr className="bg-stone-600 text-white font-bold">
              <td colSpan={5} className="text-right pr-3">
                GRAND TOTAL
              </td>
              <td className="text-sm">{formatIDR(grandTotal.price)}</td>
            </tr>
          )}
          {variant == "sales-by-date" && (
            <tr className="bg-stone-600 text-white font-bold">
              <td className="text-right pr-3">GRAND TOTAL</td>
              <td className="text-sm">{grandTotal.voucher_quantity}</td>
              <td className="text-sm">{formatIDR(grandTotal.voucher_price)}</td>
              <td className="text-sm">{grandTotal.walkin_quantity}</td>
              <td className="text-sm">{formatIDR(grandTotal.walkin_price)}</td>
              <td className="text-sm">{grandTotal.voucher_usage}</td>
              <td className="text-sm">{grandTotal.total_quantity}</td>
              <td className="text-sm">{formatIDR(grandTotal.total_price)}</td>
            </tr>
          )}
          {variant == "sales-by-treatment" && (
            <tr className="bg-stone-600 text-white font-bold">
              <td className="text-right pr-3">GRAND TOTAL</td>
              <td className="text-sm">{grandTotal.voucher_quantity}</td>
              <td className="text-sm">{formatIDR(grandTotal.voucher_price)}</td>
              <td className="text-sm">{grandTotal.walkin_quantity}</td>
              <td className="text-sm">{formatIDR(grandTotal.walkin_price)}</td>
              <td className="text-sm">{grandTotal.voucher_usage}</td>
              <td className="text-sm">{grandTotal.total_quantity}</td>
              <td className="text-sm">{formatIDR(grandTotal.total_price)}</td>
            </tr>
          )}
        </tfoot>
      </table>
    </div>
  );
};
