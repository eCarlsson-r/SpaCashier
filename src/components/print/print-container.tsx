import React from "react";
import { PayrollReportTemplate } from "./report-template";
import { BulkSlipTemplate } from "./slip-template";

interface PrintContainerProps {
    data: any;
    period: any;
    type: 'report' | 'slip';
}

export const PrintContainer = React.forwardRef(({ data, period, type }: PrintContainerProps, ref: React.Ref<HTMLDivElement>) => {
    return (
        <div className="hidden">
            <div ref={ref} className="print:block p-10 bg-white">
                {type === 'report' ? (
                    <PayrollReportTemplate data={data} period={period} />
                ) : (
                    <BulkSlipTemplate selectedRecords={data} period={period} />
                )}
            </div>
        </div>
    );
});