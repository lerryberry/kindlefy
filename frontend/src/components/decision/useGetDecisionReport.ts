import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import type { UseGetDecisionReportReturn } from '../../types/decision';

export function useGetDecisionReport(decisionId: string): UseGetDecisionReportReturn {
    const api = useAuthenticatedAxios();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["decision-report", decisionId],
        queryFn: async () => {
            const res = await api.get(`/decisions/${decisionId}/report`);
            return res.data;
        },
        enabled: !!decisionId
    });

    return { data, isLoading, error, isSuccess, isError, isFetching };
}
