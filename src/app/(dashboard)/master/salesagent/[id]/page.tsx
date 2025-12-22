import { AgentForm } from "@/components/master/agent-form";

type Params = Promise<{ id: string }>;

export default async function UnifiedSalesAgentPage({ params }: { params: Params }) {
    const { id } = await params;
    // If the URL is /master/salesagent/new, isEdit will be false
    const isEdit = id !== "new";

    return (
        <AgentForm agentId={isEdit ? id : undefined} />
    );
}