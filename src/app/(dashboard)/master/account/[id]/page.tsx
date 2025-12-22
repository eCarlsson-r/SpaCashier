import { AccountForm } from "@/components/master/account-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedAccountPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <AccountForm accountId={isEdit ? id : undefined} />
    );
}