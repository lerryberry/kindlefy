import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import { useTimingsQuery, useDeleteTimingMutation } from '../../hooks/useTimings';
import { targetIdsFromTiming } from '../../hooks/useTargets';
import { useSetupWizard } from '../../hooks/useSetupWizard';
import Loading from '../util/Loading';
import Button from '../util/Button';
import Dialog from '../util/Dialog';
import type { Timing } from '../../types/timing';
import type { Prompt } from '../../types/prompt';
import { digestTitleFromPrompt, lengthLabel } from '../../utils/promptLength';

const Page = styled.div`
  padding: 1rem;
  padding-bottom: 3rem;
  max-width: 720px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Row = styled.li`
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  padding: 0;
  background: var(--color-background-secondary);
  transition: border-color 0.15s ease;
  display: flex;
  align-items: stretch;
  gap: 0;
  min-width: 0;

  &:hover {
    border-color: var(--color-brand-500);
  }
`;

const RowMain = styled.button`
  flex: 1;
  min-width: 0;
  text-align: left;
  padding: 1rem;
  cursor: pointer;
  background: none;
  border: none;
  color: inherit;
  font: inherit;

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: -2px;
  }
`;

const RowTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.35rem;
`;

const Meta = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const DeleteButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  padding: 0;
  border: none;
  border-left: 1px solid var(--color-border-primary);
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  border-radius: 0 0.5rem 0.5rem 0;
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    color: var(--color-error);
    background: var(--color-background-tertiary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: -4px;
  }
`;

const ErrorText = styled.p`
  color: var(--color-error);
`;

function TrashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
    </svg>
  );
}

function promptIdFromTiming(timing: Timing): string | null {
  const p = timing.prompt as Prompt | string;
  if (typeof p === 'object' && p && '_id' in p) return p._id;
  return p ? String(p) : null;
}

function digestTitle(timing: Timing): string {
  const p = timing.prompt as Prompt | string;
  if (typeof p === 'object' && p && 'length' in p) {
    return digestTitleFromPrompt(p as Prompt);
  }
  return 'Digest';
}

function digestLengthLine(timing: Timing): string | null {
  const p = timing.prompt as Prompt | string;
  if (typeof p === 'object' && p && 'length' in p) {
    const label = lengthLabel((p as Prompt).length);
    return label || null;
  }
  return null;
}

function scheduleSummary(timing: Timing): string {
  const s = timing.schedule;
  const freq = s.frequency || 'daily';
  return `${s.timeOfDay} · ${s.timezone} · ${freq}`;
}

export default function DigestListPage() {
  const navigate = useNavigate();
  const { selectDigest, timingId, setTimingId } = useSetupWizard();
  const { data, isLoading, isError } = useTimingsQuery();
  const { mutateAsync: deleteTiming, isPending: isDeleting } = useDeleteTimingMutation();
  const timings = data?.data ?? [];

  const [pendingDelete, setPendingDelete] = useState<Timing | null>(null);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Page className="container">
        <div className="container-content">
          <ErrorText>Could not load your digests. Try again later.</ErrorText>
          <Button type="button" text="Set up a digest" onClick={() => navigate('/content')} style={{ marginTop: '1rem' }} />
        </div>
      </Page>
    );
  }

  if (timings.length === 0) {
    return <Navigate to="/content" replace />;
  }

  function openDigest(timing: Timing) {
    const pid = promptIdFromTiming(timing);
    if (!pid) return;
    selectDigest(pid, timing._id);
    navigate('/schedule');
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteTiming(pendingDelete._id);
      if (timingId === pendingDelete._id) {
        setTimingId(null);
      }
      toast.success('Digest removed');
      setPendingDelete(null);
    } catch {
      toast.error('Could not delete digest');
    }
  }

  return (
    <Page className="container">
      <div className="container-content">
        <HeaderRow>
          <Title>Your digests</Title>
          <Button type="button" text="New digest" variant="ghost" onClick={() => navigate('/content')} />
        </HeaderRow>
        <List>
          {timings.map((timing) => {
            const nTargets = targetIdsFromTiming(timing.targets).length;
            const lenLine = digestLengthLine(timing);
            return (
              <Row key={timing._id}>
                <RowMain type="button" onClick={() => openDigest(timing)}>
                  <RowTitle>{digestTitle(timing)}</RowTitle>
                  <Meta>{scheduleSummary(timing)}</Meta>
                  <Meta>
                    {[lenLine, nTargets > 0 ? `${nTargets} Kindle destination${nTargets === 1 ? '' : 's'}` : 'No targets yet']
                      .filter(Boolean)
                      .join(' · ')}
                  </Meta>
                </RowMain>
                <DeleteButton
                  type="button"
                  aria-label={`Delete digest ${digestTitle(timing)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(timing);
                  }}
                >
                  <TrashIcon />
                </DeleteButton>
              </Row>
            );
          })}
        </List>
        <Dialog
          isOpen={!!pendingDelete}
          onClose={() => !isDeleting && setPendingDelete(null)}
          title="Delete digest?"
          description={
            pendingDelete
              ? `Remove the schedule for “${digestTitle(pendingDelete)}”? Your prompt and Kindle targets stay in your account; only this delivery plan is removed.`
              : ''
          }
          confirmText={isDeleting ? 'Deleting…' : 'Delete'}
          onConfirm={() => {
            void confirmDelete();
          }}
          confirmDisabled={isDeleting}
          cancelDisabled={isDeleting}
        />
      </div>
    </Page>
  );
}
