import { useQuery } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthenticatedAxios } from '../api/services/useAuthenticatedAxios';

interface PlacesStatusResponse {
  status: string;
  data: { enabled: boolean };
}

/**
 * Whether the server has GOOGLE_MAPS_API_KEY / GOOGLE_PLACES_API_KEY set.
 * Waits for Auth0 so the first request includes a Bearer token.
 */
export function usePlacesEnabledQuery() {
  const { isAuthenticated } = useAuth0();
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['placesStatus'],
    enabled: isAuthenticated,
    queryFn: async () => {
      const res = await api.get<PlacesStatusResponse>('/places/status');
      return res.data?.data?.enabled === true;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export interface PlaceSuggestion {
  placeId: string;
  label: string;
}
