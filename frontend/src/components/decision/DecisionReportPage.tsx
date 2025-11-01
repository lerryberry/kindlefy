import React from 'react';
import styled, { css } from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import PageLayout from '../layouts/PageLayout';
import { useGetDecisionReport } from './useGetDecisionReport';
import { useGetDecision } from './useGetDecision';
import { useSelectWinner } from './useSelectWinner';
import Chip from '../util/Chip';
import EmptyState from '../util/EmptyState';
import Loading from '../util/Loading';

const OptionsGrid = styled.div`
  display: flex; /* Use flexbox for a single column */
  flex-direction: column; /* Arrange items vertically */
  align-items: center; /* Center items horizontally */
  margin-top: 2rem;
`;

const OptionBox = styled.label<{ isTopOption: boolean; isSelected: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  border: 2px solid ${props =>
    props.isSelected
      ? 'var(--color-brand-500)'
      : 'var(--color-border-primary)'
  };
  border-radius: 8px;
  background-color: ${props =>
    props.isSelected
      ? 'var(--color-brand-50)'
      : 'var(--color-background-primary)'
  };
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  max-width: 450px;
  margin: 0.5rem 0;
  
  &:hover {
    border-color: ${props =>
    props.isSelected
      ? 'var(--color-brand-600)'
      : 'var(--color-brand-400)'
  };
    background-color: ${props =>
    props.isSelected
      ? 'var(--color-brand-100)'
      : 'var(--color-background-secondary)'
  };
  }
  
  &:focus-within {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }

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

const RadioInput = styled.input`
  margin: 0;
  width: 1.25rem;
  height: 1.25rem;
  accent-color: var(--color-brand-500);
  cursor: pointer;
  display: flex;
  align-self: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
  border: 2px solid white;
  border-radius: 50%;
  background-color: transparent;
  
  &:checked:not(:disabled) {
    appearance: none;
    background-color: var(--color-brand-500);
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 0.5rem;
      height: 0.5rem;
      background-color: white;
      border-radius: 50%;
    }
  }
  
  &:hover:not(:disabled) {
    border-color: var(--color-brand-400);
  }
  
  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }
`;

const Form = styled.form`
  width: 100%;
  max-width: 600px;
`;

const IncompleteStepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1rem;
  padding: 2rem;
`;

const IncompleteStepsText = styled.p`
  color: var(--color-text-primary);
  margin: 0;
`;

const StepLinksContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 0.5rem;
`;

const StepLink = styled.button`
  background: none;
  border: none;
  color: var(--color-brand-500);
  padding: 0;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-brand-600);
    text-decoration: underline;
  }
  
  &:focus {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    border-radius: 2px;
  }
`;



const DecisionReportPage: React.FC = () => {
  const { decisionId } = useParams<{ decisionId: string }>();
  const navigate = useNavigate();
  const { decision, isLoading: isLoadingDecision } = useGetDecision(decisionId);
  const status = decision?.data?.status;

  // Check if all prerequisites are met
  const allStepsComplete = status?.hasOptions && status?.hasCriteria && status?.isFullyRanked;

  // Only fetch report if all steps are complete
  const { data, isLoading: isLoadingReport, error } = useGetDecisionReport(decisionId || '', !!allStepsComplete);
  const selectWinnerMutation = useSelectWinner(decisionId || '');

  const handleOptionChange = (optionId: string) => {
    selectWinnerMutation.mutate(optionId);
  };

  if (!decisionId) {
    return <PageLayout title="Error"><div>Decision ID is required</div></PageLayout>;
  }

  // Loading decision status
  if (isLoadingDecision) {
    return (
      <PageLayout title="Select Winner" showBackButton={true} onBackClick={() => navigate(`/decisions/${decisionId}`)}>
        <Loading />
      </PageLayout>
    );
  }

  // Check if decision exists
  if (!decision?.data) {
    return (
      <PageLayout title="Error" showBackButton={true} onBackClick={() => navigate(`/decisions/${decisionId}`)}>
        <div>Decision not found</div>
      </PageLayout>
    );
  }

  // Show message if prerequisites not met
  if (!allStepsComplete) {
    const incompleteSteps: Array<{ label: string; path: string }> = [];
    if (!status?.hasOptions) incompleteSteps.push({ label: 'Add Options', path: `/decisions/${decisionId}/options` });
    if (!status?.hasCriteria) incompleteSteps.push({ label: 'Add Criteria', path: `/decisions/${decisionId}/criteria` });
    if (!status?.isFullyRanked) incompleteSteps.push({ label: 'Rank Options', path: `/decisions/${decisionId}/ranking` });

    return (
      <PageLayout
        title="Select Winner"
        showBackButton={true}
        onBackClick={() => navigate(`/decisions/${decisionId}`)}
      >
        <IncompleteStepsContainer>
          <IncompleteStepsText>
            Please complete all previous steps before making a decision.
          </IncompleteStepsText>
          <div>
            <IncompleteStepsText style={{ marginBottom: '1rem' }}>
              Missing steps:
            </IncompleteStepsText>
            <StepLinksContainer>
              {incompleteSteps.map((step) => (
                <StepLink
                  key={step.path}
                  onClick={() => navigate(step.path)}
                >
                  {step.label}
                </StepLink>
              ))}
            </StepLinksContainer>
          </div>
        </IncompleteStepsContainer>
      </PageLayout>
    );
  }

  // Loading report
  if (isLoadingReport) {
    return (
      <PageLayout title="Select Winner" showBackButton={true} onBackClick={() => navigate(`/decisions/${decisionId}`)}>
        <Loading />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Error" showBackButton={true} onBackClick={() => navigate(`/decisions/${decisionId}`)}>
        <div>Error: {error.message}</div>
      </PageLayout>
    );
  }

  // Show empty state if no options to decide between
  if (!data?.data?.options || data.data.options.length === 0) {
    return (
      <PageLayout
        title="Select Winner"
        showBackButton={true}
        onBackClick={() => navigate(`/decisions/${decisionId}`)}
      >
        <EmptyState
          text="No options found to decide between. Add options to make a decision."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Select Winner"
      showBackButton={true}
      onBackClick={() => navigate(`/decisions/${decisionId}`)}
    >
      <Form>
        <OptionsGrid>
          {data.data.options
            .sort((a, b) => b.grandTotalCriteriaScore - a.grandTotalCriteriaScore) // Sort by score descending to maintain consistent order
            .map((option, index) => {
              const isTopOption = index === 0;
              return (
                <OptionBox
                  key={option._id}
                  isTopOption={isTopOption}
                  isSelected={option.isWinner}
                  htmlFor={`option-${option._id}`}
                >
                  <RadioInput
                    type="radio"
                    id={`option-${option._id}`}
                    name="winner"
                    value={option._id}
                    defaultChecked={option.isWinner}
                    onChange={() => handleOptionChange(option._id)}
                    disabled={selectWinnerMutation.isPending}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between', width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isTopOption && <span style={{ marginTop: 0 }}>🏆</span>}
                        <h2 style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
                          {option.title}
                        </h2>
                      </div>
                      {option.similarityToBestTheoreticallyPossibleScore !== undefined && (
                        <>
                          <span
                            data-tooltip-id={`similarity-tooltip-${option._id}`}
                            data-tooltip-content="similarity to best possible option"
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: 'var(--color-text-secondary)',
                              marginLeft: 'auto',
                              cursor: 'help'
                            }}
                          >
                            {option.similarityToBestTheoreticallyPossibleScore.toFixed(0)}%
                          </span>
                          <Tooltip id={`similarity-tooltip-${option._id}`} />
                        </>
                      )}
                    </div>
                    {option.tags && option.tags.length > 0 && (
                      <TagsContainer>
                        {option.tags.map((tag) => (
                          <Chip key={tag} variant="ghost" size="small" type="default">{tag}</Chip>
                        ))}
                      </TagsContainer>
                    )}
                  </div>
                </OptionBox>
              );
            })}
        </OptionsGrid>
      </Form>
    </PageLayout>
  );
};

export default DecisionReportPage;
