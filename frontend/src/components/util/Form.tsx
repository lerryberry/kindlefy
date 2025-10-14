import React from 'react';
import styled from 'styled-components';
import type { FormProps } from '../../types/components';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  min-width: 100px;
  margin: 0 auto;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const FormTitle = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
`;

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const Form: React.FC<FormProps> = ({
  title,
  children,
  onSubmit,
  method = 'post',
  action,
  encType,
  target,
  noValidate = false,
  className,
  style,
  ...rest
}) => {
  // Capitalize the first letter of the title
  const capitalizedTitle = title && typeof title === 'string' ? title.charAt(0).toUpperCase() + title.slice(1) : title || '';

  return (
    <StyledForm
      onSubmit={onSubmit}
      method={method}
      action={action}
      encType={encType}
      target={target}
      noValidate={noValidate}
      className={`form-component ${className || ''}`}
      style={style}
      {...rest}
    >
      {title && <FormTitle>{capitalizedTitle}</FormTitle>}
      <FormContent>
        {children}
      </FormContent>
    </StyledForm>
  );
};

export default Form;