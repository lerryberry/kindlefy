import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Loading from '../util/Loading';
import Button from '../util/Button';
import Dialog from '../util/Dialog';
import toast from 'react-hot-toast';
import { useDigestsQuery } from '../../hooks/useDigests';
import type { DigestListItem } from '../../types/digest';
import { lengthLabel } from '../../utils/promptLength';
import { useDeleteDigestMutation } from '../../hooks/useDigests';
import { useState } from 'react';

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

const RowMain = styled.div`
  flex: 1;
  min-width: 0;
  text-align: left;
  padding: 1rem;
  cursor: pointer;
  color: inherit;
  font: inherit;

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: -2px;
  }
`;

const RowActions = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem 0.75rem 0.75rem 0;
`;

const DeleteButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 1px solid var(--color-border-primary);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-error);
    color: var(--color-error);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

const RowTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.35rem;
`;

const Meta = styled.div`
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const ErrorText = styled.p`
  color: var(--color-error);
`;

function digestTitle(digest: DigestListItem): string {
  const first = (digest.prompt.topics || []).find(Boolean);
  if (first) return first.length > 48 ? `${first.slice(0, 45)}…` : first;
  if (digest.prompt.length) return lengthLabel(digest.prompt.length);
  return 'Digest';
}

function digestLengthLine(digest: DigestListItem): string | null {
  if (!digest.prompt.length) return null;
  const label = lengthLabel(digest.prompt.length);
  return label || null;
}

function scheduleSummary(digest: DigestListItem): string {
  const s = digest.defaultTiming?.schedule;
  if (!s) return 'No schedule yet';
  const freq = s.frequency || 'daily';
  return `${s.timeOfDay} · ${s.timezone} · ${freq}`;
}

export default function DigestListPage() {
  const navigate = useNavigate();
  const { data: digests, isLoading, isError } = useDigestsQuery();
  const { mutateAsync: deleteDigest, isPending: isDeleting } = useDeleteDigestMutation();
  const [pendingDeleteDigestId, setPendingDeleteDigestId] = useState<string | null>(null);

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <Page className="container">
        <div className="container-content">
          <ErrorText>Could not load your digests. Try again later.</ErrorText>
          <Button type="button" text="Set up a digest" onClick={() => navigate('/new/content')} style={{ marginTop: '1rem' }} />
        </div>
      </Page>
    );
  }

  const rows = digests ?? [];
  if (rows.length === 0) {
    return <Navigate to="/new/content" replace />;
  }

  function openDigest(digest: DigestListItem) {
    if (digest.defaultTiming) navigate(`/${digest._id}/schedule`);
    else navigate(`/${digest._id}/content`);
  }

  return (
    <Page className="container">
      <div className="container-content">
        <HeaderRow>
          <Title>Your digests</Title>
          <Button type="button" text="New digest" variant="ghost" onClick={() => navigate('/new/content')} />
        </HeaderRow>
        <List>
          {rows.map((digest) => {
            const nTargets = digest.defaultTiming?.targetsCount ?? 0;
            const lenLine = digestLengthLine(digest);
            const metaLine = [
              lenLine,
              nTargets > 0
                ? `${nTargets} Kindle destination${nTargets === 1 ? '' : 's'}`
                : 'No targets yet',
            ]
              .filter(Boolean)
              .join(' · ');

            return (
              <Row key={digest._id}>
                <RowMain
                  role="button"
                  tabIndex={0}
                  onClick={() => openDigest(digest)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') openDigest(digest);
                  }}
                >
                  <RowTitle>{digestTitle(digest)}</RowTitle>
                  <Meta>{scheduleSummary(digest)}</Meta>
                  <Meta>{metaLine}</Meta>
                </RowMain>
                <RowActions>
                  <DeleteButton
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteDigestId(digest._id);
                    }}
                    disabled={isDeleting}
                    aria-label="Delete digest"
                    title="Delete digest"
                  >
                    <DeleteIcon />
                  </DeleteButton>
                </RowActions>
              </Row>
            );
          })}
        </List>
        <Dialog
          isOpen={pendingDeleteDigestId !== null}
          onClose={() => setPendingDeleteDigestId(null)}
          title="Delete digest"
          description="This will permanently remove the digest from your account."
          confirmText="Delete"
          confirmDisabled={isDeleting}
          onConfirm={async () => {
            const id = pendingDeleteDigestId;
            if (!id) return;
            try {
              await deleteDigest(id);
              toast.success('Digest deleted');
              setPendingDeleteDigestId(null);
            } catch {
              toast.error('Could not delete digest');
            }
          }}
        />
      </div>
    </Page>
  );
}

