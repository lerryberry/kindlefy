import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import styled from "styled-components";
import { useGetDecision } from "./useGetDecisions";
// import toast from "react-hot-toast";
import type { Decision, UseGetDecisionReturn } from "../../types/decision";

const DecisionContainer = styled.div`
  width: 100%;
  padding: 0.5rem;
  text-align: left;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReportButton = styled.button`
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  &:hover {
    background-color: #4338ca;
  }
`;

export default function Decision() {
    const { decisionId } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, error, isSuccess }: UseGetDecisionReturn = useGetDecision();

    // Show toast only once when data loads
    useEffect(() => {
        if (isSuccess && data?.data) {
            // toast.success("Loaded decision successfully");
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
                <TitleRow>
                    <h1>{decision.title}</h1>
                    <ReportButton
                        onClick={() => navigate(`/decisions/${decisionId}/report`)}
                    >
                        View Report
                    </ReportButton>
                </TitleRow>
            </DecisionContainer>
        );
    }

    // Fallback state (shouldn't reach here, but TypeScript requires it)
    return null;
}