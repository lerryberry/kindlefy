// Common component interfaces and types

// Form interfaces
export interface CreateCriteriaFormData {
    title: string;
    priority?: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
}

export interface CreateOptionFormData {
    title: string;
}

export interface CreateDecisionFormData {
    title: string;
    category: string;
    scope: string;
    type: string;
}

export interface ValidationRules {
    required: string;
    minLength: {
        value: number;
        message: string;
    };
    maxLength: {
        value: number;
        message: string;
    };
}

// Component prop interfaces
export interface CreateCriteriaListFormInputProps {
    criterionId?: string;
    criterionTitle?: string;
    criterionPriority?: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
    isNew?: boolean;
    hidePriority?: boolean;
}

export interface CreateOptionListFormInputProps {
    optionId?: string;
    optionTitle?: string;
    isNew?: boolean;
}

export interface CreateDecisionFormProps {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

export interface DecisionListItemProps {
    decision: {
        _id: string;
        title: string;
        slug: string;
        isArchived: boolean;
        createdAt: string;
        updatedAt: string;
        isDecided: boolean;
        status?: {
            hasOptions: boolean;
            hasCriteria: boolean;
            isFullyRanked: boolean;
            isDecided: boolean;
        };
    };
}

export interface OptionsListProps {
    criterionId?: string;
    onRankingSaved?: () => void;
}

export interface CriteriaDragDropListProps {
    criteria: Array<{
        _id: string;
        title: string;
        description?: string;
        priority: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
        isRanked: boolean;
        isArchived: boolean;
        parentDecision: string;
        slug: string;
        createdAt: string;
        updatedAt: string;
    }>;
}

export interface DraggableCriteria {
    _id: string;
    title: string;
    description?: string;
    priority: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
    isRanked: boolean;
    isArchived: boolean;
    parentDecision: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
    id: string;
}

// Layout interfaces
export interface PageLayoutProps {
    title: string;
    showBackButton?: boolean;
    onBackClick?: () => void;
    showNextButton?: boolean;
    onNextClick?: () => void;
    children: React.ReactNode;
}

export interface MainMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

// Update data interfaces
export interface UpdateCriterionData {
    title?: string;
    description?: string;
    priority?: 'UNSORTED' | 'MUST_HAVE' | 'SHOULD_HAVE' | 'COULD_HAVE';
}

export interface UpdateOptionData {
    title?: string;
    description?: string;
}

export interface UpdateDecisionData {
    title?: string;
    category?: string;
    scope?: string;
    type?: string;
}

export interface UseUpdateRankingsProps {
    decisionId: string;
    criterionId: string;
}
