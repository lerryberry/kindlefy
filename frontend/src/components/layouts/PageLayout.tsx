import React from 'react';
import styled from 'styled-components';
import Button from '../util/Button';
import ArrowButton from '../util/ArrowButton';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
    showBackButton?: boolean;
    onBackClick?: () => void;
    showNextButton?: boolean;
    nextButtonText?: string;
    onNextClick?: () => void;
    showAddButton?: boolean;
    addButtonText?: string;
    onAddClick?: () => void;
}

const LayoutContainer = styled.div`
    padding: 1rem;
`;

const Header = styled.div`
    margin-bottom: 2rem;
`;

const TitleRow = styled.div`
    margin: 0.5rem 0 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const BottomButtonRow = styled.div`
    margin: 2rem 0 0 0;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
`;

const Content = styled.div`
    /* Content area styling can be customized as needed */
`;

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, showBackButton = false, onBackClick, showNextButton = false, nextButtonText = "Next", onNextClick, showAddButton = false, addButtonText = "Add", onAddClick }) => {
    const navigate = useNavigate();

    // Capitalize the first letter of the title
    const capitalizedTitle = title && typeof title === 'string' ? title.charAt(0).toUpperCase() + title.slice(1) : title;

    return (
        <LayoutContainer className="container">
            <div className="container-content">
                <Header>
                    <TitleRow>
                        <Title>{capitalizedTitle}</Title>
                        {showAddButton && onAddClick && (
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
                {(showBackButton || showNextButton) && (
                    <BottomButtonRow>
                        {showBackButton && (
                            <ArrowButton size="large" direction="back" onClick={onBackClick || (() => navigate(-1))} />
                        )}
                        {showNextButton && onNextClick && (
                            <Button
                                text={nextButtonText}
                                onClick={onNextClick}
                                size="medium"
                                isResponsive
                            />
                        )}
                    </BottomButtonRow>
                )}
            </div>
        </LayoutContainer>
    );
};

export default PageLayout;
