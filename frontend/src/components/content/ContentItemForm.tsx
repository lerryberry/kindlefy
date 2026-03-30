import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Form from '../util/Form';
import Button from '../util/Button';
import SegmentedControl from '../util/SegmentedControl';
import {
  useCreateDigestAndFirstContentItemMutation,
  useCreateDigestContentItemMutation,
  useUpdateDigestContentItemMutation,
  useDeleteDigestContentItemMutation,
} from '../../hooks/useDigests';
import { PROMPT_TOPIC_OPTIONS } from '../../constants/promptTopics';
import {
  PROMPT_LENGTH_SEGMENT_OPTIONS,
  type PromptLength,
} from '../../utils/promptLength';
import type { DigestContentItem } from '../../types/digest';

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const FieldBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const FieldLabel = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const FieldHint = styled.span`
  font-size: 0.8125rem;
  color: var(--color-text-tertiary);
  line-height: 1.35;
`;

const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
`;

const TopicChip = styled.button<{ $selected: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  border-radius: 9999px;
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  line-height: 1.2;
  cursor: pointer;
  border: 1px solid
    ${(p) => (p.$selected ? 'var(--color-brand-500)' : 'var(--color-border-primary)')};
  background-color: ${(p) => (p.$selected ? 'var(--color-background-secondary)' : 'var(--color-background-tertiary)')};
  color: ${(p) => (p.$selected ? 'var(--color-brand-500)' : 'var(--color-text-primary)')};
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-brand-500);
    background-color: var(--color-background-secondary);
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.25rem;
`;

const RemoveCircleButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  border: 1px solid var(--color-error);
  background: transparent;
  color: var(--color-error);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, var(--color-error) 10%, transparent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

