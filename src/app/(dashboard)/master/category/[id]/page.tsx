import { CategoryForm } from "@/components/master/category-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedCategoryPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/category/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <CategoryForm categoryId={isEdit ? id : undefined} />
    );
}