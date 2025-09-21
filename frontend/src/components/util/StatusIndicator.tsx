import React from 'react';
import styled from 'styled-components';

interface StatusIndicatorProps {
    isComplete?: boolean;
    size?: 'small' | 'medium' | 'large';
    showMargin?: boolean;
}

const StyledStatusIndicator = styled.div<{ isComplete: boolean; size: 'small' | 'medium' | 'large'; showMargin: boolean }>`
    width: ${props => {
        switch (props.size) {
            case 'small': return '16px';
            case 'medium': return '20px';
            case 'large': return '24px';
            default: return '20px';
        }
    }};
    height: ${props => {
        switch (props.size) {
            case 'small': return '16px';
            case 'medium': return '20px';
            case 'large': return '24px';
            default: return '20px';
        }
    }};
    border-radius: 50%;
    background-color: ${props => props.isComplete ? 'var(--color-success)' : 'var(--color-error)'};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: ${props => {
        switch (props.size) {
            case 'small': return '9px';
            case 'medium': return '12px';
            case 'large': return '14px';
            default: return '12px';
        }
    }};
    font-weight: bold;
    color: var(--color-text-primary);
    margin-right: ${props => props.showMargin ? '0.5rem' : '0'};
    flex-shrink: 0;
    transition: background-color 0.2s ease;
    
    @media (max-width: 480px) {
        width: ${props => {
        switch (props.size) {
            case 'small': return '14px';
            case 'medium': return '16px';
            case 'large': return '20px';
            default: return '16px';
        }
    }};
        height: ${props => {
        switch (props.size) {
            case 'small': return '14px';
            case 'medium': return '16px';
            case 'large': return '20px';
            default: return '16px';
        }
    }};
        font-size: ${props => {
        switch (props.size) {
            case 'small': return '8px';
            case 'medium': return '9px';
            case 'large': return '11px';
            default: return '9px';
        }
    }};
    }
`;

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    isComplete = false,
    size = 'medium',
    showMargin = false
}) => {
    return (
        <StyledStatusIndicator
            isComplete={isComplete}
            size={size}
            showMargin={showMargin}
        >
            {isComplete ? '✓' : '✗'}
        </StyledStatusIndicator>
    );
};

export default StatusIndicator;
