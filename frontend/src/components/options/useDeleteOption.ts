import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useDeleteOption() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();
    const { decisionId } = useParams(); // Using useParams to get decisionId

    const deleteOption = async (optionId: string) => {
        const res = await api.delete(`/decisions/${decisionId}/options/${optionId}`);
        return res.data;
    };

    const { mutate: deleteOptionMutation, isPending: isDeleting, isSuccess } = useMutation({
        mutationFn: deleteOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["option"] }); // Invalidate general option queries
            queryClient.invalidateQueries({ queryKey: ["allOptions", decisionId] }); // Invalidate all options list
            queryClient.invalidateQueries({ queryKey: ["rankedOptions"] }); // Invalidate ranked options lists
            // Invalidate criteria list to update isRanked status
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
            // Invalidate decision query to update status object
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            // Invalidate all decisions list to update status in decision tiles
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
            toast.success("Option deleted successfully");
        },
        onError: (err: any) => {
            // Extract the error message from the server response
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete option';
            toast.error(errorMessage);
        },
    });

    return { deleteOptionMutation, isDeleting, isSuccess };
}
