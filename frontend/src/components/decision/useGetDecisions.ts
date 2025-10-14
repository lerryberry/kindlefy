import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useParams } from "react-router-dom";

export function useGetDecisions() {
    const api = useAuthenticatedAxios();

    return useInfiniteQuery({
        queryKey: ["allDecisions"],
        queryFn: async ({ pageParam = 1 }: any) => {
            const res = await api.get(`/decisions?page=${pageParam}&limit=10`);
            return res.data;
        },
        getNextPageParam: (lastPage: any, allPages: any) => {
            // If lastPage is true, we've reached the end
            if (lastPage.lastPage) return undefined;
            // Otherwise, return the next page number
            return allPages.length + 1;
        },
        initialPageParam: 1
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