// Criteria types based on your backend model
export interface Criteria {
    _id: string;
    title: string;
    description?: string;
    priority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
    isRanked: boolean;
    isArchived: boolean;
    parentDecision: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

// API response structure
export interface CriteriaResponse {
    status: 'success' | 'error';
    data: Criteria;
}

// For lists of criteria
export interface CriteriaListResponse {
    status: 'success' | 'error';
    results: number;
    output: Criteria[];
    lastPage: boolean;
}

// Form data for creating criteria
export interface CreateCriteriaData {
    title: string;
    description?: string;
    priority: 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE' | 'WONT_HAVE';
    parentDecision: string;
}

// Hook return types
export interface UseGetCriteriaReturn {
    data: CriteriaResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}

export interface UseGetCriteriaListReturn {
    data: CriteriaListResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}
