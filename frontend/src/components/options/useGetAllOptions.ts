import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import type { UseGetOptionListReturn } from '../../types/options';

export function useGetAllOptions(decisionId: string): UseGetOptionListReturn {
    const api = useAuthenticatedAxios();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["allOptions", decisionId],
        queryFn: async () => {
            console.log("Fetching all options for decisionId:", decisionId);
            const res = await api.get(`/decisions/${decisionId}/options`);
            return res.data;
        },
        enabled: !!decisionId
    });

    return { data, isLoading, error, isSuccess, isError, isFetching };
}
