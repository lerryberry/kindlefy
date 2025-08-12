import axios, { type AxiosInstance } from "axios";

export function createApiClient(getToken: () => Promise<string>): AxiosInstance {
    const instance = axios.create({
        baseURL: "/api/v1",
    });

    instance.interceptors.request.use(
        async (config) => {
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