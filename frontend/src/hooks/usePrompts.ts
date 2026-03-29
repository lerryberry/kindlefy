import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedAxios } from '../api/services/useAuthenticatedAxios';
import type {
  CreatePromptBody,
  PromptResponse,
  PromptsListResponse,
  UpdatePromptBody,
} from '../types/prompt';

export function usePromptsQuery() {
  const api = useAuthenticatedAxios();
  return useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await api.get<PromptsListResponse>('/prompts');
      return res.data;
    },
  });
}

export function useCreatePromptMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreatePromptBody) => {
      const res = await api.post<PromptResponse>('/prompts', body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}

export function useUpdatePromptMutation() {
  const api = useAuthenticatedAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdatePromptBody }) => {
      const res = await api.put<PromptResponse>(`/prompts/${id}`, body);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] });
    },
  });
}
