import React from 'react';
import styled from 'styled-components';
import Button from './Button';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
    confirmDisabled?: boolean;
    cancelDisabled?: boolean;
}

const Overlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const DialogContainer = styled.div`
    background: var(--color-background-secondary);
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
`;

const DialogHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border-primary);
`;

const DialogTitle = styled.h2`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-tertiary);
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        color: var(--color-text-secondary);
    }

    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const DialogContent = styled.div`
    color: var(--color-text-secondary);
`;

const DialogFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    title,
    description,
    confirmText,
    onConfirm,
    confirmDisabled = false,
    cancelDisabled = false,
}) => {
    if (!isOpen) return null;

    // Capitalize the first letter of the title
    const capitalizedTitle = title && typeof title === 'string' ? title.charAt(0).toUpperCase() + title.slice(1) : title || '';

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <Overlay onClick={handleOverlayClick}>
            <DialogContainer>
                <DialogHeader>
                    {title && <DialogTitle>{capitalizedTitle}</DialogTitle>}
                    <CloseButton type="button" onClick={onClose} disabled={cancelDisabled} aria-disabled={cancelDisabled}>
                        &times;
                    </CloseButton>
                </DialogHeader>
                <DialogContent>
                    {description}
                </DialogContent>
                <DialogFooter>
                    <Button text="Cancel" onClick={onClose} size="small" disabled={cancelDisabled} />
                    <Button text={confirmText} onClick={onConfirm} size="small" disabled={confirmDisabled} />
                </DialogFooter>
            </DialogContainer>
        </Overlay>
    );
};

export default Dialog;
