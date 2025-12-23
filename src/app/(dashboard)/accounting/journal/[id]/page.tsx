import { JournalForm } from "@/components/accounting/journal-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedJournalPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/journal/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <JournalForm journalId={isEdit ? id : undefined} />
    );
}