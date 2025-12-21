import { CustomerForm } from "@/components/master/customer-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedCustomerPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isEdit ? "Update Customer Details" : "Register New Customer"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Modify existing customer configuration" : "Setup a new customer for your Spa"}
                </p>
            </header>

            <CustomerForm customerId={isEdit ? id : undefined} />
        </div>
    );
}