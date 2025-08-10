import { useGetAllDecisions } from "./useGetDecisions";
import DecisionListItem from "./decisionListItem";
import toast from "react-hot-toast";
import type { Decision } from '../../types';

export default function DecisionList() {
    const { data, isLoading, error, isSuccess } = useGetAllDecisions();

    if (isLoading) return <div>Loading...</div>;
    if (isSuccess) toast.success("loaded decision list successfully")
    if (error) return <div>Error: {(error as Error).message}</div>;

    return (
        <ul>
            {data?.data?.map((decision: Decision) => (
                <li key={decision._id}>
                    <DecisionListItem decisionObject={decision} />
                </li>
            ))}
        </ul>
    )
}