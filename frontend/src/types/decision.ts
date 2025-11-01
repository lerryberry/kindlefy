// Decision types based on your backend model
export interface Decision {
    _id: string;
    title: string;
    category: 'PRODUCT' | 'SERVICE' | 'STAFF' | 'GENERIC';
    slug: string;
    isArchived: boolean;
    accessControl: Array<{
        userId: string;
        permissions: Array<'READ' | 'UPDATE' | 'DELETE' | 'RANK'>;
    }>;
    createdAt: string;
    updatedAt: string;
    isDecided: boolean;
    status?: {
        hasOptions: boolean;
        hasCriteria: boolean;
        isFullyRanked: boolean;
        isDecided: boolean;
    };
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

export interface CriteriaRankingAnalysis {
    _id: string;
    title: string;
    rankingSummary: string;
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
    tags?: string[];
    isWinner: boolean;
    percentageSimilarToBestTheoreticallyPossibleScore?: number;
    criteriaRankingAnalysis?: CriteriaRankingAnalysis[];
}

export interface DecisionDetails {
    _id: string;
    title: string;
}

export interface DecisionReportData {
    decisionDetails: DecisionDetails;
    options: ReportOption[];
    writtenSummary?: string;
}

export interface DecisionReportResponse {
    status: 'success' | 'error';
    data: DecisionReportData;
}

// Form data for creating decisions
export interface CreateDecisionData {
    title: string;
    category: string;
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
