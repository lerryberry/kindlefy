import * as React from 'react';

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
  return (
    <form
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
      {title && <h2 className="form-title">{title}</h2>}
      <div className="form-content">
        {children}
      </div>
    </form>
  );
};

export default Form;