"use client";
import { DataTable } from "@/components/shared/DataTable";
import { useModel } from "@/hooks/useModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ExpenseSchema } from "@/lib/schemas";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

const columns: ColumnDef<z.infer<typeof ExpenseSchema>>[] = [
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

export default function ExpensePage() {
  const router = useRouter();
  const { data, remove } = useModel("expense");
  return (
    <DataTable
      title="Expenses"
      columns={columns}
      data={data}
      searchKey="description"
      tableAction={() => router.push("/cashflow/expense/new")}
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
      onRowClick={(item) => router.push(`/cashflow/expense/${item.id}`)}
    />
  );
}
