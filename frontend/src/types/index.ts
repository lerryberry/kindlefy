// API Response Types
export interface ApiResponse<T> {
    status: 'success' | 'error';
    data: T;
    message?: string;
}

// Decision Types
export interface Decision {
    _id: string;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    isArchived: boolean;
    accessControl: AccessControl[];
    parentDecision?: string;
}

export interface CreateDecisionRequest {
    title: string;
    description?: string;
}

export interface UpdateDecisionRequest {
    title?: string;
    description?: string;
    isArchived?: boolean;
}

// Criteria Types
export interface Criteria {
    _id: string;
    title: string;
    description?: string;
    weight?: number;
    parentDecision: string;
    isArchived: boolean;
    accessControl: AccessControl[];
}

export interface CreateCriteriaRequest {
    title: string;
    description?: string;
    weight?: number;
}

// Options Types
export interface Option {
    _id: string;
    title: string;
    description?: string;
    parentDecision: string;
    isArchived: boolean;
    accessControl: AccessControl[];
}

export interface CreateOptionRequest {
    title: string;
    description?: string;
}

// Rankings Types
export interface Ranking {
    _id: string;
    criteriaId: string;
    optionId: string;
    parentDecision: string;
    userId: string;
    score: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRankingRequest {
    criteriaId: string;
    optionId: string;
    score: number;
}

// Access Control Types
export interface AccessControl {
    userId: string;
    permissions: Permission[];
}

export type Permission = 'READ' | 'UPDATE' | 'DELETE' | 'RANK';

// User Types
export interface User {
    _id: string;
    email: string;
    name?: string;
    picture?: string;
    sub: string; // Auth0 user ID
}

// Auth0 Types
export interface Auth0User {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
    email_verified: boolean;
}

// Form Types
export interface FormData {
    title: string;
    description?: string;
    data?: string;
}

// Component Props Types
export interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    text?: string;
    disabled?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary' | 'danger';
    onClick?: () => void;
    children?: React.ReactNode;
}

export interface FormProps {
    title?: string;
    children: React.ReactNode;
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export interface FormInputProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'textarea';
    label?: string;
    name: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface DecisionListItemProps {
    decisionObject: Decision;
}

// API Error Types
export interface ApiError {
    status: 'error';
    message: string;
    statusCode?: number;
}

// Query Hook Return Types - these match React Query's actual return types
export type QueryResult<T> = import('@tanstack/react-query').UseQueryResult<T, Error>;

export type MutationResult<T, V> = import('@tanstack/react-query').UseMutationResult<T, Error, V, unknown>;

// Route Types
export interface RouteParams {
    decisionId?: string;
    criteriaId?: string;
    optionId?: string;
}

// Toast Types
export interface ToastOptions {
    duration?: number;
    position?: 'top-center' | 'top-right' | 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-left';
}

// Styled Components Theme
export interface Theme {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        danger: string;
        warning: string;
        info: string;
        light: string;
        dark: string;
        white: string;
        black: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
    };
    typography: {
        fontFamily: string;
        fontSize: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
    };
}
