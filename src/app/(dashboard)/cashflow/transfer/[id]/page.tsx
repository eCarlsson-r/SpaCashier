import { TransferForm } from "@/components/cashflow/transfer-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedTransferPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /cashlow/transfer/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <TransferForm transferId={isEdit ? id : undefined} />
    );
}