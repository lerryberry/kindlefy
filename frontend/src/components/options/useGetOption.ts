import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface Option {
    _id: string;
    title: string;
    description?: string;
    parentDecision: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

interface OptionResponse {
    status: 'success' | 'error';
    data: Option;
}

interface UseGetOptionReturn {
    data: OptionResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}

export function useGetOption(optionId: string): UseGetOptionReturn {
    const api = useAuthenticatedAxios();
    const { decisionId } = useParams();

    const { data, isLoading, error, isSuccess, isError, isFetching } = useQuery({
        queryKey: ["option", optionId],
        queryFn: async () => {
            const res = await api.get(`/decisions/${decisionId}/options/${optionId}`);
            return res.data;
        },
        enabled: !!optionId && !!decisionId
    });

    return { data, isLoading, error, isSuccess, isError, isFetching };
}

