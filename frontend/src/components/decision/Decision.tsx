import { useEffect } from "react";
import styled from "styled-components";
import { useGetDecision } from "./useGetDecisions";
import toast from "react-hot-toast";
import type { Decision, UseGetDecisionReturn } from "../../types/decision";

const DecisionContainer = styled.div`
  width: 100%;
  padding: 1rem;
  text-align: left;
`;

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
            <DecisionContainer>
                <h1>{decision.title}</h1>
            </DecisionContainer>
        );
    }

    // Fallback state (shouldn't reach here, but TypeScript requires it)
    return null;
}