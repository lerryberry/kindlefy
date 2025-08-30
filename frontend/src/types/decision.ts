// Decision types based on your backend model
export interface Decision {
    _id: string;
    title: string;
    slug: string;
    isArchived: boolean;
    accessControl: Array<{
        userId: string;
        permissions: Array<'READ' | 'UPDATE' | 'DELETE' | 'RANK'>;
    }>;
    createdAt: string;
    updatedAt: string;
}

// API response structure
export interface DecisionResponse {
    status: 'success' | 'error';
    data: Decision;
}

// For lists of decisions
export interface DecisionsResponse {
    status: 'success' | 'error';
    data: Decision[];
}

export interface ReportOption {
    _id: string;
    title: string;
    description?: string;
    parentDecision: string;
    slug: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
    score: number;
    tags?: string[];
}

export interface DecisionReportResponse {
    status: 'success' | 'error';
    data: ReportOption[];
}

// Form data for creating decisions
export interface CreateDecisionData {
    title: string;
}

// Hook return types
export interface UseGetDecisionReturn {
    decision: DecisionResponse | undefined;
    isLoading: boolean;
}

export interface UseGetAllDecisionsReturn {
    data: DecisionsResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}

export interface UseGetDecisionReportReturn {
    data: DecisionReportResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}
