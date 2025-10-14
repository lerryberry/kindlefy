import * as React from 'react';
import styled from 'styled-components';

// Form input props interface extending HTML input attributes
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file' | 'range' | 'checkbox' | 'radio' | 'submit' | 'reset' | 'button' | 'hidden' | undefined;
    label?: string;
    required?: boolean;
    placeholder?: string;
    value?: string | number | readonly string[];
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    disabled?: boolean;
    readOnly?: boolean;
    autoComplete?: 'on' | 'off' | 'name' | 'email' | 'username' | 'current-password' | 'new-password' | 'one-time-code' | 'tel' | 'url' | 'street-address' | 'postal-code' | 'country' | 'language' | 'bday' | 'sex' | 'organization' | 'organization-title' | 'cc-name' | 'cc-given-name' | 'cc-family-name' | 'cc-number' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-csc' | 'cc-type' | 'transaction-amount' | 'transaction-currency';
    autoFocus?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    size?: number;
    step?: number;
    min?: number | string;
    max?: number | string;
    multiple?: boolean;
    accept?: string;
    capture?: 'user' | 'environment';
    form?: string;
    formAction?: string;
    formEncType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
    formMethod?: 'get' | 'post';
    formNoValidate?: boolean;
    formTarget?: '_self' | '_blank' | '_parent' | '_top';
    list?: string;
    name?: string;
    id?: string;
    className?: string;
    style?: React.CSSProperties;
    componentType?: 'input' | 'textarea';
    rows?: number;
}

const FormInputContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
`;

const FormInputLabel = styled.label`
    font-weight: 500;
    color: var(--color-text-secondary);
    font-size: 0.875rem;
`;

const RequiredAsterisk = styled.span`
    color: var(--color-error);
    margin-left: 0.25rem;
`;

const StyledInput = styled.input`
    padding: 0.75rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--color-background-tertiary);
    transition: border-color 0.2s ease-in-out;
    
    @media (max-width: 768px) {
        font-size: 16px; /* Prevents zoom on iOS */
        padding: 0.875rem;
    }
    
    &::placeholder {
        color: var(--color-text-tertiary);
        opacity: 0.7;
    }
    
    &:hover {
        border-color: var(--color-border-secondary);
    }
    
    &:focus {
        outline: none;
        border-color: var(--color-brand-500);
        box-shadow: 0 0 0 3px var(--color-brand-100);
    }
    
    &:disabled {
        background-color: var(--color-background-secondary);
        cursor: not-allowed;
    }
`;

const StyledTextarea = styled.textarea`
    padding: 0.75rem;
    border: 1px solid transparent;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--color-background-tertiary);
    resize: vertical;
    min-height: 100px;
    transition: border-color 0.2s ease-in-out;
    
    @media (max-width: 768px) {
        font-size: 16px; /* Prevents zoom on iOS */
        padding: 0.875rem;
    }
    
    &::placeholder {
        color: var(--color-text-tertiary);
        opacity: 0.7;
    }
    
    &:hover {
        border-color: var(--color-border-secondary);
    }
    
    &:focus {
        outline: none;
        border-color: var(--color-brand-500);
        box-shadow: 0 0 0 3px var(--color-brand-100);
    }
    
    &:disabled {
        background-color: var(--color-background-secondary);
        cursor: not-allowed;
    }
`;

const FormInput: React.FC<FormInputProps> = ({
    type = 'text',
    label,
    id,
    name,
    required = false,
    placeholder,
    value,
    onChange,
    onBlur,
    onFocus,
    disabled = false,
    readOnly = false,
    autoComplete,
    autoFocus = false,
    maxLength,
    minLength,
    pattern,
    size,
    step,
    min,
    max,
    multiple = false,
    accept,
    capture,
    form,
    formAction,
    formEncType,
    formMethod,
    formNoValidate = false,
    formTarget,
    list,
    className,
    style,
    componentType = 'input',
    rows = 5,
    ...rest
}) => {
    const inputId = id || name || `form-input-${Math.random().toString(36).substr(2, 9)}`;

    const commonProps = {
        id: inputId,
        name,
        required,
        placeholder,
        value,
        onChange,
        onBlur,
        onFocus,
        disabled,
        readOnly,
        autoComplete,
        autoFocus,
        maxLength,
        minLength,
        style,
    };

    const inputSpecificProps = {
        pattern,
        size,
        step,
        min,
        max,
        multiple,
        accept,
        capture,
        form,
        formAction,
        formEncType,
        formMethod,
        formNoValidate,
        formTarget,
        list,
        ...rest,
    };

    if (componentType === 'textarea') {
        return (
            <FormInputContainer>
                {label && (
                    <FormInputLabel htmlFor={inputId}>
                        {label}
                        {required && <RequiredAsterisk>*</RequiredAsterisk>}
                    </FormInputLabel>
                )}
                <StyledTextarea
                    rows={rows}
                    {...commonProps}
                />
            </FormInputContainer>
        );
    }

    return (
        <FormInputContainer>
            {label && (
                <FormInputLabel htmlFor={inputId}>
                    {label}
                    {required && <RequiredAsterisk>*</RequiredAsterisk>}
                </FormInputLabel>
            )}
            <StyledInput
                type={type}
                {...commonProps}
                {...inputSpecificProps}
            />
        </FormInputContainer>
    );
};

export default FormInput;