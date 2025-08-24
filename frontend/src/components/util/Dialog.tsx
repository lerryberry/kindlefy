import React from 'react';
import styled from 'styled-components';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
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
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const DialogHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
`;

const DialogTitle = styled.h2`
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
        color: #374151;
    }
`;

const DialogContent = styled.div`
    color: #374151;
`;

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <Overlay onClick={handleOverlayClick}>
            <DialogContainer>
                <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                    <CloseButton onClick={onClose}>&times;</CloseButton>
                </DialogHeader>
                <DialogContent>
                    {children}
                </DialogContent>
            </DialogContainer>
        </Overlay>
    );
};

export default Dialog;
