import { Navigate, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Loading from '../util/Loading';
import Button from '../util/Button';
import Dialog from '../util/Dialog';
import Toggle from '../util/Toggle';
import toast from 'react-hot-toast';
import { useDigestsQuery } from '../../hooks/useDigests';
import type { DigestListItem } from '../../types/digest';
import { digestTagline } from '../../utils/digestTagline';
import { useDeleteDigestMutation, useUpdateDigestEnabledMutation } from '../../hooks/useDigests';
import { useState } from 'react';
import { missingEnableRequirements, type EnableRequirement } from '../../utils/digestEligibility';
import { CannotEnableDigestDialog } from '../digest/DigestPolicyDialogs';
import { MAX_DIGESTS_PER_LOGIN } from '../../constants/planLimits';

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
  min-width: 0;

  &:hover {
    border-color: var(--color-brand-500);
  }
`;

const RowInner = styled.div`
  padding: 0.75rem 1rem 1rem;
  min-width: 0;
`;

const RowTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 0.5rem;
  min-width: 0;
`;

const TaglineArea = styled.div`
  flex: 1;
  min-width: 0;
  text-align: left;
  padding: 0.25rem 0 0;
  cursor: pointer;
  color: inherit;
  font: inherit;

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
    border-radius: 0.25rem;
  }
`;

const ToggleRow = styled.div`
  margin-top: 0.65rem;
  display: flex;
  align-items: center;
`;

const ToggleWrap = styled.div`
  display: inline-flex;
  align-items: center;
`;

const DeleteButton = styled.button`
  flex-shrink: 0;
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

const Tagline = styled.div`
  font-weight: 500;
  line-height: 1.4;
`;

const ErrorText = styled.p`
  color: var(--color-error);
`;

export default function DigestListPage() {
  const navigate = useNavigate();
  const { data: digests, isLoading, isError } = useDigestsQuery();
  const { mutateAsync: deleteDigest, isPending: isDeleting } = useDeleteDigestMutation();
  const { mutateAsync: updateEnabled, isPending: isUpdatingEnabled } = useUpdateDigestEnabledMutation();
  const [pendingDeleteDigestId, setPendingDeleteDigestId] = useState<string | null>(null);
  const [pendingEnabledDigestId, setPendingEnabledDigestId] = useState<string | null>(null);
  const [cannotEnableMissing, setCannotEnableMissing] = useState<EnableRequirement[] | null>(null);

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
          <Button
            type="button"
            text="New digest"
            onClick={() => navigate('/new/content')}
            disabled={rows.length >= MAX_DIGESTS_PER_LOGIN}
            title={
              rows.length >= MAX_DIGESTS_PER_LOGIN
                ? `You can have at most ${MAX_DIGESTS_PER_LOGIN} digests`
                : undefined
            }
          />
        </HeaderRow>
        <List>
          {rows.map((digest) => {
            return (
              <Row key={digest._id}>
                <RowInner>
                  <RowTop>
                    <TaglineArea
                      role="button"
                      tabIndex={0}
                      onClick={() => openDigest(digest)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') openDigest(digest);
                      }}
                    >
                      <Tagline>{digestTagline(digest)}</Tagline>
                    </TaglineArea>
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
                  </RowTop>
                  <ToggleRow
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <ToggleWrap>
                      <Toggle
                        aria-label="Digest enabled"
                        checked={digest.enabled !== false}
                        disabled={isUpdatingEnabled && pendingEnabledDigestId === digest._id}
                        onChange={async (nextValue) => {
                          if (nextValue) {
                            const missing = missingEnableRequirements(digest);
                            if (missing.length > 0) {
                              setCannotEnableMissing(missing);
                              return;
                            }
                          }
                          setPendingEnabledDigestId(digest._id);
                          try {
                            await updateEnabled({ digestId: digest._id, body: { enabled: nextValue } });
                            toast.success(nextValue ? 'Digest enabled' : 'Digest disabled');
                          } catch {
                            toast.error('Could not update digest status');
                          } finally {
                            setPendingEnabledDigestId(null);
                          }
                        }}
                      />
                    </ToggleWrap>
                  </ToggleRow>
                </RowInner>
              </Row>
            );
          })}
        </List>
        <CannotEnableDigestDialog
          isOpen={cannotEnableMissing !== null}
          onClose={() => setCannotEnableMissing(null)}
          missing={cannotEnableMissing ?? []}
        />
        <Dialog
          isOpen={pendingDeleteDigestId !== null}
          onClose={() => setPendingDeleteDigestId(null)}
          title="Delete digest"
          description="This will permanently remove the digest from your account."
          confirmText="Delete"
          confirmVariant="ghost"
          showCancel={false}
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
