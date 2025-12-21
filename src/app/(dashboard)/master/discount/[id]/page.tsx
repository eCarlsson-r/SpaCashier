import { DiscountForm } from "@/components/master/discount-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedDiscountPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <div className="h-16 mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isEdit ? "Update Discount Details" : "Register New Discount"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Modify existing discount configuration" : "Setup a new discount for your Spa"}
                </p>
            </header>

            <DiscountForm discountId={isEdit ? id : undefined} />
        </div>
    );
}