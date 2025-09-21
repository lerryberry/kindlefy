import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateOptionData } from '../../types/options';
import { useParams } from "react-router-dom";

export function useAddOption() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();
    const { decisionId } = useParams(); // Using useParams to get decisionId

    const createOption = async (formData: CreateOptionData[]) => {
        const res = await api.post(`/decisions/${decisionId}/options`, formData);
        return res.data;
    };

    const { mutate: addOption, isPending: isAdding, isSuccess, data: createdOption } = useMutation({
        mutationFn: createOption,
        onSuccess: () => {
            // Invalidate all options list to refresh the options list
            queryClient.invalidateQueries({ queryKey: ["allOptions", decisionId] });
            // Invalidate all rankedOptions queries to refresh the options lists
            queryClient.invalidateQueries({ queryKey: ["rankedOptions"] });
            // Invalidate criteria list to update isRanked status
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
            // Invalidate decision query to update status object
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            // Invalidate all decisions list to update status in decision tiles
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { isAdding, isSuccess, addOption, createdOption };
}
