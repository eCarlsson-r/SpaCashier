import { CategoryForm } from "@/components/master/category-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedCategoryPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/category/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <div className="h-16 mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">
                    {isEdit ? "Update Category Details" : "Register New Category"}
                </h1>
                <p className="text-muted-foreground">
                    {isEdit ? "Modify existing category configuration" : "Setup a new category for your Spa"}
                </p>
            </header>

            <CategoryForm categoryId={isEdit ? id : undefined} />
        </div>
    );
}