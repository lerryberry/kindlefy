import React, { useState } from 'react';
import styled from 'styled-components';

interface TabProps {
    name: string;
    children: React.ReactNode;
}

interface TabsProps {
    children: React.ReactNode;
    defaultActiveTab?: number;
}

const TabsContainer = styled.div`
    width: 100%;
`;

const TabList = styled.div`
    display: flex;
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 1rem;
`;

const TabButton = styled.button<{ isActive: boolean }>`
    background: none;
    border: none;
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: ${props => props.isActive ? '#374151' : '#6b7280'};
    border-bottom: 2px solid ${props => props.isActive ? '#3b82f6' : 'transparent'};
    transition: border-bottom 0.2s ease;
    
    &:hover {
        color: #374151;
    }
`;

const TabContent = styled.div`
    padding: 1rem 0;
`;

export const Tab: React.FC<TabProps> = ({ children }) => {
    return <>{children}</>;
};

const Tabs: React.FC<TabsProps> = ({ children, defaultActiveTab = 0 }) => {
    const tabChildren = React.Children.toArray(children).filter(
        child => React.isValidElement(child) && child.type === Tab
    ) as React.ReactElement<TabProps>[];

    // Limit to 5 tabs
    const limitedTabs = tabChildren.slice(0, 5);

    const [activeTab, setActiveTab] = useState(defaultActiveTab);

    const handleTabClick = (index: number) => {
        setActiveTab(index);
    };

    const activeTabContent = limitedTabs[activeTab]?.props.children;

    return (
        <TabsContainer>
            <TabList>
                {limitedTabs.map((tab, index) => (
                    <TabButton
                        key={index}
                        isActive={activeTab === index}
                        onClick={() => handleTabClick(index)}
                    >
                        {tab.props.name}
                    </TabButton>
                ))}
            </TabList>
            <TabContent>
                {activeTabContent}
            </TabContent>
        </TabsContainer>
    );
};

export default Tabs;
