import axios, { type AxiosInstance } from "axios";
import { consoleLogger } from "../../utils/consoleLogger";

export function createApiClient(getToken: () => Promise<string>): AxiosInstance {
    const instance = axios.create({
        baseURL: import.meta.env.DEV ? "http://localhost:3000/api/v1" : "/api/v1",
    });

    instance.interceptors.request.use(
        async (config) => {
            consoleLogger.api.request(
                config.method?.toUpperCase() || 'GET',
                config.url || '',
                config.data
            );

            try {
                const token = await getToken();
                consoleLogger.debug('Token received:', token ? `${token.substring(0, 20)}...` : 'null');

                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                    consoleLogger.debug('Token added to request headers');
                } else {
                    consoleLogger.warn('No token available for request');
                }
            } catch (error) {
                consoleLogger.error('Failed to get token:', error);
            }

            return config;
        },
        (error) => {
            consoleLogger.api.error('REQUEST', error.config?.url || '', error);
            return Promise.reject(error);
        }
    );

    instance.interceptors.response.use(
        (response) => {
            consoleLogger.api.response(
                response.config.method?.toUpperCase() || 'GET',
                response.config.url || '',
                response.status,
                response.data
            );
            return response;
        },
        (error) => {
            consoleLogger.api.error(
                error.config?.method?.toUpperCase() || 'GET',
                error.config?.url || '',
                error
            );
            return Promise.reject(error);
        }
    );

    return instance;
}