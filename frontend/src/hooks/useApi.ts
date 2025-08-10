import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { createTypedApiClient } from '../api/services/apiClient';
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
    return createTypedApiClient<Decision>(getAccessTokenSilently);
};

// Decisions API hooks
export const useDecisions = (): QueryResult<ApiResponse<Decision[]>> => {
    const apiClient = useApiClient();

    return useQuery({
        queryKey: ['decisions'],
        queryFn: () => apiClient.get('/decisions').then(res => res.data),
    });
};

export const useDecision = (id: string): QueryResult<ApiResponse<Decision>> => {
    const apiClient = useApiClient();

    return useQuery({
        queryKey: ['decisions', id],
        queryFn: () => apiClient.get(`/decisions/${id}`).then(res => res.data),
        enabled: !!id,
    });
};

export const useCreateDecision = (): MutationResult<ApiResponse<Decision>, CreateDecisionRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateDecisionRequest) =>
            apiClient.post('/decisions', data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions'] });
        },
    });
};

export const useUpdateDecision = (id: string): MutationResult<ApiResponse<Decision>, Partial<CreateDecisionRequest>> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Partial<CreateDecisionRequest>) =>
            apiClient.put(`/decisions/${id}`, data).then(res => res.data),
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
        mutationFn: (id: string) =>
            apiClient.delete(`/decisions/${id}`).then(() => undefined),
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
        queryFn: () => apiClient.get(`/decisions/${decisionId}/criteria`).then(res => res.data),
        enabled: !!decisionId,
    });
};

export const useCreateCriteria = (decisionId: string): MutationResult<ApiResponse<Criteria>, CreateCriteriaRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateCriteriaRequest) =>
            apiClient.post(`/decisions/${decisionId}/criteria`, data).then(res => res.data),
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
        queryFn: () => apiClient.get(`/decisions/${decisionId}/options`).then(res => res.data),
        enabled: !!decisionId,
    });
};

export const useCreateOption = (decisionId: string): MutationResult<ApiResponse<Option>, CreateOptionRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOptionRequest) =>
            apiClient.post(`/decisions/${decisionId}/options`, data).then(res => res.data),
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
        queryFn: () => apiClient.get(`/decisions/${decisionId}/rankings`).then(res => res.data),
        enabled: !!decisionId,
    });
};

export const useCreateRanking = (decisionId: string): MutationResult<ApiResponse<Ranking>, CreateRankingRequest> => {
    const apiClient = useApiClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateRankingRequest) =>
            apiClient.post(`/decisions/${decisionId}/rankings`, data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['decisions', decisionId, 'rankings'] });
        },
    });
};
