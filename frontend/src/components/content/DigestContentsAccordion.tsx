import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Button from '../util/Button';
import { useGetDigestContentsQuery, useReorderDigestContentsMutation } from '../../hooks/useDigests';
import type { DigestContentItem } from '../../types/digest';
import ContentItemForm from './ContentItemForm';
import DraggableAccordionList from '../util/DraggableAccordionList';
import type { PromptLength } from '../../types/prompt';

const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
`;

const SummaryText = styled.span`
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FooterRow = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
`;

const DraftAccordion = styled.div`
  border: 1px solid var(--color-border-primary);
  border-radius: 0.5rem;
  background: var(--color-background-secondary);
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const DraftHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    background-color: var(--color-background-tertiary);
  }
`;

const DraftChevron = styled.span<{ $isOpen: boolean }>`
  transition: transform 0.2s ease;
  transform: ${(p) => (p.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: var(--color-text-primary);
  flex-shrink: 0;
`;

const DraftBody = styled.div<{ $isOpen: boolean }>`
  max-height: ${(p) => (p.$isOpen ? '1500px' : '0')};
  overflow: hidden;
  transition: max-height 0.25s ease;
  border-top: 1px solid var(--color-border-primary);
  background-color: var(--color-background-secondary);
`;

const DraftBodyInner = styled.div`
  padding: 1rem;
`;

function topicSummary(topics: string[]) {
  const t0 = topics?.[0];
  return t0 || 'Choose topics';
}

function contentSummaryHeader(content: DigestContentItem) {
  const topic = topicSummary(content.topics || []);
  // content.length is already one of: 'short' | 'medium' | 'long'
  return <SummaryText>{`${topic} · ${content.length}`}</SummaryText>;
}

interface DigestContentsAccordionProps {
  digestId: string | null;
  onCreatedDigest?: (digestId: string) => void;
}

export default function DigestContentsAccordion({ digestId, onCreatedDigest }: DigestContentsAccordionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: serverContents, isLoading } = useGetDigestContentsQuery(digestId);
  const reorderMutation = useReorderDigestContentsMutation(digestId);

  const [contents, setContents] = useState<DigestContentItem[]>([]);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const manuallyClosedRef = useRef(false);
  const initialCloseAppliedRef = useRef(false);
  const hasAutoOpenedRef = useRef(false);

  const [isAdding, setIsAdding] = useState(false);
  const [draftOpen, setDraftOpen] = useState(true);
  const [draftSummary, setDraftSummary] = useState<{ length: PromptLength; topics: string[] }>({
    length: 'medium',
    topics: [],
  });
  const handleDraftChange = useCallback((draft: { length: PromptLength; topics: string[] }) => {
    setDraftSummary(draft);
  }, []);

  useEffect(() => {
    if (initialCloseAppliedRef.current) return;
    const shouldCloseInitially = Boolean(
      (location.state as { closeContentAccordion?: boolean } | null)?.closeContentAccordion
    );
    if (shouldCloseInitially) {
      manuallyClosedRef.current = true;
      initialCloseAppliedRef.current = true;
    }
  }, [location.state]);

  useEffect(() => {
    if (!serverContents) return;
    setContents(serverContents);
    setOpenItemId((prev) => {
      if (manuallyClosedRef.current) {
        manuallyClosedRef.current = false;
        return null;
      }
      if (prev && serverContents.some((c) => c.contentId === prev)) {
        return prev;
      }
      if (prev === null) {
        if (!hasAutoOpenedRef.current) {
          hasAutoOpenedRef.current = true;
          return serverContents[0]?.contentId ?? null;
        }
        return null;
      }
      return serverContents[0]?.contentId ?? null;
    });
  }, [serverContents]);

  const handleOpenChange = (next: string | null) => {
    if (next === null) manuallyClosedRef.current = true;
    setOpenItemId(next);
  };

  function handleStartAddContent() {
    manuallyClosedRef.current = true;
    setOpenItemId(null);
    setDraftOpen(true);
    setIsAdding(true);
  }

  const headerRenderer = useMemo(() => {
    return (content: DigestContentItem) => contentSummaryHeader(content);
  }, []);

  function handleDeleted(contentId: string) {
    setContents((prev) => prev.filter((c) => c.contentId !== contentId));
    setOpenItemId((prev) => {
      if (prev === contentId) {
        manuallyClosedRef.current = true;
        return null;
      }
      return prev;
    });
  }

  async function handleReorder(next: DigestContentItem[]) {
    setContents(next);
    try {
      const orderedIds = next.map((c) => c.contentId);
      const updated = await reorderMutation.mutateAsync(orderedIds);
      setContents(updated);
    } catch {
      toast.error('Could not reorder contents');
      // Fallback: re-sync on next query invalidation.
    }
  }

  if (isLoading && !serverContents) {
    return <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Loading contents…</p>;
  }

  return (
    <div>
      <DraggableAccordionList
        items={contents.map((c) => ({ ...c, id: c.contentId }))}
        openItemId={openItemId}
        onOpenChange={handleOpenChange}
        onReorder={(ordered) => handleReorder(ordered.map((o) => ({ ...o } as DigestContentItem)))}
        renderHeader={(item) => headerRenderer(item as unknown as DigestContentItem)}
        renderBody={(item) => {
          const content = contents.find((c) => c.contentId === item.id);
          if (!content) return null;
          return (
            <ContentItemForm
              mode="edit"
              digestId={digestId as string}
              content={content}
              onChange={(next: DigestContentItem) => {
                setContents((prev) => prev.map((c) => (c.contentId === next.contentId ? next : c)));
              }}
              onSaved={(saved: DigestContentItem) => {
                setContents((prev) => prev.map((c) => (c.contentId === saved.contentId ? saved : c)));
                setOpenItemId(null);
              }}
              onSavingStart={() => {
                manuallyClosedRef.current = true;
                setOpenItemId(null);
              }}
              onDelete={() => handleDeleted(content.contentId)}
            />
          );
        }}
      />

      {contents.length === 0 ? (
        <div style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
          No content yet. Add your first content item below.
        </div>
      ) : null}

      {isAdding ? (
        <DraftAccordion>
          <DraftHeader
            onClick={() => setDraftOpen((v) => !v)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setDraftOpen((v) => !v);
            }}
          >
            <HeaderRow>
              <SummaryText>{`${topicSummary(draftSummary.topics)} · ${draftSummary.length}`}</SummaryText>
            </HeaderRow>
            <DraftChevron $isOpen={draftOpen}>{'⌃'}</DraftChevron>
          </DraftHeader>
          <DraftBody $isOpen={draftOpen}>
            <DraftBodyInner>
              <ContentItemForm
                mode="create"
                digestId={digestId}
                onCreated={(result: { digestId: string; content: DigestContentItem }) => {
                  if (!digestId) {
                    onCreatedDigest?.(result.digestId);
                    return;
                  }
                  setContents((prev) => [...prev, result.content]);
                  setIsAdding(false);
                  manuallyClosedRef.current = true;
                  setOpenItemId(null);
                }}
                onDraftChange={handleDraftChange}
                onCancel={() => setIsAdding(false)}
              />
            </DraftBodyInner>
          </DraftBody>
        </DraftAccordion>
      ) : null}

      <FooterRow>
        <Button
          type="button"
          text="Add content"
          variant="ghost"
          onClick={handleStartAddContent}
          disabled={isAdding}
        />
        <Button
          type="button"
          text="Next"
          onClick={() => {
            if (!digestId) return;
            navigate(`/${digestId}/schedule`);
          }}
          disabled={!digestId || contents.length === 0 || isAdding}
        />
      </FooterRow>
    </div>
  );
}

