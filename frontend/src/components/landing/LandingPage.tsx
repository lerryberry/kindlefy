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

const UseCaseSection = styled.div`
    margin: 2rem 0;
    text-align: left;
`;

const UseCaseTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin-bottom: 1rem;
`;

const UseCaseList = styled.ul`
    list-style: none;
    padding-left: 0;
    margin-bottom: 2rem;
    
    li {
        margin-bottom: 0.75rem;
        font-size: 1.125rem;
        line-height: 1.6;
        color: var(--color-text-secondary);
        padding-left: 1.5rem;
        position: relative;
        
        &:before {
            content: "•";
            color: var(--color-brand-500);
            font-weight: bold;
            position: absolute;
            left: 0;
        }
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

                <Subtitle>Krystallise your decision making</Subtitle>

                <Description>
                    <p>
                        Make better, more confident decisions with Krystallise, an innovative tool designed to help you navigate complex choices. Whether you're facing significant personal milestones or critical business decisions, Krystallise provides a structured framework to evaluate multiple options and arrive at the best possible choice.
                    </p>

                    <p>
                        Krystallise is ideal for situations that require careful consideration of various factors, such as:
                    </p>

                    <UseCaseSection>
                        <UseCaseTitle>Personal Decisions</UseCaseTitle>
                        <UseCaseList>
                            <li>From purchasing a new home or car to choosing a vacation destination, compare models, features, neighborhoods, and costs with confidence.</li>
                        </UseCaseList>
                    </UseCaseSection>

                    <UseCaseSection>
                        <UseCaseTitle>Work & Business</UseCaseTitle>
                        <UseCaseList>
                            <li>Streamline the process of selecting software, hiring new talent, or choosing a new office location by systematically evaluating vendors, candidates, and amenities against your key criteria.</li>
                        </UseCaseList>
                    </UseCaseSection>

                    <UseCaseSection>
                        <UseCaseTitle>Life Choices</UseCaseTitle>
                        <UseCaseList>
                            <li>Navigate major life changes, including career moves, educational paths, or investment opportunities, by objectively comparing different offers, programs, and financial strategies.</li>
                        </UseCaseList>
                    </UseCaseSection>

                    <p>
                        Krystallise empowers you to break down complex decisions by helping you identify the most important criteria, evaluate each option systematically, and receive a clear, data-driven ranking.
                    </p>
                </Description>

                <ButtonWrapper>
                    <Button size="large" onClick={handleGetStarted}>
                        Start Making Better Decisions
                    </Button>
                </ButtonWrapper>
            </ContentWrapper>
        </LandingContainer>
    );
};

export default LandingPage;
