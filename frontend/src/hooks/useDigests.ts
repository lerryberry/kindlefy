import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedAxios } from '../api/services/useAuthenticatedAxios';
import type {
  DigestContentItem,
  DigestListItem,
  DigestTimingListItem,
  LocationCoordinates,
} from '../types/digest';
import type { Target } from '../types/target';
import type { Schedule } from '../types/timing';
import type { NewsScope } from '../constants/newsScope';

export interface CreateDigestContentBody {
  length: number;
  topics: string[];
  newsScope: NewsScope;
  locationText: string;
  locationCoordinates?: LocationCoordinates;
  locationTimezone?: string;
}

export interface UpdateDigestContentBody {
  length?: number;
  topics?: string[];
  newsScope?: NewsScope;
  locationText?: string;
  locationCoordinates?: LocationCoordinates;
  locationTimezone?: string;
}

export interface CreateDigestTimingBody {
  schedule: Schedule;
}

export interface UpdateDigestTimingScheduleBody {
  schedule: Schedule;
}

export interface UpdateDigestTimingTargetsBody {
  targets: string[];
}

export interface UpdateDigestEnabledBody {
  enabled: boolean;
}

interface DigestsListResponse {
  status: string;
  results: number;
  data: DigestListItem[];
}

interface DigestContentsListResponse {
  status: string;
  results: number;
  data: DigestContentItem[];
}

interface DigestTimingsListResponse {
  status: string;
  results: number;
  digestLinkedTargetIds: string[];
  data: DigestTimingListItem[];
}

export type DigestTimingsQueryData = {
  timings: DigestTimingListItem[];
  digestLinkedTargetIds: string[];
};

interface DigestTargetsResponse {
  status: string;
  results: number;
  data: Target[];
}

interface UpdateDigestTargetsResponse {
  status: string;
  data: {
    timingId: string;
    targets: Target[];
  };
}

interface CreateDigestAndFirstContentResponse {
  status: string;
  data: {
    digestId: string;
    contentId: string;
    prompt: {
      length: number;
      topics: string[];
      newsScope: NewsScope;
      locationText: string;
      locationCoordinates?: LocationCoordinates;
      locationTimezone?: string;
    };
  };
}

interface DigestContentItemResponse {
  status: string;
  data: DigestContentItem;
}

interface CreateDigestTimingResponse {
  status: string;
  data: DigestTimingListItem;
}

interface UpdateDigestTimingScheduleResponse {
  status: string;
  data: DigestTimingListItem;
}

interface UpdateDigestEnabledResponse {
  status: string;
  data: {
    digestId: string;
    enabled: boolean;
  };
}

export function useDigestsQuery() {
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['digests'],
    queryFn: async () => {
      const res = await api.get<DigestsListResponse>('/digests');
      return res.data.data;
    },
  });
}

export function useDeleteDigestMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (digestId: string) => {
      await api.delete(`/digests/${digestId}`);
      return digestId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

export function useUpdateDigestEnabledMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ digestId, body }: { digestId: string; body: UpdateDigestEnabledBody }) => {
      const res = await api.put<UpdateDigestEnabledResponse>(`/digests/${digestId}/enabled`, body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

export function useCreateDigestAndFirstContentItemMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateDigestContentBody) => {
      const res = await api.post<CreateDigestAndFirstContentResponse>('/digests/content', body);
      const { digestId, contentId, prompt } = res.data.data;
      const content: DigestContentItem = {
        contentId,
        order: 0,
        length: prompt.length,
        topics: prompt.topics,
        newsScope: prompt.newsScope,
        locationText: prompt.locationText ?? '',
        locationCoordinates: prompt.locationCoordinates ?? { lat: null, lng: null },
        locationTimezone: prompt.locationTimezone ?? '',
      };
      return { digestId, contentId, content };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

export function useGetDigestContentsQuery(digestId: string | null) {
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['digestContents', digestId],
    enabled: Boolean(digestId),
    queryFn: async () => {
      const res = await api.get<DigestContentsListResponse>(`/digests/${digestId}/content`);
      return res.data.data;
    },
  });
}

