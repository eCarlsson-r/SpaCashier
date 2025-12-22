import { EmployeeForm } from "@/components/master/employee-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedEmployeePage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/branches/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <EmployeeForm employeeId={isEdit ? id : undefined} />
    );
}