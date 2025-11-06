import React from 'react';
import styled from 'styled-components';

export interface ToggleProps {
  label?: string;
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
  gap: 0.4rem;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.6 : 1};
  user-select: none;
`;

const ToggleLabel = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.5;
`;

const ToggleSwitch = styled.div<{ checked: boolean; disabled?: boolean }>`
  position: relative;
  width: 2rem;
  height: 1rem;
  border-radius: 9999px;
  background-color: ${props =>
    props.checked
      ? 'var(--color-success)'
      : 'var(--color-background-tertiary)'
  };
  border: 1px solid ${props =>
    props.checked
      ? 'var(--color-success)'
      : 'var(--color-border-primary)'
  };
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  
  &:hover:not(:disabled) {
    border-color: ${props =>
    props.checked
      ? 'var(--color-success)'
      : 'var(--color-border-secondary)'
  };
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 1px;
    left: ${props => props.checked ? 'calc(100% - 0.875rem)' : '1px'};
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 50%;
    background-color: var(--color-text-inverse);
    transition: all 0.2s ease-in-out;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
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
      />
      <ToggleSwitch checked={currentChecked} disabled={disabled} />
      {label && <ToggleLabel>{label}</ToggleLabel>}
    </ToggleContainer>
  );
};

export default Toggle;

