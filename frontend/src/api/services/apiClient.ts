import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { consoleLogger } from '../../utils/consoleLogger';

/** Thrown when Auth0 cannot provide an access token; request is not sent. */
export const AUTH_TOKEN_UNAVAILABLE = 'AUTH_TOKEN_UNAVAILABLE';

export type CreateApiClientOptions = {
  /** Called once per burst when the API returns 401 (e.g. session/API mismatch). */
  onUnauthorized?: () => void | Promise<void>;
};

export function createApiClient(
  getToken: () => Promise<string>,
  options?: CreateApiClientOptions
): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.DEV ? 'http://localhost:3000/api/v1' : '/api/v1',
  });

  let authRecoveryInProgress = false;
  const triggerAuthRecovery = () => {
    const fn = options?.onUnauthorized;
    if (!fn || authRecoveryInProgress) return;
    authRecoveryInProgress = true;
    void Promise.resolve(fn()).finally(() => {
      authRecoveryInProgress = false;
    });
  };

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      consoleLogger.api.request(
        config.method?.toUpperCase() || 'GET',
        config.url || '',
        config.data
      );

      try {
        const token = await getToken();
        consoleLogger.debug('Token received:', token ? `${token.substring(0, 20)}...` : 'null');

        const trimmed = typeof token === 'string' ? token.trim() : '';
        if (!trimmed) {
          consoleLogger.warn('No token available for request');
          triggerAuthRecovery();
          return Promise.reject(new Error(AUTH_TOKEN_UNAVAILABLE));
        }

        if (config.headers) {
          config.headers.Authorization = `Bearer ${trimmed}`;
          consoleLogger.debug('Token added to request headers');
        }
      } catch (error) {
        consoleLogger.error('Failed to get token:', error);
        triggerAuthRecovery();
        return Promise.reject(
          error instanceof Error && error.message === AUTH_TOKEN_UNAVAILABLE
            ? error
            : new Error(AUTH_TOKEN_UNAVAILABLE)
        );
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

      const status = error.response?.status;
      if (status === 401) {
        triggerAuthRecovery();
      }

      return Promise.reject(error);
    }
  );

  return instance;
}
