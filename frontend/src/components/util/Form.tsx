import React from 'react';

interface FormProps {
    title?: string;
    children: any;
    onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

const Form: React.FC<FormProps> = ({ title, children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
        {title && <h2>{title}</h2>}
        {children}
    </form>
  );
};

export default Form;