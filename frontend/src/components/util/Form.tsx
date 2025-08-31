import React from 'react';
import styled from 'styled-components';

// Form props interface extending HTML form attributes
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  children: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
  action?: string;
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  target?: '_self' | '_blank' | '_parent' | '_top';
  noValidate?: boolean;
}

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  min-width: 100px;
  margin: 0 auto;
  padding: 1.5rem;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1rem;
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
  gap: 1rem;
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