import { BranchForm } from "@/components/master/branch-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedBranchPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <div className="h-16 mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isEdit ? "Update Branch Details" : "Register New Branch"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Modify existing branch configuration" : "Setup a new location for your Spa"}
                </p>
            </header>

            <BranchForm branchId={isEdit ? id : undefined} />
        </div>
    );
}