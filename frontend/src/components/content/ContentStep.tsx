import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CreatePromptForm from './CreatePromptForm';
import { useSetupWizard } from '../../hooks/useSetupWizard';

const Intro = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  max-width: 600px;
`;

export default function ContentStep() {
  const navigate = useNavigate();
  const { promptId, setPromptId } = useSetupWizard();

  return (
    <>
      <Intro>
        Define what goes into your digest. Next you’ll set when it’s delivered.
      </Intro>
      <CreatePromptForm
        activePromptId={promptId}
        onCreated={(id) => {
          setPromptId(id);
          navigate('/schedule');
        }}
      />
    </>
  );
}
