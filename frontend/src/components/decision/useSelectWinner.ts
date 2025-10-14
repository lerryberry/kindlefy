import { useAuthenticatedAxios } from '../../api/services/useAuthenticatedAxios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { reportError } from '../../utils/errorReporting';

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
               onError: (err: any) => {
            reportError(err, { feature: 'decisions', action: 'select-winner', entity: 'report' });
        }
    });
}
