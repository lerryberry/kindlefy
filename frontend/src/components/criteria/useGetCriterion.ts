import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import type { UseGetCriteriaReturn } from '../../types/criteria';

export function useGetCriterion(criterionId: string | undefined): UseGetCriteriaReturn {
    const api = useAuthenticatedAxios();
    const { decisionId } = useParams();
    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["criterion", criterionId],
        queryFn: async () => {
            if (!decisionId || !criterionId) {
                return Promise.reject("Decision ID or Criterion ID is missing");
            }
            const res = await api.get(`/decisions/${decisionId}/criteria/${criterionId}`);
            return res.data;
        },
        enabled: !!criterionId && !!decisionId,
        staleTime: 1000 * 60 * 5,
    });
    return { data, isLoading, error, isSuccess, isError, isFetching };
}
