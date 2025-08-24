import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateOptionData } from '../../types/options';

export function useAddOption() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const createOption = async (formData: CreateOptionData) => {
        const res = await api.post(`/decisions/${formData.parentDecision}/options`, formData);
        return res.data;
    };

    const { mutate: addOption, isPending: isAdding, isSuccess, data: createdOption } = useMutation({
        mutationFn: createOption,
        onSuccess: () => {
            // Invalidate all rankedOptions queries to refresh the options lists
            queryClient.invalidateQueries({ queryKey: ["rankedOptions"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { isAdding, isSuccess, addOption, createdOption };
}
