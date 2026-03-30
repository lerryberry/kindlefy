import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedAxios } from '../api/services/useAuthenticatedAxios';
import type { CreateTargetBody, Target, TargetResponse, TargetsListResponse } from '../types/target';

export function useTargetsQuery() {
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['targets'],
    queryFn: async () => {
      const res = await api.get<TargetsListResponse>('/targets');
      return res.data;
    },
  });
}

export function useCreateTargetMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateTargetBody) => {
      const res = await api.post<TargetResponse>('/targets', body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
    },
  });
}

export function useDeleteTargetMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      await api.delete(`/targets/${targetId}`);
      return targetId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['targets'] });
      queryClient.invalidateQueries({ queryKey: ['digestTimingTargets'] });
      queryClient.invalidateQueries({ queryKey: ['digestTimings'] });
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

export function targetIdsFromTiming(targets: (Target | string)[] | undefined): string[] {
  if (!targets?.length) return [];
  return targets.map((t) => (typeof t === 'object' && t && '_id' in t ? t._id : String(t)));
}
