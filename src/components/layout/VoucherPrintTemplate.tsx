// src/components/operational/VoucherPrintTemplate.tsx
import React, { forwardRef } from "react";
import { format } from "date-fns";
import Barcode from "react-barcode";

interface VoucherData {
    code: string;
    treatment_name: string;
    customer_name?: string;
    branch_name?: string;
    expiry_date?: string;
}

export const VoucherPrintTemplate = forwardRef<HTMLDivElement, { data: VoucherData }>(
    ({ data }, ref) => {
        return (
            <div ref={ref} className="p-8 bg-white text-slate-900 w-[400px] border-2 border-slate-200">
                {/* Header */}
                <div className="text-center border-b pb-4 mb-4">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-teal-700">SpaPro Wellness</h1>
                    <p className="text-xs text-slate-500 italic">Exclusive Treatment Voucher</p>
                </div>

                {/* Treatment Info */}
                <div className="space-y-3">
                    <div>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold">Service</p>
                        <p className="text-lg font-bold">{data.treatment_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-semibold">Valid At</p>
                            <p className="text-sm">{data.branch_name || "Any Branch"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-semibold">Expires</p>
                            <p className="text-sm">{data.expiry_date ? format(new Date(data.expiry_date), 'dd MMM yyyy') : 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Barcode Section */}
                <div className="mt-8 pt-4 border-t border-dashed flex flex-col items-center">
                    <Barcode value={data.code} width={1.5} height={50} fontSize={14} />
                    <p className="text-[10px] mt-2 text-slate-400">Scan at the front desk to redeem</p>
                </div>

                {/* Fine Print */}
                <p className="mt-6 text-[8px] text-slate-400 leading-tight text-center">
                    Non-refundable. Valid for one (1) treatment session only.
                    Present this voucher upon arrival.
                </p>
            </div>
        );
    }
);

VoucherPrintTemplate.displayName = "VoucherPrintTemplate";