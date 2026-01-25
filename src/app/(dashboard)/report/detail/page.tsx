"use client";

import { DataTable } from "@/components/shared/DataTable";
import { useMemo, useRef, useState } from "react";
import { DatePicker } from "@/components/shared/DatePicker";
import { AppSelect } from "@/components/shared/AppSelect";
import api from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";
import { DetailedReportTemplate } from "@/components/print/detail-report-template";
import { ColumnDef } from "@tanstack/react-table";

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

export default function DetailedReport() {
  // Use 'any' here initially because the data shape changes,
  // but we will cast it when passing to specific DataTables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any[]>([]);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedVariant, setSelectedVariant] =
    useState<string>("voucher-sales");
  const [reportTitle, setReportTitle] = useState<string>("");

  // --- Column Definitions ---

  const voucherSalesColumns = useMemo<ColumnDef<VoucherSalesRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          row.original.date ? new Date(row.original.date).toDateString() : "",
      },
      { accessorKey: "journal_reference", header: "Reference" },
      { accessorKey: "description", header: "Description" },
      { accessorKey: "quantity", header: "Quantity" },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.price)},-`,
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.total)},-`,
      },
    ],
    [],
  );

  const walkinVoucherUsageColumns = useMemo<ColumnDef<WalkinVoucherUsageRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          row.original.date ? new Date(row.original.date).toDateString() : "",
      },
      { accessorKey: "time", header: "Time" },
      { accessorKey: "reference", header: "Reference" },
      { accessorKey: "therapist_name", header: "Therapist" },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.price)},-`,
      },
    ],
    [],
  );

  const salesByDateColumns = useMemo<ColumnDef<SalesByDateRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          row.original.date ? new Date(row.original.date).toDateString() : "",
      },
      { accessorKey: "treatment", header: "Treatment" },
      { accessorKey: "voucher_quantity", header: "Voucher Sales Qty." },
      {
        accessorKey: "voucher_price",
        header: "Voucher Sales Amount",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.voucher_price)},-`,
      },
      { accessorKey: "walkin_quantity", header: "WalkIn Sales Qty." },
      {
        accessorKey: "walkin_price",
        header: "WalkIn Sales Amount",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.walkin_price)},-`,
      },
      { accessorKey: "voucher_usage", header: "Voucher Usage" },
      { accessorKey: "total_quantity", header: "Total Qty" },
      {
        accessorKey: "total_price",
        header: "Total Amount",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.total_price)},-`,
      },
    ],
    [],
  );

  const salesByTreatmentColumns = useMemo<ColumnDef<SalesByTreatmentRow>[]>(
    () => [
      { accessorKey: "treatment", header: "Treatment" },
      { accessorKey: "voucher_quantity", header: "Qty. Penjualan Voucher" },
      {
        accessorKey: "voucher_price",
        header: "Nominal Penjualan Voucher",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.voucher_price)},-`,
      },
      { accessorKey: "walkin_quantity", header: "Qty. Penjualan WalkIn" },
      {
        accessorKey: "walkin_price",
        header: "Nominal Penjualan WalkIn",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.walkin_price)},-`,
      },
      { accessorKey: "voucher_usage", header: "Voucher Usage" },
      { accessorKey: "total_quantity", header: "Total Qty" },
      {
        accessorKey: "total_price",
        header: "Total Nominal",
        cell: ({ row }) =>
          `Rp. ${new Intl.NumberFormat("id-ID").format(row.original.total_price)},-`,
      },
    ],
    [],
  );

  const [printData, setPrintData] = useState<
    | VoucherSalesRow[]
    | WalkinVoucherUsageRow[]
    | SalesByDateRow[]
    | SalesByTreatmentRow[]
  >([]);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Voucher Usage Report",
  });

  const generateReport = () => {
    if (selectedStartDate && selectedEndDate) {
      api
        .get(
          selectedVariant == "walkin-voucher-usage" ? `/session` : `/voucher`,
          {
            params: {
              variant: selectedVariant,
              start: selectedStartDate,
              end: selectedEndDate,
            },
          },
        )
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
    setSelectedVariant("voucher-sales");
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

  const filterUI = (
    <div className={`grid grid-cols-5 gap-3`}>
      <div className="col-span-2 mt-2">
        <Label>Variant</Label>
        <AppSelect
          options={[
            { value: "voucher-sales", label: "Voucher Sales Report" },
            {
              value: "walkin-voucher-usage",
              label: "Walk-in Sales & Voucher Usage Report",
            },
            { value: "sales-by-date", label: "Sales Summary by Date" },
            {
              value: "sales-by-treatment",
              label: "Sales Summary by Treatment",
            },
          ]}
          value={selectedVariant}
          onValueChange={(val) => {
            setSelectedVariant(val);
            setReportData([]);
            switch (val) {
              case "voucher-sales":
                setReportTitle("Voucher Sales Report");
                break;
              case "walkin-voucher-usage":
                setReportTitle("Walk-in Sales & Voucher Usage Report");
                break;
              case "sales-by-date":
                setReportTitle("Sales Summary by Date");
                break;
              case "sales-by-treatment":
                setReportTitle("Sales Summary by Treatment");
                break;
            }
          }}
        />
      </div>
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
  );

  return (
    <div>
      {selectedVariant === "voucher-sales" && (
        <DataTable<VoucherSalesRow, unknown>
          title="Voucher Usage Report"
          columns={voucherSalesColumns}
          data={reportData as VoucherSalesRow[]}
          customFilter={filterUI}
          tableAction={() => printReport()}
          tableActionText="Print Report"
        />
      )}

      {selectedVariant === "walkin-voucher-usage" && (
        <DataTable<WalkinVoucherUsageRow, unknown>
          title="Voucher Usage Report"
          columns={walkinVoucherUsageColumns}
          data={reportData as WalkinVoucherUsageRow[]}
          customFilter={filterUI}
          tableAction={() => printReport()}
          tableActionText="Print Report"
        />
      )}

      {selectedVariant === "sales-by-date" && (
        <DataTable<SalesByDateRow, unknown>
          title="Voucher Usage Report"
          columns={salesByDateColumns}
          data={reportData as SalesByDateRow[]}
          customFilter={filterUI}
          tableAction={() => printReport()}
          tableActionText="Print Report"
        />
      )}

      {selectedVariant === "sales-by-treatment" && (
        <DataTable<SalesByTreatmentRow, unknown>
          title="Voucher Usage Report"
          columns={salesByTreatmentColumns}
          data={reportData as SalesByTreatmentRow[]}
          customFilter={filterUI}
          tableAction={() => printReport()}
          tableActionText="Print Report"
        />
      )}

      <div className="hidden">
        <div ref={printRef} className="print:block p-3 bg-white">
          <DetailedReportTemplate
            variant={selectedVariant}
            reportTitle={reportTitle}
            startDate={selectedStartDate?.toDateString() || ""}
            endDate={selectedEndDate?.toDateString() || ""}
            data={printData}
          />
        </div>
      </div>
    </div>
  );
}
