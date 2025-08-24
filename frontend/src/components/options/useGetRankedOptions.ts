import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface RankedOption {
    _id: string;
    title: string;
    rank: number;
    matchLevel: string;
}

interface RankedOptionsResponse {
    status: 'success' | 'error';
    results: number;
    data: RankedOption[];
}

interface UseGetRankedOptionsReturn {
    data: RankedOptionsResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}

export function useGetRankedOptions(criterionId: string): UseGetRankedOptionsReturn {
    const api = useAuthenticatedAxios();
    const { decisionId } = useParams();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["rankedOptions", criterionId],
        queryFn: async () => {
            const res = await api.get(`/decisions/${decisionId}/criteria/${criterionId}/ranking`);
            return res.data;
        },
        enabled: !!criterionId && !!decisionId
    });

    return { data, isLoading, error, isSuccess, isError, isFetching };
}
