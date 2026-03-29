import styled from 'styled-components';
import TimingForm from './TimingForm';

const Intro = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  max-width: 600px;
`;

export default function ScheduleStep() {
  return (
    <>
      <Intro>Set when your digest runs. This creates or updates the delivery plan for your selected prompt.</Intro>
      <TimingForm />
    </>
  );
}
