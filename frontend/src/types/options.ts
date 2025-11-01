export interface Option {
    _id: string;
    title: string;
    description?: string;
    parentDecision: string;
    slug: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OptionResponse {
    status: 'success' | 'error';
    data: Option;
}

export interface OptionListResponse {
    status: 'success' | 'error';
    results: number;
    data: Option[];
    lastPage: boolean;
}

export type MatchLevel = "UNSORTED" | "BEST_CHOICE" | "IMPARTIAL" | "WORST_CHOICE";

export interface GroupedOption extends Option {
    matchLevel: MatchLevel;
    rank: number; // Add rank property
    id: string; // Add id property for generic drag and drop
}

export interface RankingFormData {
    optionId: string;
    criterionId: string;
    matchLevel: Exclude<MatchLevel, "UNSORTED">; // Exclude "UNSORTED" for backend submission
    rank: number;
}

export interface CreateOptionData {
    title: string;
    description?: string;
    parentDecision: string;
}

export interface UseGetOptionReturn {
    data: OptionResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}

export interface UseGetOptionListReturn {
    data: OptionListResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
}

export interface RankedOptionListResponse {
    status: 'success' | 'error';
    results: number;
    data: GroupedOption[];
}

export interface UseGetRankedOptionListReturn {
    data: RankedOptionListResponse | undefined;
    isLoading: boolean;
    error: Error | null;
    isSuccess: boolean;
    isError: boolean;
    isFetching: boolean;
    refetch: () => void;
}
