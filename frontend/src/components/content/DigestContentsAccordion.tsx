import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Button from '../util/Button';
import { useGetDigestContentsQuery, useReorderDigestContentsMutation } from '../../hooks/useDigests';
import type { DigestContentItem } from '../../types/digest';
import ContentItemForm from './ContentItemForm';
import DraggableAccordionList from '../util/DraggableAccordionList';
import {
  DEFAULT_NEWS_SCOPE,
  formatNewsScopeSummary,
  type NewsScope,
} from '../../constants/newsScope';
import { DEFAULT_WORD_COUNT, formatWordCount } from '../../utils/promptLength';
import { MAX_CONTENT_SECTIONS_PER_DIGEST } from '../../constants/planLimits';

const HeaderRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
`;

const OrderChip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.4rem;
  border-radius: 9999px;
  background: var(--color-background-tertiary);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const SummaryText = styled.span`
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const FooterRow = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
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

function topicsLabel(topics: string[]): string {
  return (topics || []).filter(Boolean).slice(0, 3).join(', ');
}

function truncate(text: string, max: number): string {
  const t = (text || '').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function sectionTaglineText(
  newsScope: NewsScope,
  locationText: string,
  topics: string[],
  length: number,
  specialInterestText?: string
): string {
  const scope = formatNewsScopeSummary(newsScope, locationText);
  let subject = topicsLabel(topics);
  if (newsScope === 'special' && !subject && specialInterestText) {
    subject = truncate(specialInterestText, 40);
  }
  if (!subject) subject = 'Choose topics';
  return `${scope} · ${subject} · ${formatWordCount(length)}`;
}

function sectionHeader(
  index: number,
  scope: NewsScope,
  locationText: string,
  topics: string[],
  length: number,
  specialInterestText?: string
) {
  return (
    <HeaderRow>
      <OrderChip>{index + 1}</OrderChip>
      <SummaryText>{sectionTaglineText(scope, locationText, topics, length, specialInterestText)}</SummaryText>
    </HeaderRow>
  );
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
  const [draftSummary, setDraftSummary] = useState<{
    length: number;
    topics: string[];
    newsScope: NewsScope;
    locationText: string;
    specialInterestText: string;
  }>({
    length: DEFAULT_WORD_COUNT,
    topics: [],
    newsScope: DEFAULT_NEWS_SCOPE,
    locationText: '',
    specialInterestText: '',
  });
  const handleDraftChange = useCallback(
    (draft: {
      length: number;
      topics: string[];
      newsScope: NewsScope;
      locationText: string;
      specialInterestText: string;
    }) => {
      setDraftSummary(draft);
    },
    []
  );

  useEffect(() => {
    if (initialCloseAppliedRef.current) return;
    const shouldCloseInitially = Boolean(
      (location.state as { closeContentAccordion?: boolean } | null)?.closeContentAccordion
    );
    if (shouldCloseInitially) {
      manuallyClosedRef.current = true;
      initialCloseAppliedRef.current = true;
      setIsAdding(false);
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
    return (content: DigestContentItem, index: number) =>
      sectionHeader(index, content.newsScope, content.locationText, content.topics || [], content.length);
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
      toast.error('Could not reorder sections');
      // Fallback: re-sync on next query invalidation.
    }
  }

  if (isLoading && !serverContents) {
    return <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>Loading sections…</p>;
  }

  return (
    <div>
      <DraggableAccordionList
        items={contents.map((c) => ({ ...c, id: c.contentId }))}
        openItemId={openItemId}
        onOpenChange={handleOpenChange}
        onReorder={(ordered) => handleReorder(ordered.map((o) => ({ ...o } as DigestContentItem)))}
        renderHeader={(item) => {
          const content = item as unknown as DigestContentItem;
          const idx = contents.findIndex((c) => c.contentId === content.contentId);
          return headerRenderer(content, idx >= 0 ? idx : 0);
        }}
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

      {contents.length === 0 && !isAdding ? (
        <div style={{ marginTop: '1rem', color: 'var(--color-text-secondary)' }}>
          No sections yet. Add your first section below.
        </div>
      ) : null}

      {digestId && contents.length >= MAX_CONTENT_SECTIONS_PER_DIGEST && !isAdding ? (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          This digest already has the maximum of {MAX_CONTENT_SECTIONS_PER_DIGEST} content sections.
        </p>
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
            {sectionHeader(
              contents.length,
              draftSummary.newsScope,
              draftSummary.locationText,
              draftSummary.topics,
              draftSummary.length,
              draftSummary.specialInterestText
            )}
            <DraftChevron $isOpen={draftOpen}>{'⌃'}</DraftChevron>
          </DraftHeader>
          <DraftBody $isOpen={draftOpen}>
            <DraftBodyInner>
              <ContentItemForm
                mode="create"
                digestId={digestId}
                onCreated={(result: { digestId: string; content: DigestContentItem }) => {
                  if (!digestId) {
                    setIsAdding(false);
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
          text="Add section"
          variant="ghost"
          size="large"
          fullWidth
          onClick={handleStartAddContent}
          disabled={
            isAdding ||
            Boolean(digestId && contents.length >= MAX_CONTENT_SECTIONS_PER_DIGEST)
          }
        />
        <Button
          type="button"
          text="Next"
          size="large"
          fullWidth
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

