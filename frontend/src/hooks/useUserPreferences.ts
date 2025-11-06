import { useAuthenticatedAxios } from "../api/services/useAuthenticatedAxios";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface UserPreferences {
    aiSuggestions: boolean;
}

export interface UserPreferencesResponse {
    status: string;
    data: {
        preferences: UserPreferences;
    };
}

export function useGetUserPreferences() {
    const api = useAuthenticatedAxios();

    const getUserPreferences = async (): Promise<UserPreferences> => {
        const res = await api.get<UserPreferencesResponse>('/users/config');
        return res.data.data.preferences;
    };

    const { data: preferences, isLoading, error } = useQuery({
        queryKey: ["user-preferences"],
        queryFn: getUserPreferences,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { preferences, isLoading, error };
}

export function useUpdateUserPreferences() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (preferences: Partial<UserPreferences>) => {
            const res = await api.put<UserPreferencesResponse>('/users/config', {
                preferences
            });
            return res.data.data.preferences;
        },
        onSuccess: (data) => {
            // Update the cache with the new preferences
            queryClient.setQueryData(["user-preferences"], data);
        },
    });

    return mutation;
}

