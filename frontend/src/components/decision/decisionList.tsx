import { useGetAllDecisions } from "./useGetDecisions";
import DecisionListItem from "./decisionListItem";
import EmptyState from "../util/EmptyState";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { UseGetAllDecisionsReturn } from "../../types/decision";

const DecisionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;



export default function DecisionList() {
    const navigate = useNavigate();
    const { data, isLoading, error }: UseGetAllDecisionsReturn = useGetAllDecisions();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Show empty state if no decisions
    if (!data?.data || data.data.length === 0) {
        return (
            <EmptyState
                text="No decisions found"
                createLinkText="Create Decision"
                onCreateClick={() => {
                    navigate("/decisions/new");
                }}
            />
        );
    }

    return (
        <DecisionGrid>
            {data?.data?.map((decision) => (
                <div key={decision._id}>
                    <DecisionListItem decisionObject={decision} />
                </div>
            ))}
        </DecisionGrid>
    )
}