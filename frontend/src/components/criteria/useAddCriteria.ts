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
        onSuccess: (variables) => {
            queryClient.invalidateQueries({ queryKey: ["criteria", variables.parentDecision] });
        },
        onError: (err) => console.log(err.message)
    });

    return { isAdding, isSuccess, addCriteria, createdCriteria };
}
