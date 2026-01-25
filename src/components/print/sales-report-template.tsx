import { SalesRecordSchema } from "@/lib/schemas";
import { Fragment, useMemo } from "react";
import z from "zod";

type SalesItem = {
  date: string;
  income: {
    journal_reference: string;
    payments: { description: string }[];
  };
  customer: { name: string };
  subtotal: number;
  discount: number;
  total: number;
  description: string;
  records: z.infer<typeof SalesRecordSchema>[];
};
export const groupSalesByPayment = (data: SalesItem[]) => {
  return data.reduce(
    (
      acc: {
        [key: string]: {
          items: SalesItem[];
          subAmount: number;
          subDiscount: number;
          subTotal: number;
        };
      },
      sales,
    ) => {
      const key =
        sales.income.payments.length > 0
          ? sales.income.payments[0].description.split(" dengan ")[0]
          : "Uang Tunai";
      if (!acc[key]) {
        acc[key] = {
          items: [],
          subAmount: 0,
          subDiscount: 0,
          subTotal: 0,
        };
      }

      const subtotal = sales.subtotal;
      const discount = sales.discount;
      const total = subtotal - discount;

      acc[key].items.push(sales);
      acc[key].subAmount += subtotal;
      acc[key].subDiscount += discount;
      acc[key].subTotal += total;

      return acc;
    },
    {},
  );
};

export const SalesReportTemplate = ({
  startDate,
  endDate,
  branch,
  data,
}: {
  startDate: string;
  endDate: string;
  branch: string;
  data: SalesItem[];
}) => {
  // Use useMemo so we don't re-calculate totals on every render
  const salesRecords = useMemo(() => groupSalesByPayment(data), [data]);

  // Calculate Grand Totals
  const grandTotal = Object.values(salesRecords).reduce(
    (acc, curr) => ({
      subtotal: acc.subtotal + curr.subAmount,
      discount: acc.discount + curr.subDiscount,
      total: acc.total + curr.subTotal,
    }),
    { subtotal: 0, discount: 0, total: 0 },
  );

  const formatIDR = (val: number) =>
    `Rp. ${new Intl.NumberFormat("id-ID").format(val)},-`;

  return (
    <div className="p-3 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8 border-b-2 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SALES REPORT</h1>
          <p className="text-slate-500 uppercase font-semibold">
            Cabang: {branch}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold uppercase text-xs text-slate-400">Tanggal</p>
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
          <tr className="bg-slate-50 border-y border-slate-200">
            <th className="py-3 px-2 text-sm font-semibold">Tgl</th>
            <th className="py-3 px-2 text-sm font-semibold">Keterangan</th>
            <th className="py-3 px-2 text-sm font-semibold">Nominal</th>
            <th className="py-3 px-2 text-sm font-semibold">Potongan</th>
            <th className="py-3 px-2 text-sm font-semibold">Grand Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(salesRecords).map(([paymentAcc, group]) => (
            <Fragment key={paymentAcc}>
              {/* Payment Group Header */}
              <tr className="bg-brown-50 font-bold">
                <td colSpan={6} className="p-2">
                  Pembayaran ke: {paymentAcc}
                </td>
              </tr>

              {/* Individual Records */}
              {group.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="text-sm">{item.date}</td>
                  <td className="text-sm">{item.records[0].description}</td>
                  <td className="text-sm">{formatIDR(item.subtotal)}</td>
                  <td className="text-sm">{formatIDR(item.discount)}</td>
                  <td className="text-sm">
                    {formatIDR(item.subtotal - item.discount)}
                  </td>
                </tr>
              ))}

              {/* Subtotal Row */}
              <tr className="font-bold italic bg-gray-50">
                <td colSpan={2} className="text-right text-sm pr-3">
                  Subtotal
                </td>
                <td className="text-sm">{formatIDR(group.subAmount)}</td>
                <td className="text-sm">{formatIDR(group.subDiscount)}</td>
                <td className="text-sm">{formatIDR(group.subTotal)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-stone-600 text-white font-bold">
            <td colSpan={2} className="text-right pr-3">
              GRAND TOTAL
            </td>
            <td>{formatIDR(grandTotal.subtotal)}</td>
            <td>{formatIDR(grandTotal.discount)}</td>
            <td>{formatIDR(grandTotal.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
