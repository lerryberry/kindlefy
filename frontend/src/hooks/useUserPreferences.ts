import { useAuthenticatedAxios } from "../api/services/useAuthenticatedAxios";
import { useQuery } from '@tanstack/react-query';

export interface MeResponse {
    status: string;
    data: {
        user: {
            _id: string;
            externalId: string;
            email: string;
            name: string;
            profilePic?: string;
            createdAt?: string;
            updatedAt?: string;
        };
    };
}

export function useGetMe() {
    const api = useAuthenticatedAxios();

    const getMe = async (): Promise<MeResponse['data']['user']> => {
        const res = await api.get<MeResponse>('/users/me');
        return res.data.data.user;
    };

    const { data: user, isLoading, error } = useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return { user, isLoading, error };
}

