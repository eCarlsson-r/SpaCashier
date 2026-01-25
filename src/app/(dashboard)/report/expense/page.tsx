"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { CashflowReportTemplate } from "@/components/print/cashflow-report-template";
import { AppSelect } from "@/components/shared/AppSelect";
import { useModel } from "@/hooks/useModel";

export default function ExpenseReport() {
  const [reportData, setReportData] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedAccount, setSelectedAccount] = useState("");

  type ExpenseReport = {
    date: string;
    journal_reference: string;
    partner: string;
    description: string;
    amount: number;
  };

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }: { row: { original: ExpenseReport } }) =>
        row.original.date ? new Date(row.original.date).toDateString() : "",
    },
    { accessorKey: "journal_reference", header: "Reference" },
    { accessorKey: "partner", header: "Partner" },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }: { row: { original: ExpenseReport } }) =>
        `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.amount)},-`,
    },
  ];
  const accounts = useModel("account", {
    mode: "select",
  }).options;

  const [printData, setPrintData] = useState([]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Expense Report",
  });

  const generateReport = () => {
    if (selectedStartDate && selectedEndDate) {
      api
        .get(`/expense`, {
          params: {
            start: selectedStartDate.toDateString(),
            end: selectedEndDate.toDateString(),
            account: selectedAccount,
          },
        })
        .then((response) => {
          setReportData(response.data);
        })
        .catch((error) => {
          console.error("Error fetching attendance report:", error);
        });
    }
  };

  const clear = () => {
    setSelectedStartDate(new Date());
    setSelectedEndDate(new Date());
    setReportData([]);
    setPrintData([]);
  };

  const printReport = () => {
    setPrintData(reportData);
    // Triggering after a small delay ensures the 'report' template is loaded into the ref
    setTimeout(() => {
      if (printRef.current) {
        handlePrint();
      }
    }, 250);
  };

  return (
    <div>
      <DataTable
        title="Expense Report"
        columns={columns}
        data={reportData}
        customFilter={
          <div className={`grid grid-cols-4 gap-3`}>
            <div className="mt-2">
              <Label>Start Date</Label>
              <DatePicker
                value={new Date(selectedStartDate || "")}
                onChange={(date) => setSelectedStartDate(new Date(date || ""))}
              />
            </div>
            <div className="mt-2">
              <Label>End Date</Label>
              <DatePicker
                value={new Date(selectedEndDate || "")}
                onChange={(date) => setSelectedEndDate(new Date(date || ""))}
              />
            </div>
            <div className="mt-2">
              <Label>Account</Label>
              <AppSelect
                value={selectedAccount}
                onValueChange={(value) => setSelectedAccount(value)}
                options={accounts}
              />
            </div>
            <div className="grid grid-cols-2 mt-2 gap-2">
              <Button
                className="bg-sky-600 hover:bg-sky-700"
                onClick={() => generateReport()}
              >
                Find
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => clear()}
              >
                Clear Report
              </Button>
            </div>
          </div>
        }
        tableAction={() => printReport()}
        tableActionText="Print Report"
      />

      <div className="hidden">
        <div ref={printRef} className="print:block p-3 bg-white">
          <CashflowReportTemplate
            reportTitle="Expense Report"
            startDate={selectedStartDate?.toDateString() || ""}
            endDate={selectedEndDate?.toDateString() || ""}
            account={selectedAccount}
            data={printData}
          />
        </div>
      </div>
    </div>
  );
}
