import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../util/Button';

const LandingContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: var(--color-background-secondary);
    text-align: center;
`;

const ContentWrapper = styled.div`
    max-width: 800px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: 3rem;
    font-weight: 700;
    color: var(--color-text-primary);
    margin-bottom: 2rem;
    text-align: center;
`;

const Subtitle = styled.h2`
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    margin-bottom: 2rem;
    text-align: center;
`;

const Description = styled.div`
    font-size: 1.125rem;
    line-height: 1.7;
    color: var(--color-text-secondary);
    margin-bottom: 3rem;
    text-align: left;
`;

const StepList = styled.ol`
    text-align: left;
    margin: 2rem 0;
    padding-left: 1.5rem;
    
    li {
        margin-bottom: 1rem;
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
    }
`;

const ButtonWrapper = styled.div`
    margin-top: 3rem;
`;

const LandingPage = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/decisions');
    };

    return (
        <LandingContainer>
            <ContentWrapper>
                <Title>Welcome to Krystallise</Title>

                <Subtitle>Your Decision-Making Companion</Subtitle>

                <Description>
                    <p>
                        Krystallise is a powerful decision-making tool that helps you make informed choices
                        by breaking down complex decisions into manageable steps. Whether you're choosing
                        between job offers, deciding on a new home, or evaluating business opportunities,
                        Krystallise provides a structured approach to decision-making.
                    </p>

                    <h3>How it works:</h3>
                    <StepList>
                        <li>
                            <strong>Define your decision:</strong> Start by clearly stating what you need to decide on.
                            Give it a meaningful title and description to keep you focused.
                        </li>
                        <li>
                            <strong>Add criteria:</strong> Identify the factors that matter most to you. These could be
                            cost, quality, location, time, or any other relevant considerations. Assign priorities
                            to help weigh their importance.
                        </li>
                        <li>
                            <strong>Add options:</strong> List all the possible choices you're considering. Be thorough
                            and include all viable alternatives to ensure you don't miss the best option.
                        </li>
                        <li>
                            <strong>Rank options per criteria:</strong> For each criterion, rank your options from best
                            to worst. This step-by-step comparison helps you think through each aspect systematically.
                        </li>
                        <li>
                            <strong>Get your report:</strong> Review a comprehensive summary that shows your top-ranked
                            option along with detailed insights into how each option performed across all criteria.
                        </li>
                    </StepList>

                    <p>
                        By following this structured approach, you'll gain clarity on your decision and confidence
                        in your choice. Krystallise transforms complex decisions into clear, actionable insights.
                    </p>
                </Description>

                <ButtonWrapper>
                    <Button size="large" onClick={handleGetStarted}>
                        Get Started
                    </Button>
                </ButtonWrapper>
            </ContentWrapper>
        </LandingContainer>
    );
};

export default LandingPage;
