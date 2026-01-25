"use client";
import { DataTable } from "@/components/shared/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { useModel } from "@/hooks/useModel";
import { useState } from "react";
import { EntityModal } from "@/components/shared/EntityModal";
import { BankSchema, WalletSchema } from "@/lib/schemas";
import z from "zod";

export default function CashflowPage() {
  const { data: bankData, refetch: refetchBanks } = useModel("bank", {
    mode: "table",
  });
  const { data: walletData, refetch: refetchWallets } = useModel("wallet", {
    mode: "table",
  });

  const [activeModal, setActiveModal] = useState<"bank" | "wallet" | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<
    z.infer<typeof BankSchema> | z.infer<typeof WalletSchema> | null
  >(null);

  const handleEdit = (
    type: "bank" | "wallet",
    item: z.infer<typeof BankSchema> | z.infer<typeof WalletSchema>,
  ) => {
    setSelectedItem(item);
    setActiveModal(type);
  };

  const handleAddNew = (type: "bank" | "wallet") => {
    setSelectedItem(null); // Ensure form is empty
    setActiveModal(type);
  };

  const bankColumns = [
    { accessorKey: "id", header: "Code" },
    { accessorKey: "name", header: "Name" },
  ];

  const walletColumns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "bank_id", header: "Bank" },
    { accessorKey: "bank_account_number", header: "Bank Account Number" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* Bank Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            title="Banks"
            columns={bankColumns}
            data={bankData}
            searchKey="name"
            // Trigger the modal here
            tableAction={() => handleAddNew("bank")}
            onRowClick={(row) => handleEdit("bank", row)}
          />
        </CardContent>
      </Card>

      {/* Wallet Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            title="Wallets"
            columns={walletColumns}
            data={walletData}
            searchKey="name"
            // Trigger the modal here
            tableAction={() => handleAddNew("wallet")}
            onRowClick={(row) => handleEdit("wallet", row)}
          />
        </CardContent>
      </Card>

      {/* Render the Modal */}
      <EntityModal
        type={activeModal || "bank"} // fallback to bank
        isOpen={activeModal !== null}
        initialData={selectedItem}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          if (activeModal === "bank") refetchBanks();
          else refetchWallets();
        }}
      />
    </div>
  );
}
