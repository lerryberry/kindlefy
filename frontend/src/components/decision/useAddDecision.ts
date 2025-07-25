import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAddDecisions() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const createDecision = async (formData: { title: string }) => {
        const res = await api.post("/decisions", formData);
        return res.data;
    };

    const { mutate: addDecision, isPending: isAdding, isSuccess } = useMutation({
        mutationFn: createDecision,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] })
        },
        onError: (err) => console.log(err.message)
    });

    return { isAdding, isSuccess, addDecision };
}