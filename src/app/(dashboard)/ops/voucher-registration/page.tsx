"use client";

import React from "react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { VoucherPrintTemplate } from "@/components/layout/VoucherPrintTemplate";
import { Button } from "@/ui/button";
import { Printer } from "lucide-react";

export default function VoucherRegistration() {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  const [voucherData, setVoucherData] = React.useState(null);

  const handleRegistrationSuccess = (data) => {
    setVoucherData(data);
    // After state updates, you can trigger printing
  };

  return (
    <div className="space-y-8">
      {/* 1. Registration Form */}
      <VoucherRegistrationForm onSuccess={handleRegistrationSuccess} />

      {/* 2. Print Action (Hidden until data is available) */}
      {voucherData && (
        <div className="flex flex-col items-center gap-4 bg-sky-50 p-6 rounded-lg border-2 border-dashed">
          <p className="text-sm font-medium">Voucher Registered Successfully!</p>
          <Button onClick={() => reactToPrintFn()}>
            <Printer className="mr-2 h-4 w-4" /> Print Physical Voucher
          </Button>

          {/* Hidden Container for Printing */}
          <div className="hidden">
            <VoucherPrintTemplate ref={contentRef} data={voucherData} />
          </div>
        </div>
      )}
    </div>
  );
}