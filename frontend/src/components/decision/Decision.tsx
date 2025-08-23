import { useEffect } from "react";
import { useGetDecision } from "./useGetDecisions";
import toast from "react-hot-toast";
import type { Decision, UseGetDecisionReturn } from "../../types/decision";

export default function Decision() {
    const { data, isLoading, error, isSuccess }: UseGetDecisionReturn = useGetDecision();

    // Show toast only once when data loads
    useEffect(() => {
        if (isSuccess && data?.data) {
            toast.success("Loaded decision successfully");
        }
    }, [isSuccess, data]);

    // Loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // Error state
    if (error) {
        return <div>Error: {error.message}</div>;
    }

    // Success state
    if (isSuccess && data?.data) {
        const decision: Decision = data.data;

        return (
            <div className="decision-container">
                <h1>{decision.title}</h1>
                <div className="decision-details">
                    <p>Slug: {decision.slug}</p>
                    <p>Created: {new Date(decision.createdAt).toLocaleDateString()}</p>
                    <p>Status: {decision.isArchived ? 'Archived' : 'Active'}</p>
                </div>
            </div>
        );
    }

    // Fallback state (shouldn't reach here, but TypeScript requires it)
    return null;
}