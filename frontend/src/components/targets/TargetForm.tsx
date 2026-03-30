import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import Button from '../util/Button';
import { useCreateTargetMutation, useDeleteTargetMutation, useTargetsQuery } from '../../hooks/useTargets';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import {
  useDigestTimingTargetsQuery,
  useDigestTimingsQuery,
  useUpdateDigestTimingTargetsMutation,
} from '../../hooks/useDigests';
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

const AddOptionButton = styled.button`
  width: 100%;
  border-radius: 0.5rem;
  border: 1px dashed var(--color-border-primary);
  background: transparent;
  padding: 0.75rem 0.875rem;
  cursor: pointer;
  color: var(--color-text-primary);
  font-weight: 500;
  transition: all 0.15s ease;

  &:hover {
    background: var(--color-background-tertiary);
    border-style: solid;
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }
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
  display: flex;
  align-items: stretch;

  &:last-child {
    border-bottom: none;
  }
`;

const TargetLabel = styled.label<{ $disabled?: boolean }>`
  display: flex;
  flex: 1;
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

const TargetActions = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5rem 0.625rem 0.5rem 0;
`;

const DeleteTargetButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 9999px;
  border: 1px solid var(--color-border-primary);
  background: transparent;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-error);
    color: var(--color-error);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitRow = styled.div`
  margin-top: 1rem;
  width: 100%;
`;

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function targetPrimaryLine(t: Target): string {
  const label = t.label?.trim();
  return label || t.kindleEmail;
}

function targetSecondaryLine(t: Target): string | null {
  const label = t.label?.trim();
  return label ? t.kindleEmail : null;
}

