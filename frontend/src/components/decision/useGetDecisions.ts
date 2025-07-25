import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useParams } from "react-router-dom";

export function useGetAllDecisions() {
    const api = useAuthenticatedAxios();

    return useQuery({
        queryKey: ["allDecisions"],
        queryFn: async () => {
            const res = await api.get("/decisions");
            return res.data;
        }
    });
}

export function useGetDecision() {
    const { decisionId } = useParams();
    const api = useAuthenticatedAxios();

    return useQuery({
        queryKey: ["decision", decisionId],
        queryFn: async () => {
            const res = await api.get(`/decisions/${decisionId}`);
            return res.data;
        },
        enabled: !!decisionId // Only run query when decisionId exists
    });
}