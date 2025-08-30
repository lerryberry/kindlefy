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
}

const LayoutContainer = styled.div`
    padding: 1rem;
`;

const Header = styled.div`
    margin-bottom: 2rem;
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0 0 0;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
`;

const Content = styled.div`
    /* Content area styling can be customized as needed */
`;

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, addButtonText, onAddClick, showBackButton = false }) => {
    const navigate = useNavigate();
    return (
        <LayoutContainer>
            <Header>
                <TitleRow>
                    {showBackButton && (
                        <ArrowButton size="large" direction="back" onClick={() => navigate(-1)} />
                    )}
                    <Title>{title}</Title>
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
