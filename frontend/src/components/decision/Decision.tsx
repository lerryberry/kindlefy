import { useGetDecision } from "./useGetDecisions";
import toast from "react-hot-toast";
import type { Decision } from '../../types';

export default function Decision() {
    const { data, isLoading, error, isSuccess } = useGetDecision();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {(error as Error).message}</div>;
    if (isSuccess && data?.data) {
        const decisionObject: Decision = data.data;
        toast.success("loaded decision successfully");
        return (
            <h1>{decisionObject.title}</h1>
        );
    }

    return <div>No decision found</div>;
}