import { EmployeeForm } from "@/components/master/employee-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedEmployeePage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <div className="h-16 mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isEdit ? "Update Employee Details" : "Register New Employee"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Modify existing employee configuration" : "Setup a new employee for your Spa"}
                </p>
            </header>

            <EmployeeForm employeeId={isEdit ? id : undefined} />
        </div>
    );
}