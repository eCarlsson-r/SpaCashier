import { TreatmentForm } from "@/components/master/treatment-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedTreatmentPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <div className="h-16 mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isEdit ? "Update Treatment Details" : "Register New Treatment"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Modify existing treatment configuration" : "Setup a new treatment for your Spa"}
                </p>
            </header>

            <TreatmentForm treatmentId={isEdit ? id : undefined} />
        </div>
    );
}