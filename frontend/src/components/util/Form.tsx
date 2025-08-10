import * as React from 'react';
import type { FormProps } from '../../types';

const Form: React.FC<FormProps> = ({ title, children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit}>
      {title && <h2>{title}</h2>}
      {children}
    </form>
  );
};

export default Form;