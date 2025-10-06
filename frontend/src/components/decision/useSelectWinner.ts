import { useAuthenticatedAxios } from '../../api/services/useAuthenticatedAxios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function useSelectWinner(decisionId: string) {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (optionId: string) => {
            const res = await api.post(`/decisions/${decisionId}/report`, {
                optionId: optionId
            });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Winner selected successfully!');
            // Invalidate report query to refresh the data
            queryClient.invalidateQueries({ queryKey: ["decision-report", decisionId] });
            // Invalidate decision query to update status
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            // Invalidate all decisions list to update status in decision tiles
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        },
        onError: (error) => {
            toast.error('Failed to select winner');
            console.error('Error selecting winner:', error);
        }
    });
}
