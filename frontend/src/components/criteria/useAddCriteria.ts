import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCriteriaData } from '../../types/criteria';
import { useParams } from "react-router-dom";

export function useAddCriteria() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();
    const { decisionId } = useParams();

    const createCriteria = async (formData: CreateCriteriaData) => {
        // Wrap single criterion in array for bulk endpoint
        const criteriaArray = [{
            title: formData.title,
            description: formData.description,
            priority: formData.priority
        }];

        const res = await api.post(`/decisions/${decisionId}/criteria`, criteriaArray);
        return res.data;
    };

    const { mutate: addCriteria, isPending: isAdding, isSuccess, data: createdCriteria } = useMutation({
        mutationFn: createCriteria,
        onSuccess: () => {
            // Invalidate criteria list to refresh the criteria list
            queryClient.invalidateQueries({ queryKey: ["criteria", decisionId] });
            // Invalidate decision query to update status object
            queryClient.invalidateQueries({ queryKey: ["decision", decisionId] });
            // Invalidate all decisions list to update status in decision tiles
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
        },
        onError: (err) => console.log(err.message)
    });

    return { isAdding, isSuccess, addCriteria, createdCriteria };
}
