import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedAxios } from '../api/services/useAuthenticatedAxios';
import type { CreateTimingBody, Timing, TimingResponse, TimingsListResponse, UpdateTimingBody } from '../types/timing';

export function useTimingsQuery() {
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['timings'],
    queryFn: async () => {
      const res = await api.get<TimingsListResponse>('/timings');
      return res.data;
    },
  });
}

export function useCreateTimingMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTimingBody) => {
      const res = await api.post<TimingResponse>('/timings', body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timings'] });
    },
  });
}

export function useUpdateTimingMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateTimingBody }) => {
      const res = await api.put<TimingResponse>(`/timings/${id}`, body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timings'] });
    },
  });
}

export function useDeleteTimingMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/timings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timings'] });
    },
  });
}

export function findTimingForPrompt(timings: Timing[] | undefined, promptId: string | null): Timing | undefined {
  if (!timings || !promptId) return undefined;
  return timings.find((t) => {
    const p = t.prompt;
    const id = typeof p === 'object' && p && '_id' in p ? p._id : p;
    return String(id) === String(promptId);
  });
}
