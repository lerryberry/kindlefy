import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateOptionData } from '../../types/options';
import { reportError } from "../../utils/errorReporting";

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
               onSuccess: (variables: any) => {
            queryClient.invalidateQueries({ queryKey: ["option", variables.optionId] });
            queryClient.invalidateQueries({ queryKey: ["allOptions", variables.decisionId] });
            queryClient.invalidateQueries({ queryKey: ["rankedOptions"] });
            // Invalidate decision details so the stepper reflects latest status
            queryClient.invalidateQueries({ queryKey: ["decision", variables.decisionId] });
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        },
               onError: (err: any) => {
            reportError(err, { feature: 'options', action: 'update', entity: 'option' });
        }
    });

    return { isUpdating, isSuccess, updateOptionMutation, updatedOption };
}
