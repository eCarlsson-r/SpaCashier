import { DiscountForm } from "@/components/master/discount-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedDiscountPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <DiscountForm discountId={isEdit ? id : undefined} />
    );
}