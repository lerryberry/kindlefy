import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCriteriaData } from '../../types/criteria';

export function useAddCriteria() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const createCriteria = async (formData: CreateCriteriaData) => {
        const res = await api.post(`/decisions/${formData.parentDecision}/criteria`, formData);
        return res.data;
    };

    const { mutate: addCriteria, isPending: isAdding, isSuccess, data: createdCriteria } = useMutation({
        mutationFn: createCriteria,
        onSuccess: () => {
            // Invalidate any individual criteria queries that might be cached
            queryClient.invalidateQueries({ queryKey: ["criteria"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { isAdding, isSuccess, addCriteria, createdCriteria };
}
