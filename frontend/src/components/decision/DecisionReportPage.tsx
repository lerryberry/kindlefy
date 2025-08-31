import React from 'react';
import styled, { css } from 'styled-components';
import { useParams } from 'react-router-dom';
import PageLayout from '../layouts/PageLayout';
import { useGetDecisionReport } from './useGetDecisionReport';
import Chip from '../util/Chip';

const OptionsGrid = styled.div`
  display: flex; /* Use flexbox for a single column */
  flex-direction: column; /* Arrange items vertically */
  align-items: center; /* Center items horizontally */
  margin-top: 2rem;
`;

const OptionBox = styled.div<{ isTopOption: boolean }>`
  background-color: var(--color-background-secondary);
  /* Removed full border */
  border-radius: 0.5rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 450px; /* Default width for non-top options (25% smaller than 600px) */
  /* text-align: center; No longer needed for overall box due to flex layout */
  box-shadow: none;
  transition: none;
  border-top: 1px solid var(--color-border-primary); /* Top border only, using global border color */
  margin: 0.5rem 0;

  h2 {
    margin-top: 0;
    margin-bottom: 0.75rem;
    color: var(--color-text-primary); /* Using global text color */
    display: flex;
    align-items: center;
    justify-content: flex-start; /* Title left aligned */
    gap: 0.5rem;
    text-align: left; /* Align title text to the left within h2 */
  }

  /* Removed score div entirely */

  span {
    color: var(--color-text-primary); /* Using global text color */
    display: flex;
    justify-content: flex-start; /* Tags left aligned */
    margin-top: 0.5rem;
  }

  ${props => props.isTopOption && css`
    max-width: 600px; /* Top option uses full available width */
    margin-bottom: 2rem; /* Add some space below the top option */
  `}
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start; /* Left align chips */
  gap: 0.5rem;
  margin-top: 0.5rem;
`;



const DecisionReportPage: React.FC = () => {
    const { decisionId } = useParams<{ decisionId: string }>();
    const { data, isLoading, error } = useGetDecisionReport(decisionId || '');

    if (!decisionId) {
        return <PageLayout title="Error"><div>Decision ID is required</div></PageLayout>;
    }

    if (isLoading) return <PageLayout title="Loading Report..."><div>Loading decision report...</div></PageLayout>;
    if (error) return <PageLayout title="Error"><div>Error: {error.message}</div></PageLayout>;
    if (!data?.data || data.data.length === 0) return <PageLayout title="No Report Data"><div>No report data found for this decision.</div></PageLayout>;

    return (
        <PageLayout
            title="Decision Report"
        >
            <OptionsGrid>
                {data.data.map((option, index) => {
                    const isTopOption = index === 0;
                    return (
                        <OptionBox key={option._id} isTopOption={isTopOption}>
                            <h2>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {isTopOption && <span>⭐️</span>}
                                    {option.title}
                                </span>
                            </h2>
                            {option.tags && option.tags.length > 0 && (
                                <TagsContainer>
                                    {option.tags.map((tag) => (
                                        <Chip key={tag} variant="tag">{tag}</Chip>
                                    ))}
                                </TagsContainer>
                            )}
                        </OptionBox>
                    );
                })}
            </OptionsGrid>
        </PageLayout>
    );
};

export default DecisionReportPage;
