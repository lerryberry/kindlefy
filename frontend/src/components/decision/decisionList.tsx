import { useGetAllDecisions } from "./useGetDecisions";
import DecisionListItem from "./decisionListItem";
import toast from "react-hot-toast";
import type { UseGetAllDecisionsReturn } from "../../types/decision";

export default function DecisionList() {
    const { data, isLoading, error, isSuccess }: UseGetAllDecisionsReturn = useGetAllDecisions();

    if (isLoading) return <div>Loading...</div>;
    if (isSuccess) toast.success("loaded decision list successfully")
    if (error) return <div>Error: {error.message}</div>;

    return (
        <ul>
            {data?.data?.map((decision) => (
                <li key={decision._id}>
                    <DecisionListItem decisionObject={decision} />
                </li>
            ))}
        </ul>
    )
}