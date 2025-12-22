import { BranchForm } from "@/components/master/branch-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedBranchPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <BranchForm branchId={isEdit ? id : undefined} />
    );
}