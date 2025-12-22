import { CustomerForm } from "@/components/master/customer-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedCustomerPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <CustomerForm customerId={isEdit ? id : undefined} />
    );
}