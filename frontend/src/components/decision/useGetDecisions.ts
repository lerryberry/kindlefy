import { useParams } from "react-router-dom";
import { useDecisions, useDecision } from "../../hooks/useApi";
import type { ApiResponse, Decision } from "../../types";

export function useGetAllDecisions() {
    return useDecisions();
}

export function useGetDecision() {
    const { decisionId } = useParams<{ decisionId: string }>();
    return useDecision(decisionId || '');
}