export default function TargetForm() {
  const { digestId, selectedTimingId, setSelectedTimingId } = useDigestWizard();
  const { data: timings, isLoading: timingsLoading } = useDigestTimingsQuery(digestId);
  const resolvedTimingId = selectedTimingId || timings?.[0]?.timingId || null;

  const { data: timingTargets, isLoading: timingTargetsLoading } = useDigestTimingTargetsQuery(digestId, resolvedTimingId);

  const { mutateAsync: createTarget, isPending: isCreating } = useCreateTargetMutation();
  const { mutateAsync: deleteTarget, isPending: isDeletingTarget } = useDeleteTargetMutation();
  const { mutateAsync: updateDigestTargets, isPending: isUpdating } = useUpdateDigestTimingTargetsMutation(digestId, resolvedTimingId);
  const { data: targetsRes } = useTargetsQuery();

  const [kindleEmail, setKindleEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const didInitModeRef = useRef(false);

  // Ensure selection is stable when arriving on `/.../targets` with no persisted timing selection.
  useEffect(() => {
    if (resolvedTimingId && !selectedTimingId) setSelectedTimingId(resolvedTimingId);
  }, [resolvedTimingId, selectedTimingId, setSelectedTimingId]);

  const allTargets = targetsRes?.data ?? [];
  const hasAnySavedTargets = allTargets.length > 0;
  const sortedTargets = useMemo(
    () => [...allTargets].sort((a, b) => a.kindleEmail.localeCompare(b.kindleEmail)),
    [allTargets]
  );

  const linkedIdSet = useMemo(() => {
    const ids = (timingTargets || []).map((t) => t._id);
    return new Set(ids);
  }, [timingTargets]);

  const busy = isCreating || isUpdating || isDeletingTarget || timingsLoading || timingTargetsLoading;

  // Initialize mode once query data is available:
  // - If there are no saved targets, always show the add-new form.
  // - Otherwise start on the list view (and offer an "Add" option at the bottom).
  useEffect(() => {
    if (didInitModeRef.current) return;
    if (!targetsRes) return;
    setShowAddForm(!hasAnySavedTargets);
    didInitModeRef.current = true;
  }, [targetsRes, hasAnySavedTargets]);

  async function handleToggleLinked(targetId: string, checked: boolean) {
    if (!resolvedTimingId) return;
    const current = (timingTargets || []).map((t) => t._id);
    const next = checked ? [...new Set([...current, targetId])] : current.filter((id) => id !== targetId);
    try {
      await updateDigestTargets({ targets: next });
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
    try {
      const match = allTargets.find((t) => t.kindleEmail === email);
      let targetId: string;
      if (match) {
        targetId = match._id;
      } else {
        const created = await createTarget({
          kindleEmail: email,
        });
        targetId = created._id;
      }
      if (!resolvedTimingId) {
        toast.success(match ? 'Device already exists' : 'Device added');
      } else {
        const current = (timingTargets || []).map((t) => t._id);
        if (current.includes(targetId)) {
          toast.success('That address is already linked to this schedule');
        } else {
          await updateDigestTargets({ targets: [...current, targetId] });
          toast.success(match ? 'Saved address linked to this schedule' : 'Target added and linked');
        }
      }
      setKindleEmail('');
      setShowAddForm(false);
      // Keep the user on the targets screen so they can keep selecting.
    } catch {
      toast.error('Could not add target');
    }
  }

  async function handleDeleteTarget(targetId: string) {
    try {
      await deleteTarget(targetId);
      toast.success('Target deleted');
    } catch {
      toast.error('Could not delete target');
    }
  }

  if (!digestId) return <p>Missing digest.</p>;

  return (
    <>
      {showAddForm ? (
        <>
          <Hint style={{ marginBottom: '1rem' }}>
            To get your Kindle “Send-to-Kindle” email address:
            <div style={{ marginTop: '0.5rem' }}>
              Go to:{' '}
              <a
                href="https://www.amazon.com/mycd"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--color-text-primary)', textDecoration: 'underline' }}
              >
                https://www.amazon.com/mycd
              </a>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              Steps:
              <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                <li>Sign in</li>
                <li>Click Devices</li>
                <li>Select your Kindle or Kindle app</li>
                <li>Find Send-to-Kindle Email Address (e.g. name_123@kindle.com)</li>
              </ol>
            </div>
          </Hint>
          <Section aria-labelledby="new-target-heading">
            <SectionTitle id="new-target-heading">Add a new address</SectionTitle>
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
                <SubmitRow>
                  <Button
                    type="submit"
                    text={busy ? 'Saving…' : 'Add device'}
                    size="medium"
                    isResponsive
                    variant="ghost"
                    disabled={busy}
                  />
                </SubmitRow>
              </Row>
            </Form>
          </Section>
        </>
      ) : (
        <>
          <Hint style={{ marginBottom: '1rem' }}>
            {resolvedTimingId
              ? 'Choose saved Kindle addresses for this digest. You can link several destinations.'
              : 'Manage your saved Kindle devices. Add or delete devices now, then link them after saving a schedule.'}
          </Hint>

          <Section aria-labelledby="saved-targets-heading">
            <SectionTitle id="saved-targets-heading">Your Kindle addresses</SectionTitle>
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
                        disabled={busy || !resolvedTimingId}
                        onChange={(e) => {
                          if (!resolvedTimingId) {
                            toast.error('Save a schedule to link devices');
                            return;
                          }
                          handleToggleLinked(t._id, e.target.checked);
                        }}
                      />
                      <TargetText>
                        <TargetPrimary>{targetPrimaryLine(t)}</TargetPrimary>
                        {secondary ? <TargetSecondary>{secondary}</TargetSecondary> : null}
                      </TargetText>
                    </TargetLabel>
                    <TargetActions>
                      <DeleteTargetButton
                        type="button"
                        onClick={() => handleDeleteTarget(t._id)}
                        disabled={busy}
                        aria-label="Delete target"
                        title="Delete target"
                      >
                        <DeleteIcon />
                      </DeleteTargetButton>
                    </TargetActions>
                  </TargetRow>
                );
              })}
            </TargetList>
          </Section>

          {sortedTargets.length > 0 ? (
            <AddOptionButton type="button" onClick={() => setShowAddForm(true)}>
              Add new address
            </AddOptionButton>
          ) : null}
        </>
      )}
    </>
  );
}
