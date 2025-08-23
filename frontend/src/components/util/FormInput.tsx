import * as React from 'react';

// Form input props interface extending HTML input attributes
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'color' | 'file' | 'range' | 'checkbox' | 'radio' | 'submit' | 'reset' | 'button' | 'hidden';
    label?: string;
    required?: boolean;
    placeholder?: string;
    value?: string | number | readonly string[];
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
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
}

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
    ...rest
}) => {
    const inputId = id || name || `form-input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="form-input-container">
            {label && (
                <label htmlFor={inputId} className="form-input-label">
                    {label}
                    {required && <span className="required-asterisk">*</span>}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                name={name}
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                disabled={disabled}
                readOnly={readOnly}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                maxLength={maxLength}
                minLength={minLength}
                pattern={pattern}
                size={size}
                step={step}
                min={min}
                max={max}
                multiple={multiple}
                accept={accept}
                capture={capture}
                form={form}
                formAction={formAction}
                formEncType={formEncType}
                formMethod={formMethod}
                formNoValidate={formNoValidate}
                formTarget={formTarget}
                list={list}
                className={`form-input ${className || ''}`}
                style={style}
                {...rest}
            />
        </div>
    );
};

export default FormInput;