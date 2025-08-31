import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

export function useDeleteOption() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();
    const { decisionId } = useParams(); // Using useParams to get decisionId
    const navigate = useNavigate();

    const deleteOption = async (optionId: string) => {
        const res = await api.delete(`/decisions/${decisionId}/options/${optionId}`);
        return res.data;
    };

    const { mutate: deleteOptionMutation, isPending: isDeleting, isSuccess } = useMutation({
        mutationFn: deleteOption,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["option"] }); // Invalidate general option queries
            queryClient.invalidateQueries({ queryKey: ["rankedOptions"] }); // Invalidate ranked options lists
            // Invalidate criteria list to update isRanked status
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
            // After deletion, navigate back to the previous page
            navigate(-1);
        },
        onError: (err: Error) => {
            toast.error(`Failed to delete option: ${err.message}`);
        },
    });

    return { deleteOptionMutation, isDeleting, isSuccess };
}
