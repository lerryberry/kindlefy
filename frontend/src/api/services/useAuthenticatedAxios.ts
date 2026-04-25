import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';
import { createApiClient } from './apiClient';
import { type AxiosInstance } from 'axios';

export function useAuthenticatedAxios(): AxiosInstance {
  const { getAccessTokenSilently, logout } = useAuth0();
  return useMemo(
    () =>
      createApiClient(getAccessTokenSilently, {
        onUnauthorized: () =>
          logout({
            logoutParams: {
              returnTo: `${window.location.origin}${window.location.pathname}`,
            },
          }),
      }),
    [getAccessTokenSilently, logout]
  );
}
