import React from 'react';
import styled from 'styled-components';

export interface ToggleProps {
  label?: string;
  /** Accessible name when `label` is omitted */
  'aria-label'?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
}

const ToggleContainer = styled.label<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  user-select: none;
`;

const ToggleLabel = styled.span`
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.5;
`;

const THUMB = '1.375rem';
const THUMB_OFFSET = '3px';

const ToggleSwitch = styled.div<{ checked: boolean; disabled?: boolean }>`
  position: relative;
  width: 3.375rem;
  height: 1.75rem;
  border-radius: 9999px;
  background-color: ${props =>
    props.checked ? 'var(--color-brand-500)' : 'var(--color-background-tertiary)'};
  border: 1px solid
    ${props => (props.checked ? 'var(--color-brand-600)' : 'var(--color-border-primary)')};
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    border-color: ${props =>
      props.checked ? 'var(--color-brand-700)' : 'var(--color-border-secondary)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: ${props => (props.checked ? `calc(100% - ${THUMB} - ${THUMB_OFFSET})` : THUMB_OFFSET)};
    width: ${THUMB};
    height: ${THUMB};
    border-radius: 50%;
    background-color: #fff;
    transition: left 0.2s ease-in-out, transform 0.2s ease-in-out;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.22);
  }
`;

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
`;

const Toggle: React.FC<ToggleProps> = ({
  label,
  'aria-label': ariaLabel,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  name,
  id,
  className
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = event.target.checked;
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  return (
    <ToggleContainer disabled={disabled} className={className}>
      <HiddenInput
        type="checkbox"
        checked={currentChecked}
        defaultChecked={defaultChecked}
        onChange={handleChange}
        disabled={disabled}
        name={name}
        id={id}
        aria-label={ariaLabel}
      />
      <ToggleSwitch checked={currentChecked} disabled={disabled} />
      {label && <ToggleLabel>{label}</ToggleLabel>}
    </ToggleContainer>
  );
};

export default Toggle;

