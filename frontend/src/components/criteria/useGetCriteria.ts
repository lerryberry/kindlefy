import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import type { UseGetCriteriaReturn, UseGetCriteriaListReturn } from '../../types/criteria';

export function useGetCriteriaList(decisionId: string): UseGetCriteriaListReturn {
    const api = useAuthenticatedAxios();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["criteria", decisionId],
        queryFn: async () => {
            const res = await api.get(`/decisions/${decisionId}/criteria`);
            return res.data;
        },
        enabled: !!decisionId
    });

    return { data, isLoading, error, isSuccess, isError, isFetching };
}

export function useGetCriteria(criteriaId: string): UseGetCriteriaReturn {
    const api = useAuthenticatedAxios();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["criteria", criteriaId],
        queryFn: async () => {
            const res = await api.get(`/criteria/${criteriaId}`);
            return res.data;
        },
        enabled: !!criteriaId
    });

    return { data, isLoading, error, isSuccess, isError, isFetching };
}
