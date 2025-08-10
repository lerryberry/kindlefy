import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { createApiClient } from '../api/services/apiClient';
import type {
    ApiResponse,
    Decision,
    Criteria,
    Option,
    Ranking,
    CreateDecisionRequest,
    CreateCriteriaRequest,
    CreateOptionRequest,
    CreateRankingRequest,
    QueryResult,
    MutationResult
} from '../types';

// Create a typed API client
const useApiClient = () => {
    const { getAccessTokenSilently } = useAuth0();
    return createApiClient(getAccessTokenSilently);
};

// Decisions API hooks
export const useDecisions = (): QueryResult<ApiResponse<Decision[]>> => {
    const apiClient = useApiClient();

    return useQuery({
        queryKey: ['decisions'],
        queryFn: async () => {
            const response = await apiClient.get('/decisions');
            return response.data as unknown as ApiResponse<Decision[]>;
        },
    });
};

export const useDecision = (id: string): QueryResult<ApiResponse<Decision>> => {
    const apiClient = useApiClient();

    return useQuery({
        queryKey: ['decisions', id],
        queryFn: async () => {
            const response = await apiClient.get(`/decisions/${id}`);
            return response.data as unknown as ApiResponse<Decision>;
        },
        enabled: !!id,
    });
};

export const useCreateDecision = (): MutationResult<ApiResponse<Decision>, CreateDecisionRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateDecisionRequest) => {
            const response = await apiClient.post('/decisions', data);
            return response.data as unknown as ApiResponse<Decision>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions'] });
        },
    });
};

export const useUpdateDecision = (id: string): MutationResult<ApiResponse<Decision>, Partial<CreateDecisionRequest>> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<CreateDecisionRequest>) => {
            const response = await apiClient.put(`/decisions/${id}`, data);
            return response.data as unknown as ApiResponse<Decision>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions'] });
            queryClient.invalidateQueries({ queryKey: ['decisions', id] });
        },
    });
};

export const useDeleteDecision = (): MutationResult<void, string> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await apiClient.delete(`/decisions/${id}`);
            return undefined;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions'] });
        },
    });
};

// Criteria API hooks
export const useCriteria = (decisionId: string): QueryResult<ApiResponse<Criteria[]>> => {
    const apiClient = useApiClient();

    return useQuery({
        queryKey: ['decisions', decisionId, 'criteria'],
        queryFn: async () => {
            const response = await apiClient.get(`/decisions/${decisionId}/criteria`);
            return response.data as unknown as ApiResponse<Criteria[]>;
        },
        enabled: !!decisionId,
    });
};

export const useCreateCriteria = (decisionId: string): MutationResult<ApiResponse<Criteria>, CreateCriteriaRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateCriteriaRequest) => {
            const response = await apiClient.post(`/decisions/${decisionId}/criteria`, data);
            return response.data as unknown as ApiResponse<Criteria>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions', decisionId, 'criteria'] });
        },
    });
};

// Options API hooks
export const useOptions = (decisionId: string): QueryResult<ApiResponse<Option[]>> => {
    const apiClient = useApiClient();

    return useQuery({
        queryKey: ['decisions', decisionId, 'options'],
        queryFn: async () => {
            const response = await apiClient.get(`/decisions/${decisionId}/options`);
            return response.data as unknown as ApiResponse<Option[]>;
        },
        enabled: !!decisionId,
    });
};

export const useCreateOption = (decisionId: string): MutationResult<ApiResponse<Option>, CreateOptionRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateOptionRequest) => {
            const response = await apiClient.post(`/decisions/${decisionId}/options`, data);
            return response.data as unknown as ApiResponse<Option>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions', decisionId, 'options'] });
        },
    });
};

// Rankings API hooks
export const useRankings = (decisionId: string): QueryResult<ApiResponse<Ranking[]>> => {
    const apiClient = useApiClient();

    return useQuery({
        queryKey: ['decisions', decisionId, 'rankings'],
        queryFn: async () => {
            const response = await apiClient.get(`/decisions/${decisionId}/rankings`);
            return response.data as unknown as ApiResponse<Ranking[]>;
        },
        enabled: !!decisionId,
    });
};

export const useCreateRanking = (decisionId: string): MutationResult<ApiResponse<Ranking>, CreateRankingRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateRankingRequest) => {
            const response = await apiClient.post(`/decisions/${decisionId}/rankings`, data);
            return response.data as unknown as ApiResponse<Ranking>;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions', decisionId, 'rankings'] });
        },
    });
};
