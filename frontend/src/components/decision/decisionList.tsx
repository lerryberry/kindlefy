import { useGetDecisions } from "./useGetDecisions";
import DecisionListItem from "./decisionListItem";
import Button from "../util/Button";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Loading from "../util/Loading";
import PageLayout from "../layouts/PageLayout";

const DecisionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LoadMoreContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
`;



export default function DecisionList() {
    const navigate = useNavigate();
    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useGetDecisions();

    if (isLoading) return <Loading />;
    if (error) return <div>Error: {error.message}</div>;

    // Flatten all pages of decisions
    const allDecisions = data?.pages?.flatMap((page: any) => page.data) || [];

    // Show empty state if no decisions
    if (allDecisions.length === 0) {
        return (
            <PageLayout title="Decisions">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)' }}>
                        Create your first decision to get started.
                    </p>
                    <Button
                        text="Create Decision"
                        onClick={() => navigate("/decisions/new")}
                        size="medium"
                    />
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Decisions"
            showAddButton={true}
            addButtonText="New Decision"
            onAddClick={() => navigate("/decisions/new")}
        >
            <DecisionGrid>
                {allDecisions.map((decision: any) => (
                    <div key={decision._id}>
                        <DecisionListItem decisionObject={decision} />
                    </div>
                ))}
            </DecisionGrid>

            {hasNextPage && (
                <LoadMoreContainer>
                    <Button
                        text={isFetchingNextPage ? "Loading..." : "Load More"}
                        onClick={() => fetchNextPage()}
                        size="medium"
                        variant="ghost"
                        disabled={isFetchingNextPage}
                    />
                </LoadMoreContainer>
            )}
        </PageLayout>
    )
}