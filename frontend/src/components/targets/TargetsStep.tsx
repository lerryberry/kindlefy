import styled from 'styled-components';
import TargetForm from './TargetForm';
import { useNavigate } from 'react-router-dom';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import { useDigestTimingsQuery } from '../../hooks/useDigests';
import Button from '../util/Button';

const Intro = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  max-width: 600px;
`;

const NextRow = styled.div`
  margin-top: 1.5rem;
`;

export default function TargetsStep() {
  const navigate = useNavigate();
  const { digestId, selectedTimingId } = useDigestWizard();
  const { data: timings } = useDigestTimingsQuery(digestId);

  const resolvedTimingId = selectedTimingId || timings?.[0]?.timingId || null;
  const selectedTiming = resolvedTimingId ? timings?.find((t) => t.timingId === resolvedTimingId) : null;

  const canGoNext = Boolean(selectedTiming && (selectedTiming.targetsCount ?? 0) > 0);

  return (
    <>
      <Intro>Add where digests should be delivered (your Kindle email).</Intro>
      <TargetForm />
      <NextRow>
        <Button
          type="button"
          text="Next"
          size="medium"
          isResponsive
          disabled={!canGoNext}
          onClick={() => navigate(`/${digestId}/approve-sender`)}
        />
      </NextRow>
    </>
  );
}
