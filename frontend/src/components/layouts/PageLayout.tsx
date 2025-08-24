import React from 'react';
import styled from 'styled-components';
import BackButton from '../util/BackButton';

interface PageLayoutProps {
    title: string;
    children: React.ReactNode;
}

const LayoutContainer = styled.div`
    padding: 1rem;
`;

const Header = styled.div`
    margin-bottom: 2rem;
`;

const Title = styled.h1`
    margin: 1rem 0 0 0;
    font-size: 1.5rem;
    font-weight: 600;
`;

const Content = styled.div`
    /* Content area styling can be customized as needed */
`;

const PageLayout: React.FC<PageLayoutProps> = ({ title, children }) => {
    return (
        <LayoutContainer>
            <Header>
                <BackButton />
                <Title>{title}</Title>
            </Header>
            <Content>
                {children}
            </Content>
        </LayoutContainer>
    );
};

export default PageLayout;