function TrashIcon() {
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

type DraftFields = { length: PromptLength; topics: string[] };

type EditModeProps = {
  mode: 'edit';
  digestId: string;
  content: DigestContentItem;
  onChange: (next: DigestContentItem) => void;
  onSaved?: (saved: DigestContentItem) => void;
  /** Close the accordion immediately when the user clicks "Save content". */
  onSavingStart?: () => void;
  onDelete: () => void;
};

type CreateModeProps = {
  mode: 'create';
  digestId: string | null;
  onCreated: (result: { digestId: string; content: DigestContentItem }) => void;
  onDraftChange?: (draft: DraftFields) => void;
  onCancel?: () => void;
};

type ContentItemFormProps = EditModeProps | CreateModeProps;

function validateTopics(topics: string[]) {
  return topics.length > 0;
}

function buildTopicsFromSet(selectedTopics: Set<string>) {
  // Keep backend-normalized order stable (follow the preset option order).
  return PROMPT_TOPIC_OPTIONS.filter((t) => selectedTopics.has(t));
}

export default function ContentItemForm(props: ContentItemFormProps) {
  const isEdit = props.mode === 'edit';
  const onCreateDraftChange = props.mode === 'create' ? props.onDraftChange : undefined;

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => new Set());
  const [length, setLength] = useState<PromptLength>('medium');

  const editContentId = isEdit ? props.content.contentId : null;
  const editContent = isEdit ? props.content : null;
  const onEditSaved = isEdit ? props.onSaved : undefined;
  const onEditChange = isEdit ? props.onChange : undefined;

  const updateMutation = useUpdateDigestContentItemMutation(
    isEdit ? props.digestId : null,
    editContentId
  );

  const deleteMutation = useDeleteDigestContentItemMutation(isEdit ? props.digestId : null);

  const { mutateAsync: createDigestAndFirst, isPending: isCreatingDigest } =
    useCreateDigestAndFirstContentItemMutation();

  const { mutateAsync: createContentItem, isPending: isCreatingContent } = useCreateDigestContentItemMutation(
    props.mode === 'create' && props.digestId ? props.digestId : null
  );

  const isPending = Boolean(updateMutation.isPending || deleteMutation.isPending || isCreatingDigest || isCreatingContent);

  // Hydrate edit mode fields from props.content.
  useEffect(() => {
    if (!isEdit || !editContent) return;
    setLength(editContent.length);
    setSelectedTopics(new Set(editContent.topics || []));
  }, [isEdit, editContentId]);

  // draft change callback (create mode only)
  useEffect(() => {
    if (props.mode !== 'create') return;
    onCreateDraftChange?.({ length, topics: buildTopicsFromSet(selectedTopics) });
  }, [props.mode, onCreateDraftChange, length, selectedTopics]);

  const selectedTopicsArray = useMemo(() => buildTopicsFromSet(selectedTopics), [selectedTopics]);
  // NOTE: we intentionally do NOT persist edits on change.
  // Edits are saved only when the user presses the "Save content" button.

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const topics = selectedTopicsArray;
    if (!validateTopics(topics)) {
      toast.error('Select at least one topic');
      return;
    }

    try {
      if (props.mode === 'create') {
        if (!props.digestId) {
          const created = await createDigestAndFirst({ length, topics });
          props.onCreated({ digestId: created.digestId, content: created.content });
          toast.success('Content saved');
          return;
        }

        const created = await createContentItem({ length, topics });
        props.onCreated({ digestId: props.digestId, content: created });
        toast.success('Content saved');
        return;
      }

      // edit mode
      props.onSavingStart?.();
      updateMutation
        .mutateAsync({ length, topics })
        .then((saved) => {
          onEditSaved?.(saved);
          toast.success('Content saved');
        })
        .catch(() => {
          toast.error('Could not save content');
        });
      return;
    } catch {
      toast.error('Could not save content');
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    try {
      await deleteMutation.mutateAsync(props.content.contentId);
      toast.success('Content removed');
      props.onDelete();
    } catch {
      toast.error('Could not remove content');
    }
  }

  function handleDiscardDraft() {
    if (props.mode !== 'create') return;
    props.onCancel?.();
  }

  // Keep edit mode parent state in sync with local editing changes.
  useEffect(() => {
    if (!isEdit) return;
    const nextTopics = selectedTopicsArray;
    if (!editContent || !onEditChange) return;
    onEditChange({ ...editContent, length, topics: nextTopics });
  }, [isEdit, length, selectedTopicsArray]);

  const canSubmit = validateTopics(selectedTopicsArray);

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <FieldBlock>
          <FieldLabel>Length</FieldLabel>
          <SegmentedControl
            options={PROMPT_LENGTH_SEGMENT_OPTIONS}
            value={length}
            onChange={(v) => setLength(v as PromptLength)}
            disabled={isPending}
          />
        </FieldBlock>

        <FieldBlock>
          <FieldLabel>Topics</FieldLabel>
          <FieldHint>Select one or more areas to include in your digest.</FieldHint>
          <ChipGrid role="group" aria-label="Topics">
            {PROMPT_TOPIC_OPTIONS.map((topic) => {
              const selected = selectedTopics.has(topic);
              return (
                <TopicChip
                  key={topic}
                  type="button"
                  $selected={selected}
                  disabled={isPending}
                  aria-pressed={selected}
                  onClick={() => toggleTopic(topic)}
                >
                  {selected ? <span aria-hidden="true">✓</span> : null}
                  {topic}
                </TopicChip>
              );
            })}
          </ChipGrid>
        </FieldBlock>

        <FooterRow>
          <Button
            type="submit"
            size="medium"
            isResponsive={false}
            disabled={isPending || !canSubmit}
            text={isPending ? 'Saving…' : 'Save content'}
            style={{ padding: '0.5rem 0.875rem', fontSize: '0.875rem' }}
          />
          {isEdit ? (
            <RemoveCircleButton type="button" onClick={handleDelete} disabled={isPending}>
              <TrashIcon />
            </RemoveCircleButton>
          ) : props.onCancel ? (
            <RemoveCircleButton
              type="button"
              onClick={handleDiscardDraft}
              disabled={isPending}
              aria-label="Remove unsaved content"
              title="Remove unsaved content"
            >
              <TrashIcon />
            </RemoveCircleButton>
          ) : null}
        </FooterRow>
      </Row>
    </Form>
  );
}

