import { useEffect } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import styled from "styled-components";
import { useGetDecision } from "./useGetDecision";
// import toast from "react-hot-toast";
import type { Decision, UseGetDecisionReturn } from "../../types/decision";
import Button from "../util/Button";

const DecisionContainer = styled.div`
  width: 100%;
  padding: 0.5rem;
  text-align: left;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px; // Spacing between title and edit button
  cursor: pointer;

  h1 {
    margin: 0;
    font-size: 1.875rem; // Equivalent to text-3xl
    line-height: 2.25rem; // Equivalent to leading-9
  }

  .edit-icon {
    font-size: 1.5rem;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
  }

  &:hover .edit-icon {
    opacity: 1;
  }
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function Decision() {
  const { decisionId } = useParams();
  const navigate = useNavigate();

  const { decision, isLoading }: UseGetDecisionReturn = useGetDecision(decisionId);

  // Show toast only once when data loads
  useEffect(() => {
    if (decision?.data) {
      // toast.success("Loaded decision successfully");
    }
  }, [decision]);

  // Loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Error state - Assuming decision.data exists if not loading and no error
  if (!isLoading && !decision?.data) {
    return <div>Error: Decision not found or an error occurred.</div>;
  }

  // Success state
  if (decision?.data) {
    const currentDecision: Decision = decision.data;

    return (
      <DecisionContainer>
        <TitleRow>
          <TitleWrapper onClick={() => navigate(`/decisions/${decisionId}/edit`)}>
            <h1>{currentDecision.title}</h1>
            <span className="edit-icon">&#x270E;</span>
          </TitleWrapper>
          <Button
            onClick={() => navigate(`/decisions/${decisionId}/report`)}
            text="View Report"
          />
        </TitleRow>
      </DecisionContainer>
    );
  }

  // Fallback state (shouldn't reach here, but TypeScript requires it)
  return null;
}