import { IncomeForm } from "@/components/cashflow/income-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedIncomePage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /cashflow/income/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <IncomeForm incomeId={isEdit ? id : undefined} />
    );
}