import React from 'react';
import styled from 'styled-components';
import Button from '../util/Button';
import ArrowButton from '../util/ArrowButton';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
    addButtonText?: string;
    onAddClick?: () => void;
    showBackButton?: boolean;
    onBackClick?: () => void;
}

const LayoutContainer = styled.div`
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
`;

const Header = styled.div`
    margin-bottom: 2rem;
`;

const BackButtonRow = styled.div`
    margin: 1rem 0 0.5rem 0;
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0.5rem 0 0 0;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
`;

const Content = styled.div`
    /* Content area styling can be customized as needed */
`;

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, addButtonText, onAddClick, showBackButton = false, onBackClick }) => {
    const navigate = useNavigate();

    // Capitalize the first letter of the title
    const capitalizedTitle = title && typeof title === 'string' ? title.charAt(0).toUpperCase() + title.slice(1) : title;

    return (
        <LayoutContainer>
            <Header>
                {showBackButton && (
                    <BackButtonRow>
                        <ArrowButton size="large" direction="back" onClick={onBackClick || (() => navigate(-1))} />
                    </BackButtonRow>
                )}
                <TitleRow>
                    <Title>{capitalizedTitle}</Title>
                    {addButtonText && onAddClick && (
                        <Button
                            text={addButtonText}
                            onClick={onAddClick}
                            size="small"
                        />
                    )}
                </TitleRow>
            </Header>
            <Content>
                {children}
            </Content>
        </LayoutContainer>
    );
};

export default PageLayout;