export function useCreateDigestContentItemMutation(digestId: string | null) {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateDigestContentBody) => {
      if (!digestId) throw new Error('Missing digestId');
      const res = await api.post<DigestContentItemResponse>(`/digests/${digestId}/content`, body);
      return res.data.data;
    },
    onSuccess: () => {
      if (digestId) {
        queryClient.invalidateQueries({ queryKey: ['digestContents', digestId] });
        queryClient.invalidateQueries({ queryKey: ['digests'] });
      }
    },
  });
}

export function useUpdateDigestContentItemMutation(digestId: string | null, contentId: string | null) {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateDigestContentBody) => {
      if (!digestId || !contentId) throw new Error('Missing digestId/contentId');
      const res = await api.put<DigestContentItemResponse>(
        `/digests/${digestId}/content/${contentId}`,
        body
      );
      return res.data.data;
    },
    onSuccess: () => {
      if (digestId) {
        queryClient.invalidateQueries({ queryKey: ['digestContents', digestId] });
        queryClient.invalidateQueries({ queryKey: ['digests'] });
      }
    },
  });
}

export function useDeleteDigestContentItemMutation(digestId: string | null) {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contentId: string) => {
      if (!digestId) throw new Error('Missing digestId');
      await api.delete(`/digests/${digestId}/content/${contentId}`);
      return contentId;
    },
    onSuccess: () => {
      if (digestId) {
        queryClient.invalidateQueries({ queryKey: ['digestContents', digestId] });
        queryClient.invalidateQueries({ queryKey: ['digestTimings', digestId] });
        queryClient.invalidateQueries({ queryKey: ['digests'] });
      }
    },
  });
}

export function useReorderDigestContentsMutation(digestId: string | null) {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contentIds: string[]) => {
      if (!digestId) throw new Error('Missing digestId');
      const res = await api.put<{
        status: string;
        results: number;
        data: DigestContentItem[];
      }>(`/digests/${digestId}/content/reorder`, { contentIds });
      return res.data.data;
    },
    onSuccess: () => {
      if (digestId) {
        queryClient.invalidateQueries({ queryKey: ['digestContents', digestId] });
        queryClient.invalidateQueries({ queryKey: ['digests'] });
      }
    },
  });
}

export function useDigestTimingsQuery(digestId: string | null) {
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['digestTimings', digestId],
    enabled: Boolean(digestId),
    queryFn: async (): Promise<DigestTimingsQueryData> => {
      const res = await api.get<DigestTimingsListResponse>(`/digests/${digestId}/timings`);
      return {
        timings: res.data.data,
        digestLinkedTargetIds: res.data.digestLinkedTargetIds ?? [],
      };
    },
  });
}

export function useCreateDigestTimingMutation(digestId: string | null) {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateDigestTimingBody) => {
      if (!digestId) throw new Error('Missing digestId');
      const res = await api.post<CreateDigestTimingResponse>(`/digests/${digestId}/timings`, body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digestTimings', digestId] });
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

export function useUpdateDigestTimingScheduleMutation(digestId: string | null) {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ timingId, body }: { timingId: string; body: UpdateDigestTimingScheduleBody }) => {
      if (!digestId) throw new Error('Missing digestId');
      const res = await api.put<UpdateDigestTimingScheduleResponse>(
        `/digests/${digestId}/timings/${timingId}/schedule`,
        body
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digestTimings', digestId] });
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

export function useDigestTimingTargetsQuery(digestId: string | null, timingId: string | null) {
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['digestTimingTargets', digestId, timingId],
    enabled: Boolean(digestId && timingId),
    queryFn: async () => {
      const res = await api.get<DigestTargetsResponse>(
        `/digests/${digestId}/timings/${timingId}/targets`
      );
      return res.data.data;
    },
  });
}

export function useUpdateDigestTimingTargetsMutation(digestId: string | null, timingId: string | null) {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateDigestTimingTargetsBody) => {
      if (!digestId || !timingId) throw new Error('Missing digestId/timingId');
      const res = await api.put<UpdateDigestTargetsResponse>(
        `/digests/${digestId}/timings/${timingId}/targets`,
        body
      );
      return res.data.data.targets;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digestTimingTargets', digestId, timingId] });
      queryClient.invalidateQueries({ queryKey: ['digestTimings', digestId] });
      queryClient.invalidateQueries({ queryKey: ['digests'] });
    },
  });
}

