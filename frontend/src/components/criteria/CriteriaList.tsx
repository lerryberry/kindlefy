import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetCriteriaList } from "./useGetCriteria";
import CriteriaListItem from "./CriteriaListItem";
import EmptyState from "../util/EmptyState";
import toast from "react-hot-toast";
import type { UseGetCriteriaListReturn } from "../../types/criteria";

interface CriteriaListProps {
    decisionId: string;
}

export default function CriteriaList({ decisionId }: CriteriaListProps) {
    const navigate = useNavigate();
    const { data, isLoading, error, isSuccess }: UseGetCriteriaListReturn = useGetCriteriaList(decisionId);

    // Show toast only once when data loads
    useEffect(() => {
        if (isSuccess && data?.output) {
            toast.success("Loaded criteria successfully");
            console.log("Criteria data:", data.output);
        }
        if (isSuccess && !data?.output) {
            console.log("No criteria data found");
        }
        if (error) {
            console.log("Criteria error:", error);
        }
    }, [isSuccess, data, error]);

    if (isLoading) return <div>Loading criteria...</div>;
    if (error) return <div>Error: {error.message}</div>;

    if (!data?.output || data.output.length === 0) {
        return (
            <EmptyState
                text="No criteria found for this decision"
                createLinkText="Add Criteria"
                onCreateClick={() => {
                    navigate(`/decisions/${decisionId}/criteria/new`);
                }}
            />
        );
    }

    return (
        <div>
            {data?.output?.map((criteria) => (
                <div key={criteria._id}>
                    <CriteriaListItem criteriaObject={criteria} />
                </div>
            ))}
        </div>
    );
}
