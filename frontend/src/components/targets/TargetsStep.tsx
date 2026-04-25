import styled from 'styled-components';
import TargetForm from './TargetForm';
import { useNavigate } from 'react-router-dom';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import { useDigestTimingsQuery } from '../../hooks/useDigests';
import Button from '../util/Button';

const NextRow = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;
`;

export default function TargetsStep() {
  const navigate = useNavigate();
  const { digestId, selectedTimingId } = useDigestWizard();
  const { data: timingsData } = useDigestTimingsQuery(digestId);
  const timings = timingsData?.timings;

  const resolvedTimingId = selectedTimingId || timings?.[0]?.timingId || null;
  const selectedTiming = resolvedTimingId ? timings?.find((t) => t.timingId === resolvedTimingId) : null;

  const canGoNext = Boolean(selectedTiming && (selectedTiming.targetsCount ?? 0) > 0);

  return (
    <>
      <TargetForm />
      <NextRow>
        <Button
          type="button"
          text="Next"
          size="large"
          fullWidth
          disabled={!canGoNext}
          onClick={() => navigate(`/${digestId}/approve-sender`)}
        />
      </NextRow>
    </>
  );
}
