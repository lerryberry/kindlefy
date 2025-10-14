import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportError } from "../../utils/errorReporting";

export function useAddDecisions() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const createDecision = async (formData: { title: string }) => {
        const res = await api.post("/decisions", formData);
        return res.data;
    };

    const { mutate: addDecision, isPending: isAdding, isSuccess, data: createdDecision } = useMutation({
        mutationFn: createDecision,
               onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
            // Navigate to the newly created decision
            if (data?.data?._id) {
                window.location.href = `/decisions/${data.data._id}`;
            }
        },
               onError: (err: any) => {
            reportError(err, { feature: 'decisions', action: 'create', entity: 'decision' });
        }
    });

    return { isAdding, isSuccess, addDecision, createdDecision };
}