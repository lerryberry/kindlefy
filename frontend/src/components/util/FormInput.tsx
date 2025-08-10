import * as React from 'react';
import type { FormInputProps } from '../../types';

const FormInput: React.FC<FormInputProps> = ({
    type = 'text',
    label,
    name,
    placeholder,
    required = false,
    disabled = false,
    error,
    value,
    onChange,
    ...rest
}) => {
    return (
        <div>
            {label && <label htmlFor={name}>{label}</label>}
            <input
                id={name}
                type={type}
                name={name}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                value={value}
                onChange={onChange}
                {...rest}
            />
            {error && <span className="error">{error}</span>}
        </div>
    );
};

export default FormInput;