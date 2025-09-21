import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateOptionData } from '../../types/options';

interface UpdateOptionData extends Partial<CreateOptionData> {
    optionId: string;
    decisionId: string;
}

export function useUpdateOption() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const updateOption = async (formData: UpdateOptionData) => {
        const { optionId, decisionId, ...dataToUpdate } = formData;
        const res = await api.put(`/decisions/${decisionId}/options/${optionId}`, dataToUpdate);
        return res.data;
    };

    const { mutate: updateOptionMutation, isPending: isUpdating, isSuccess, data: updatedOption } = useMutation({
        mutationFn: updateOption,
        onSuccess: (variables) => {
            queryClient.invalidateQueries({ queryKey: ["option", variables.optionId] });
            queryClient.invalidateQueries({ queryKey: ["allOptions", variables.decisionId] });
            queryClient.invalidateQueries({ queryKey: ["rankedOptions"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { isUpdating, isSuccess, updateOptionMutation, updatedOption };
}
