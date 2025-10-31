import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import type { UseGetDecisionReportReturn } from '../../types/decision';

export function useGetDecisionReport(decisionId: string, enabled: boolean = true): UseGetDecisionReportReturn {
    const api = useAuthenticatedAxios();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["decision-report", decisionId],
        queryFn: async () => {
            const res = await api.get(`/decisions/${decisionId}/report`);
            return res.data;
        },
        enabled: !!decisionId && enabled
    });

    return { data, isLoading, error, isSuccess, isError, isFetching };
}
