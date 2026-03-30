import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import { useDigestTimingsQuery, useGetDigestContentsQuery } from '../../hooks/useDigests';
import styled from 'styled-components';
import Button from '../util/Button';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1;
`;

const Summary = styled.p`
  margin: 0;
  color: var(--color-text-primary);
  line-height: 1.5;
`;

export default function ConfirmationStep() {
  const navigate = useNavigate();
  const { digestId, selectedTimingId } = useDigestWizard();
  const { data: timings, isLoading: timingsLoading } = useDigestTimingsQuery(digestId);

  const resolvedTimingId = useMemo(() => {
    return selectedTimingId || timings?.[0]?.timingId || null;
  }, [selectedTimingId, timings]);

  const selectedTiming = useMemo(() => {
    if (!resolvedTimingId || !timings) return null;
    return timings.find((t) => t.timingId === resolvedTimingId) ?? null;
  }, [resolvedTimingId, timings]);

  const { data: contents, isLoading: contentsLoading } = useGetDigestContentsQuery(digestId);

  const topics = useMemo(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const c of contents || []) {
      for (const t of c.topics || []) {
        if (!seen.has(t)) {
          seen.add(t);
          out.push(t);
        }
      }
    }
    return out;
  }, [contents]);

  if (timingsLoading || contentsLoading || !digestId) {
    return <Wrap />;
  }

  const schedule = selectedTiming?.schedule;
  const cadence = schedule?.frequency || 'daily';
  const time = schedule ? `${schedule.timeOfDay} ${schedule.timezone}` : 'your preferred time';
  const topicsText = topics.length > 0 ? topics.join(', ') : 'your chosen topics';

  return (
    <Wrap>
      <Title aria-hidden="true">{'\u{1F44D}'}</Title>
      <Summary>
        You're all set to receive a digest {cadence} and {time}, about; {topicsText}
      </Summary>
      <Button
        type="button"
        text="Back to digests"
        size="medium"
        isResponsive
        onClick={() => navigate('/')}
      />
    </Wrap>
  );
}

