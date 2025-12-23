import { ExpenseForm } from "@/components/cashflow/expense-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedExpensePage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /cashflow/expense/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <ExpenseForm expenseId={isEdit ? id : undefined} />
    );
}