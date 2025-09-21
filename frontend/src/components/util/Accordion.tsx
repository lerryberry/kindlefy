import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';

interface AccordionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}

export interface AccordionRef {
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const AccordionContainer = styled.div`
    border-radius: 0.5rem;
    overflow: hidden;
    margin-bottom: 0.5rem;
`;

const AccordionHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background-color: var(--color-background-secondary);
    border-top: 1px solid var(--color-border-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background-color: var(--color-background-tertiary);
    }
`;

const AccordionTitle = styled.div`
    color: var(--color-text-primary);
    font-weight: 500;
    font-size: 1rem;
`;

const AccordionArrow = styled.span<{ isOpen: boolean }>`
    color: var(--color-text-primary);
    font-size: 1rem;
    transition: transform 0.2s ease;
    transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const AccordionContent = styled.div<{ isOpen: boolean }>`
    max-height: ${props => props.isOpen ? '1000px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
    background-color: var(--color-background-secondary);
    border-left: 1px solid var(--color-border-primary);
    border-right: 1px solid var(--color-border-primary);
    border-bottom: 1px solid var(--color-border-primary);
`;

const AccordionContentInner = styled.div`
    padding: 1rem;
`;

const Accordion = forwardRef<AccordionRef, AccordionProps>(({ title, children, defaultOpen = false, onToggle }, ref) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useImperativeHandle(ref, () => ({
        open: () => {
            setIsOpen(true);
            onToggle?.(true);
        },
        close: () => {
            setIsOpen(false);
            onToggle?.(false);
        },
        toggle: () => {
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            onToggle?.(newIsOpen);
        }
    }));

    const handleToggle = () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        onToggle?.(newIsOpen);
    };

    // Capitalize the first letter of the title
    const capitalizedTitle = title && typeof title === 'string' ? title.charAt(0).toUpperCase() + title.slice(1) : title;

    return (
        <AccordionContainer>
            <AccordionHeader onClick={handleToggle}>
                <AccordionTitle>{capitalizedTitle}</AccordionTitle>
                <AccordionArrow isOpen={isOpen}>
                    ⌃
                </AccordionArrow>
            </AccordionHeader>
            <AccordionContent isOpen={isOpen}>
                <AccordionContentInner>
                    {children}
                </AccordionContentInner>
            </AccordionContent>
        </AccordionContainer>
    );
});

Accordion.displayName = 'Accordion';

export default Accordion;
