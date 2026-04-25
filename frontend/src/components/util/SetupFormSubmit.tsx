import React from 'react';
import styled from 'styled-components';
import Button from './Button';

const SubmitRow = styled.div`
  margin-top: 1rem;
  width: 100%;
`;

export interface SetupFormSubmitProps
  extends Omit<React.ComponentProps<typeof Button>, 'type' | 'size' | 'text' | 'isResponsive'> {
  pending?: boolean;
  label: string;
}

export default function SetupFormSubmit({
  pending = false,
  label,
  disabled,
  ...rest
}: SetupFormSubmitProps) {
  return (
    <SubmitRow>
      <Button
        type="submit"
        size="large"
        fullWidth
        disabled={Boolean(disabled || pending)}
        text={pending ? 'Saving…' : label}
        {...rest}
      />
    </SubmitRow>
  );
}
