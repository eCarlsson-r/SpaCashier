import { Fragment, useMemo } from "react";

export const groupVoucherByType = (
  data: {
    category: string;
    name: string;
    type: string;
    current: number;
    previous: number;
  }[],
) => {
  return data.reduce(
    (
      acc: {
        [key: string]: {
          type: string;
          items: {
            category: string;
            name: string;
            type: string;
            current: number;
            previous: number;
          }[];
          current: number;
          previous: number;
        };
      },
      account,
    ) => {
      const key = account.type;
      if (!acc[key]) {
        acc[key] = {
          type: key,
          items: [],
          current: 0,
          previous: 0,
        };
      }

      acc[key].items.push(account);
      acc[key].current += account.current;
      acc[key].previous += account.previous;
      return acc;
    },
    {},
  );
};

export const ProfitLossTemplate = ({
  startDate,
  endDate,
  data,
}: {
  startDate: string;
  endDate: string;
  data: {
    category: string;
    name: string;
    type: string;
    current: number;
    previous: number;
  }[];
}) => {
  // Use useMemo so we don't re-calculate totals on every render
  const accountRecords = useMemo(() => groupVoucherByType(data), [data]);

  // Calculate Grand Totals
  const grandTotal = Object.values(accountRecords).reduce(
    (acc, curr) => ({
      current:
        curr.type == "income"
          ? acc.current + curr.current
          : acc.current - curr.current,
      previous:
        curr.type == "income"
          ? acc.previous + curr.previous
          : acc.previous - curr.previous,
    }),
    { current: 0, previous: 0 },
  );

  const formatIDR = (val: number) =>
    `Rp. ${new Intl.NumberFormat("id-ID").format(val)},-`;

  return (
    <div className="p-3 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profit & Loss</h1>
        </div>
        <div className="text-right">
          <p className="font-bold uppercase text-xs text-slate-400">Period</p>
          {startDate === endDate ? (
            <p className="text-lg font-bold">{startDate}</p>
          ) : (
            <p className="text-lg font-bold">
              {startDate} until {endDate}
            </p>
          )}
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-y border-slate-200">
            <th className="py-2 px-2 text-sm font-semibold">Category</th>
            <th className="py-2 px-2 text-sm font-semibold">Name</th>
            <th className="py-2 px-2 text-sm font-semibold">This Month</th>
            <th className="py-2 px-2 text-sm font-semibold">
              Until This Month
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(accountRecords).map(([treatmentName, group]) => (
            <Fragment key={treatmentName}>
              {/* Payment Group Header */}
              <tr className="bg-brown-50 font-bold">
                <td colSpan={3} className="p-1">
                  {treatmentName}
                </td>
              </tr>

              {/* Individual Records */}
              {group.items.map((item, idx) => (
                <tr key={idx} className="border-b">
                  <td className="text-sm">{item.category}</td>
                  <td className="text-sm">{item.name}</td>
                  <td className="text-sm">{formatIDR(item.current)}</td>
                  <td className="text-sm">{formatIDR(item.previous)}</td>
                </tr>
              ))}

              {/* Subtotal Row */}
              <tr className="font-bold italic bg-gray-50">
                <td colSpan={2} className="text-right text-sm pr-3">
                  Subtotal
                </td>
                <td className="text-sm">{formatIDR(group.current)}</td>
                <td className="text-sm">{formatIDR(group.previous)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-stone-600 text-white font-bold">
            <td colSpan={2} className="text-right pr-3">
              GRAND TOTAL
            </td>
            <td>{formatIDR(grandTotal.current)}</td>
            <td>{formatIDR(grandTotal.previous)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
