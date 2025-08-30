import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';

export function useGetDecision(decisionId: string | undefined) {
    const api = useAuthenticatedAxios();

    const getDecision = async (id: string) => {
        const res = await api.get(`/decisions/${id}`);
        return res.data;
    };

    const { data: decision, isLoading } = useQuery({
        queryKey: ["decision", decisionId],
        queryFn: () => (decisionId ? getDecision(decisionId) : Promise.reject("No decisionId provided")),
        enabled: !!decisionId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { decision, isLoading };
}
