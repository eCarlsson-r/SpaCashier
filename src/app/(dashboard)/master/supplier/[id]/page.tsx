import { SupplierForm } from "@/components/master/supplier-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedSupplierPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <SupplierForm supplierId={isEdit ? id : undefined} />
    );
}