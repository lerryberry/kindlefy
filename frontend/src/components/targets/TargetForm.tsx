import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import SetupFormSubmit from '../util/SetupFormSubmit';
import { useCreateTargetMutation, useTargetsQuery, targetIdsFromTiming } from '../../hooks/useTargets';
import { useUpdateTimingMutation, useTimingsQuery, findTimingForPrompt } from '../../hooks/useTimings';
import { useSetupWizard } from '../../hooks/useSetupWizard';
import type { Target } from '../../types/target';

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const Hint = styled.p`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin: 0;
`;

const SectionTitle = styled.h3`
  margin: 0 0 0.35rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin-bottom: 1.25rem;
`;

const TargetList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  overflow: hidden;
`;

const TargetRow = styled.li`
  border-bottom: 1px solid var(--color-border-primary);

  &:last-child {
    border-bottom: none;
  }
`;

const TargetLabel = styled.label<{ $disabled?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  cursor: ${(p) => (p.$disabled ? 'default' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.65 : 1)};
  background-color: var(--color-background-tertiary);

  &:hover {
    background-color: ${(p) =>
      p.$disabled ? 'var(--color-background-tertiary)' : 'var(--color-background-secondary)'};
  }
`;

const Checkbox = styled.input`
  margin-top: 0.2rem;
  flex-shrink: 0;
  width: 1.05rem;
  height: 1.05rem;
  accent-color: var(--color-brand-500);
`;

const TargetText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
`;

const TargetPrimary = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  word-break: break-word;
`;

const TargetSecondary = styled.span`
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  word-break: break-all;
`;

function targetPrimaryLine(t: Target): string {
  const label = t.label?.trim();
  return label || t.kindleEmail;
}

function targetSecondaryLine(t: Target): string | null {
  const label = t.label?.trim();
  return label ? t.kindleEmail : null;
}

export default function TargetForm() {
  const navigate = useNavigate();
  const { promptId, timingId } = useSetupWizard();
  const { data: timingsRes } = useTimingsQuery();
  const timings = timingsRes?.data ?? [];
  const timing =
    (timingId ? timings.find((t) => t._id === timingId) : undefined) ||
    findTimingForPrompt(timings, promptId);

  const { mutateAsync: createTarget, isPending: isCreating } = useCreateTargetMutation();
  const { mutateAsync: updateTiming, isPending: isUpdating } = useUpdateTimingMutation();
  const { data: targetsRes } = useTargetsQuery();

  const [kindleEmail, setKindleEmail] = useState('');
  const [label, setLabel] = useState('');

  const allTargets = targetsRes?.data ?? [];
  const sortedTargets = useMemo(
    () => [...allTargets].sort((a, b) => a.kindleEmail.localeCompare(b.kindleEmail)),
    [allTargets]
  );

  const linkedIdsKey = useMemo(
    () => targetIdsFromTiming(timing?.targets).sort().join('\0'),
    [timing?.targets]
  );
  const linkedIdSet = useMemo(() => new Set(linkedIdsKey.split('\0').filter(Boolean)), [linkedIdsKey]);

  const busy = isCreating || isUpdating;

  async function handleToggleLinked(targetId: string, checked: boolean) {
    if (!timing?._id) return;
    const current = targetIdsFromTiming(timing.targets);
    const next = checked
      ? [...new Set([...current, targetId])]
      : current.filter((id) => id !== targetId);
    try {
      await updateTiming({ id: timing._id, body: { targets: next } });
      toast.success(checked ? 'Added to this schedule' : 'Removed from this schedule');
    } catch {
      toast.error('Could not update schedule');
    }
  }

  async function handleAddNew(e: React.FormEvent) {
    e.preventDefault();
    const email = kindleEmail.trim().toLowerCase();
    if (!email) {
      toast.error('Kindle email is required');
      return;
    }
    if (!timing?._id) {
      toast.error('Save a schedule first (Schedule step)');
      return;
    }
    try {
      const match = allTargets.find((t) => t.kindleEmail === email);
      let targetId: string;
      if (match) {
        targetId = match._id;
      } else {
        const created = await createTarget({
          kindleEmail: email,
          label: label.trim() || undefined,
        });
        targetId = created._id;
      }
      const current = targetIdsFromTiming(timing.targets);
      if (current.includes(targetId)) {
        toast.success('That address is already linked to this schedule');
      } else {
        await updateTiming({
          id: timing._id,
          body: { targets: [...current, targetId] },
        });
        toast.success(match ? 'Saved address linked to this schedule' : 'Target added and linked');
      }
      setKindleEmail('');
      setLabel('');
      navigate('/');
    } catch {
      toast.error('Could not add target');
    }
  }

  if (!promptId) {
    return <p>Complete the Content step first.</p>;
  }

  if (!timing?._id) {
    return <p>Save a schedule for this prompt before adding Kindle destinations.</p>;
  }

  return (
    <>
      <Hint style={{ marginBottom: '1rem' }}>
        Choose saved Kindle addresses for this digest, or add a new one. You can link several destinations.
      </Hint>

      <Section aria-labelledby="saved-targets-heading">
        <SectionTitle id="saved-targets-heading">Your Kindle addresses</SectionTitle>
        {sortedTargets.length === 0 ? (
          <Hint>You don’t have any saved addresses yet. Add one below.</Hint>
        ) : (
          <TargetList role="group" aria-label="Link targets to this schedule">
            {sortedTargets.map((t) => {
              const checked = linkedIdSet.has(t._id);
              const secondary = targetSecondaryLine(t);
              return (
                <TargetRow key={t._id}>
                  <TargetLabel $disabled={busy}>
                    <Checkbox
                      type="checkbox"
                      checked={checked}
                      disabled={busy}
                      onChange={(e) => handleToggleLinked(t._id, e.target.checked)}
                    />
                    <TargetText>
                      <TargetPrimary>{targetPrimaryLine(t)}</TargetPrimary>
                      {secondary ? <TargetSecondary>{secondary}</TargetSecondary> : null}
                    </TargetText>
                  </TargetLabel>
                </TargetRow>
              );
            })}
          </TargetList>
        )}
      </Section>

      <Section aria-labelledby="new-target-heading">
        <SectionTitle id="new-target-heading">Add a new address</SectionTitle>
        <Hint>Creates a saved destination and links it to this schedule (if the email already exists, it is only linked).</Hint>
        <Form onSubmit={handleAddNew}>
          <Row>
            <FormInput
              label="Kindle email"
              name="kindleEmail"
              type="email"
              value={kindleEmail}
              onChange={(e) => setKindleEmail(e.target.value)}
              required
              placeholder="you@kindle.com"
              disabled={busy}
            />
            <FormInput
              label="Label"
              name="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Optional name"
              disabled={busy}
            />
            <SetupFormSubmit pending={busy} label="Add & link" />
          </Row>
        </Form>
      </Section>
    </>
  );
}
