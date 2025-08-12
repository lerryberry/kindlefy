import * as React from 'react';

interface FormInputProps {
    type?: string;
    label?: string;
}

const FormInput: React.FC<FormInputProps> = ({ type, label, ...rest }) => {
    return (
        <>
            <label>{label}</label>
            <input type={type} {...rest}></input>
        </>
    );
};

export default FormInput;