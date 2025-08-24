import React from 'react';
import styled from 'styled-components';
import BackButton from '../util/BackButton';
import Button from '../util/Button';

interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
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

const PageLayout: React.FC<PageLayoutProps> = ({ title, children, addButtonText, onAddClick }) => {
    return (
        <LayoutContainer>
            <Header>
                <BackButton />
                <TitleRow>
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
