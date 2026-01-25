import { Fragment, useMemo } from "react";

export const groupVoucherByType = (
  data: {
    type: string;
    category: string;
    name: string;
    balance: number;
  }[],
) => {
  return data.reduce(
    (
      acc: {
        [key: string]: {
          items: {
            type: string;
            category: string;
            name: string;
            balance: number;
          }[];
          subAmount: number;
        };
      },
      account: {
        type: string;
        category: string;
        name: string;
        balance: number;
      },
    ) => {
      const key = account.type;
      if (!acc[key]) {
        acc[key] = {
          items: [],
          subAmount: 0,
        };
      }

      acc[key].items.push(account);
      acc[key].subAmount += account.balance;

      return acc;
    },
    {},
  );
};

export const BalanceSheetTemplate = ({
  endDate,
  data,
}: {
  endDate: string;
  data: {
    type: string;
    category: string;
    name: string;
    balance: number;
  }[];
}) => {
  // Use useMemo so we don't re-calculate totals on every render
  const accountRecords = useMemo(() => groupVoucherByType(data), [data]);

  // Calculate Grand Totals
  const grandTotal = Object.values(accountRecords).reduce(
    (acc, curr) => ({
      amount: acc.amount + curr.subAmount,
    }),
    { amount: 0 },
  );

  const formatIDR = (val: number) =>
    `Rp. ${new Intl.NumberFormat("id-ID").format(val)},-`;

  return (
    <div className="p-3 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-end pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Balance Sheet</h1>
        </div>
        <div className="text-right">
          <p className="font-bold uppercase text-xs text-slate-400">
            Report until
          </p>
          <p className="text-lg font-bold">{endDate}</p>
        </div>
      </div>

      {/* Main Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-y border-slate-200">
            <th className="py-2 px-2 text-sm font-semibold">Category</th>
            <th className="py-2 px-2 text-sm font-semibold">Name</th>
            <th className="py-2 px-2 text-sm font-semibold">Balance</th>
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
                  <td className="text-sm">{formatIDR(item.balance)}</td>
                </tr>
              ))}

              {/* Subtotal Row */}
              <tr className="font-bold italic bg-gray-50">
                <td colSpan={2} className="text-right text-sm pr-3">
                  Subtotal
                </td>
                <td className="text-sm">{formatIDR(group.subAmount)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-stone-600 text-white font-bold">
            <td colSpan={2} className="text-right pr-3">
              GRAND TOTAL
            </td>
            <td>{formatIDR(grandTotal.amount)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
