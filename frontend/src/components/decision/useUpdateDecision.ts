import { useAuthenticatedAxios } from "../../api/services/useAuthenticatedAxios";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportError } from "../../utils/errorReporting";

interface UpdateDecisionData {
    title?: string;
}

export function useUpdateDecision() {
    const api = useAuthenticatedAxios();
    const queryClient = useQueryClient();

    const updateDecision = async ({ id, formData }: { id: string, formData: UpdateDecisionData }) => {
        const res = await api.put(`/decisions/${id}`, formData);
        return res.data;
    };

    const { mutate: updateDecisionMutation, isPending: isUpdating, isSuccess: isUpdateSuccess } = useMutation({
        mutationFn: updateDecision,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["allDecisions"] });
            queryClient.invalidateQueries({ queryKey: ["decision"] }); // Invalidate single decision query
        },
        onError: (err) => {
            reportError(err, { feature: 'decisions', action: 'update', entity: 'decision' });
        }
    });

    return { updateDecisionMutation, isUpdating, isUpdateSuccess };
}
