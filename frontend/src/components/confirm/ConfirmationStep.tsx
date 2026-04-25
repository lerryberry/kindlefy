import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import {
  useDigestsQuery,
  useDigestTimingsQuery,
  useDigestTimingTargetsQuery,
  useGetDigestContentsQuery,
  useUpdateDigestEnabledMutation,
} from '../../hooks/useDigests';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { digestTagline } from '../../utils/digestTagline';
import type { DigestListItem } from '../../types/digest';
import { canEnableDigest, missingEnableRequirements } from '../../utils/digestEligibility';
import type { EnableRequirement } from '../../utils/digestEligibility';
import { CannotEnableDigestDialog } from '../digest/DigestPolicyDialogs';
import Button from '../util/Button';
import Toggle from '../util/Toggle';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Summary = styled.p`
  margin: 0;
  color: var(--color-text-primary);
  line-height: 1.55;
  white-space: pre-line;
`;

export default function ConfirmationStep() {
  const navigate = useNavigate();
  const { digestId, selectedTimingId } = useDigestWizard();
  const { data: digests, isLoading: digestsLoading } = useDigestsQuery();
  const { data: timingsData, isLoading: timingsLoading } = useDigestTimingsQuery(digestId);
  const timings = timingsData?.timings;
  const { mutateAsync: updateEnabled, isPending: isUpdatingEnabled } = useUpdateDigestEnabledMutation();
  const [enabled, setEnabled] = useState(false);
  const [cannotEnableMissing, setCannotEnableMissing] = useState<EnableRequirement[] | null>(null);

  const resolvedTimingId = useMemo(() => {
    return selectedTimingId || timings?.[0]?.timingId || null;
  }, [selectedTimingId, timings]);

  const { data: timingTargets, isLoading: targetsLoading } = useDigestTimingTargetsQuery(
    digestId,
    resolvedTimingId
  );
  const { data: contents, isLoading: contentsLoading } = useGetDigestContentsQuery(digestId);

  const currentDigest = useMemo(() => {
    if (!digestId) return null;
    return (digests || []).find((d) => d._id === digestId) || null;
  }, [digestId, digests]);

  useEffect(() => {
    if (!currentDigest) return;
    setEnabled(currentDigest.enabled !== false);
  }, [currentDigest]);

  const digestForEnableCheck = useMemo((): DigestListItem | null => {
    if (!currentDigest) return null;
    const cc = currentDigest.contentCount ?? contents?.length ?? 0;
    return { ...currentDigest, contentCount: cc };
  }, [currentDigest, contents]);

  const summaryText = useMemo(() => {
    const lines: string[] = [];
    if (currentDigest) lines.push(digestTagline(currentDigest));
    const emails = (timingTargets || []).map((t) => t.kindleEmail).filter(Boolean);
    emails.forEach((e) => lines.push(e));
    return lines.join('\n');
  }, [currentDigest, timingTargets]);

  const pageLoading =
    timingsLoading ||
    digestsLoading ||
    contentsLoading ||
    !digestId ||
    (Boolean(resolvedTimingId) && targetsLoading);

  if (pageLoading) {
    return <Wrap />;
  }

  return (
    <Wrap>
      <CannotEnableDigestDialog
        isOpen={cannotEnableMissing !== null}
        onClose={() => setCannotEnableMissing(null)}
        missing={cannotEnableMissing ?? []}
      />
      {summaryText.trim() ? <Summary>{summaryText}</Summary> : null}
      <Toggle
        aria-label="Digest enabled"
        checked={enabled}
        disabled={isUpdatingEnabled}
        onChange={async (nextValue) => {
          if (nextValue && digestForEnableCheck && !canEnableDigest(digestForEnableCheck)) {
            setCannotEnableMissing(missingEnableRequirements(digestForEnableCheck));
            return;
          }
          const prev = enabled;
          setEnabled(nextValue);
          try {
            await updateEnabled({ digestId: digestId!, body: { enabled: nextValue } });
            toast.success(nextValue ? 'Digest enabled' : 'Digest disabled');
          } catch {
            setEnabled(prev);
            toast.error('Could not update digest status');
          }
        }}
      />
      <Button
        type="button"
        text="Back to digests"
        size="large"
        fullWidth
        onClick={() => navigate('/')}
      />
    </Wrap>
  );
}
