import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAddDecisions() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const createDecision = async (formData: { title: string }) => {
        const res = await api.post("/decisions", formData);
        return res.data;
    };

    const { mutate: addDecision, isPending: isAdding, isSuccess, data: createdDecision } = useMutation({
        mutationFn: createDecision,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
            // Navigate to the newly created decision
            if (data?.data?._id) {
                window.location.href = `/decisions/${data.data._id}`;
            }
        },
        onError: (err) => console.log(err.message)
    });

    return { isAdding, isSuccess, addDecision, createdDecision };
}