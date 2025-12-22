import { RoomForm } from "@/components/master/room-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedRoomPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/room/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <RoomForm roomId={isEdit ? id : undefined} />
    );
}