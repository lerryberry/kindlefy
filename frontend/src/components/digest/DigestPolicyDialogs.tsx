import styled from 'styled-components';
import toast from 'react-hot-toast';
import Dialog from '../util/Dialog';
import { useUpdateDigestEnabledMutation } from '../../hooks/useDigests';
import type { EnableRequirement } from '../../utils/digestEligibility';

const Body = styled.div`
  color: var(--color-text-secondary);
  line-height: 1.55;

  p {
    margin: 0 0 0.75rem 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul {
    margin: 0.5rem 0 0;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.35rem;
  }
`;

const REQUIREMENT_LABELS: Record<EnableRequirement, string> = {
  content: 'At least one content section',
  schedule: 'A schedule with a send time (timezone and time of day)',
  kindle: 'At least one Kindle linked to that schedule',
};

function requirementLines(missing: EnableRequirement[]) {
  return missing.map((k) => <li key={k}>{REQUIREMENT_LABELS[k]}</li>);
}

export function CannotEnableDigestDialog({
  isOpen,
  onClose,
  missing,
}: {
  isOpen: boolean;
  onClose: () => void;
  missing: EnableRequirement[];
}) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Can't enable digest yet"
      description={
        <Body>
          <p>An enabled digest must have something to send, a send time, and at least one Kindle. Add the missing pieces first:</p>
          <ul>{requirementLines(missing)}</ul>
        </Body>
      }
      confirmText="OK"
      onConfirm={onClose}
      showCancel={false}
    />
  );
}

export type MustDisableVariant = 'last-content' | 'last-kindle-unlink' | 'last-kindle-delete';

const DISABLE_VARIANT_COPY: Record<
  MustDisableVariant,
  { lead: string; detail: string }
> = {
  'last-content': {
    lead: 'This is the only content section while the digest is enabled.',
    detail:
      'An enabled digest must keep at least one section so it knows what to generate. Disable the digest first; then you can remove this section if you still want to.',
  },
  'last-kindle-unlink': {
    lead: 'This is the only Kindle linked to this schedule while the digest is enabled.',
    detail:
      'An enabled digest must send somewhere. Disable the digest first; then you can unlink this address from the schedule.',
  },
  'last-kindle-delete': {
    lead: 'This device is the only Kindle on this schedule for an enabled digest.',
    detail:
      'Removing it would leave nowhere for the digest to go. Disable the digest first; then you can delete or unlink the device.',
  },
};

export function MustDisableDigestDialog({
  isOpen,
  onClose,
  digestId,
  variant,
  onDisabled,
}: {
  isOpen: boolean;
  onClose: () => void;
  digestId: string;
  variant: MustDisableVariant | null;
  onDisabled?: () => void;
}) {
  const { mutateAsync: updateEnabled, isPending } = useUpdateDigestEnabledMutation();
  const copy = variant ? DISABLE_VARIANT_COPY[variant] : null;

  async function handleDisable() {
    try {
      await updateEnabled({ digestId, body: { enabled: false } });
      toast.success('Digest disabled');
      onDisabled?.();
      onClose();
    } catch {
      toast.error('Could not turn digest off');
    }
  }

  return (
    <Dialog
      isOpen={isOpen && Boolean(copy)}
      onClose={onClose}
      title="Disable digest first"
      description={
        copy ? (
          <Body>
            <p>{copy.lead}</p>
            <p>{copy.detail}</p>
            <p>You can disable the digest below, then try again.</p>
          </Body>
        ) : (
          ''
        )
      }
      confirmText={isPending ? 'Disabling…' : 'Disable digest'}
      onConfirm={() => void handleDisable()}
      confirmDisabled={isPending}
      cancelDisabled={isPending}
    />
  );
}
