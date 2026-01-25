"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { IncomeSchema } from "@/lib/schemas";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

const columns: ColumnDef<z.infer<typeof IncomeSchema>>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) =>
      row.original.date ? new Date(row.original.date).toDateString() : "",
  },
  { accessorKey: "journal_reference", header: "Reference" },
  { accessorKey: "partner", header: "Cash Partner" },
  { accessorKey: "description", header: "Description" },
];

export default function IncomePage() {
  const router = useRouter();
  const { data, remove } = useModel("income");
  return (
    <DataTable
      title="Income"
      columns={columns}
      data={data}
      searchKey="description"
      tableAction={() => router.push("/cashflow/income/new")}
      actions={(item) => (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => remove(item.id?.toString() || "")}
          >
            Delete
          </Button>
        </div>
      )}
      onRowClick={(item) => router.push(`/cashflow/income/${item.id}`)}
    />
  );
}
