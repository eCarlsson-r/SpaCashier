import { BannerForm } from "@/components/master/banner-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedBannerPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/banner/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <BannerForm bannerId={isEdit ? id : undefined} />
    );
}