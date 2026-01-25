import { SessionForm } from "@/components/operational/session-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedSessionPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  // If the URL is /master/branches/new, isEdit will be false
  const isEdit = id !== "new";

  return <SessionForm sessionId={isEdit ? id : undefined} />;
}
