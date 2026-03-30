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

const FormContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
`;

const Form: React.FC<FormProps> = ({
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
      <FormContent>
        {children}
      </FormContent>
    </StyledForm>
  );
};

export default Form;