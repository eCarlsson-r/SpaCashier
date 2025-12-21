import { AccountForm } from "@/components/master/account-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedAccountPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isEdit ? "Update Account Details" : "Register New Account"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Modify existing account configuration" : "Setup a new account for your Spa"}
                </p>
            </header>

            <AccountForm accountId={isEdit ? id : undefined} />
        </div>
    );
}