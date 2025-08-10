import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from '../../types';

export function createApiClient(getToken: () => Promise<string>): AxiosInstance {
    const instance = axios.create({
        baseURL: "/api/v1",
    });

    instance.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
            const token = await getToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
}

// Type-safe API response wrapper
export function createTypedApiClient<T>(getToken: () => Promise<string>) {
    const client = createApiClient(getToken);
    return {
        get: (url: string) => client.get<ApiResponse<T>>(url),
        post: (url: string, data?: unknown) => client.post<ApiResponse<T>>(url, data),
        put: (url: string, data?: unknown) => client.put<ApiResponse<T>>(url, data),
        delete: (url: string) => client.delete<ApiResponse<T>>(url),
    };
}