import { useNavigate, useParams } from "react-router-dom";
import { useGetCriteriaList } from "./useGetCriteria";
import CriteriaListItem from "./CriteriaListItem";
import EmptyState from "../util/EmptyState";
import PageLayout from "../layouts/PageLayout";
import styled from "styled-components";
import type { UseGetCriteriaListReturn } from "../../types/criteria";

const ListContainer = styled.div`
    /* Background will inherit from parent or use global styles */
`;



export default function CriteriaList() {
    const navigate = useNavigate();
    const { decisionId } = useParams();
    const { data, isLoading, error }: UseGetCriteriaListReturn = useGetCriteriaList(decisionId!);

    if (isLoading) return <div>Loading criteria...</div>;
    if (error) return <div>Error: {error.message}</div>;

    if (!data?.output || data.output.length === 0) {
        return (
            <PageLayout
                title="Criteria"
                addButtonText="Add Criteria"
                onAddClick={() => navigate(`/decisions/${decisionId}/criteria/new`)}
            >
                <EmptyState
                    text="Add your first criterion. This is what you will use to rank options against later."
                    createLinkText="Add Criteria"
                    onCreateClick={() => {
                        navigate(`/decisions/${decisionId}/criteria/new`);
                    }}
                />
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Criteria"
            addButtonText="Add Criteria"
            onAddClick={() => navigate(`/decisions/${decisionId}/criteria/new`)}
        >
            <ListContainer>
                {data?.output?.map((criteria) => (
                    <div key={criteria._id}>
                        <CriteriaListItem criteriaObject={criteria} />
                    </div>
                ))}
            </ListContainer>
        </PageLayout>
    );
}
