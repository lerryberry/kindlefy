import styled from 'styled-components';
import TargetForm from './TargetForm';

const Intro = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  max-width: 600px;
`;

export default function TargetsStep() {
  return (
    <>
      <Intro>Add where digests should be delivered (your Kindle email).</Intro>
      <TargetForm />
    </>
  );
}
