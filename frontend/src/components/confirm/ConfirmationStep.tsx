import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import {
  useDigestsQuery,
  useDigestTimingsQuery,
  useGetDigestContentsQuery,
  useUpdateDigestEnabledMutation,
} from '../../hooks/useDigests';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { formatNewsScopeSummary } from '../../constants/newsScope';
import Button from '../util/Button';
import Toggle from '../util/Toggle';

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
  const { data: digests, isLoading: digestsLoading } = useDigestsQuery();
  const { data: timings, isLoading: timingsLoading } = useDigestTimingsQuery(digestId);
  const { mutateAsync: updateEnabled, isPending: isUpdatingEnabled } = useUpdateDigestEnabledMutation();
  const [enabled, setEnabled] = useState(true);

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

  const currentDigest = useMemo(() => {
    if (!digestId) return null;
    return (digests || []).find((d) => d._id === digestId) || null;
  }, [digestId, digests]);

  useEffect(() => {
    if (!currentDigest) return;
    setEnabled(currentDigest.enabled !== false);
  }, [currentDigest]);

  if (timingsLoading || contentsLoading || digestsLoading || !digestId) {
    return <Wrap />;
  }

  const schedule = selectedTiming?.schedule;
  const cadence = schedule?.frequency || 'daily';
  const time = schedule ? `${schedule.timeOfDay} ${schedule.timezone}` : 'your preferred time';
  const destinationCount = selectedTiming?.targetsCount ?? 0;
  const topicsText = topics.length > 0 ? topics.join(', ') : 'your chosen topics';
  const sectionSummary = (contents || [])
    .map((section, index) => {
      const scopeLabel = formatNewsScopeSummary(section.newsScope, section.locationText);
      const sectionTopics = (section.topics || []).filter(Boolean).slice(0, 3).join(', ') || 'no topics';
      return `Section ${index + 1}: ${scopeLabel}, ${sectionTopics}, ${section.length} words`;
    })
    .join('; ');
  const summaryText = [
    `Plan: ${contents?.length ?? 0} sections.`,
    sectionSummary || 'No section details yet.',
    `Delivery: ${cadence} at ${time} to ${destinationCount} destination${destinationCount === 1 ? '' : 's'}.`,
    `Overall topics: ${topicsText}.`,
  ].join(' ');

  return (
    <Wrap>
      <Title aria-hidden="true">{'\u{1F44D}'}</Title>
      <Summary>{summaryText}</Summary>
      <Toggle
        label="Enabled"
        checked={enabled}
        disabled={isUpdatingEnabled}
        onChange={async (nextValue) => {
          const prev = enabled;
          setEnabled(nextValue);
          try {
            await updateEnabled({ digestId, body: { enabled: nextValue } });
          } catch {
            setEnabled(prev);
            toast.error('Could not update digest status');
          }
        }}
      />
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

