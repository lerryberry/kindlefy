import { useGetDecision } from "./useGetDecisions";
import toast from "react-hot-toast";

export default function Decision() {
    const { data, isLoading, error, isSuccess } = useGetDecision();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {(error as Error).message}</div>;
    if (isSuccess) {
        const decisionObject = { ...data.data }
        toast.success("loaded decision successfully")
        return (
            <h1>{decisionObject.title}</h1>
        )
    }
}