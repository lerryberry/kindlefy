import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Form from '../util/Form';
import SetupFormSubmit from '../util/SetupFormSubmit';
import SegmentedControl from '../util/SegmentedControl';
import { useCreatePromptMutation, usePromptsQuery, useUpdatePromptMutation } from '../../hooks/usePrompts';
import {
  PROMPT_LENGTH_SEGMENT_OPTIONS,
  type PromptLength,
} from '../../utils/promptLength';
import { PROMPT_TOPIC_OPTIONS } from '../../constants/promptTopics';

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
  background-color: ${(p) =>
    p.$selected ? 'var(--color-brand-500)' : 'var(--color-background-tertiary)'};
  color: ${(p) => (p.$selected ? 'var(--color-text-inverse)' : 'var(--color-text-primary)')};
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--color-brand-500);
    background-color: ${(p) =>
      p.$selected ? 'var(--color-brand-400)' : 'var(--color-background-secondary)'};
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

const LoadingLine = styled.p`
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
`;

interface CreatePromptFormProps {
  /** When set, form loads topics/length from this prompt and updates on save. */
  activePromptId: string | null;
  onCreated: (promptId: string) => void;
}

export default function CreatePromptForm({ activePromptId, onCreated }: CreatePromptFormProps) {
  const { data: promptsRes, isLoading: promptsLoading } = usePromptsQuery();
  const { mutateAsync: createPrompt, isPending: isCreating } = useCreatePromptMutation();
  const { mutateAsync: updatePrompt, isPending: isUpdating } = useUpdatePromptMutation();

  const existing = useMemo(
    () =>
      activePromptId && promptsRes?.data?.find((p) => p._id === activePromptId),
    [activePromptId, promptsRes?.data]
  );

  /** Stable across refetches so we don’t reset local edits when only the query cache object identity changes. */
  const syncSignature = useMemo(() => {
    if (!activePromptId || !existing || existing._id !== activePromptId) return '';
    const topicsKey = [...(existing.topics || [])].sort().join('\0');
    return `${existing._id}|${existing.length}|${topicsKey}`;
  }, [activePromptId, existing]);

  const [length, setLength] = useState<PromptLength>('medium');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => new Set());
  const lastHydratedSig = useRef<string | null>(null);

  useEffect(() => {
    if (!activePromptId) {
      lastHydratedSig.current = null;
      setLength('medium');
      setSelectedTopics(new Set());
      return;
    }
    if (!syncSignature || !existing || existing._id !== activePromptId) {
      if (!promptsLoading) {
        lastHydratedSig.current = null;
        setLength('medium');
        setSelectedTopics(new Set());
      }
      return;
    }
    if (lastHydratedSig.current === syncSignature) return;
    lastHydratedSig.current = syncSignature;
    setLength(existing.length);
    setSelectedTopics(
      new Set(PROMPT_TOPIC_OPTIONS.filter((t) => (existing.topics || []).includes(t)))
    );
  }, [activePromptId, syncSignature, promptsLoading, existing]);

  const isPending = isCreating || isUpdating;
  const waitingForPrompt = Boolean(activePromptId && promptsLoading && !promptsRes);

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
    const topics = PROMPT_TOPIC_OPTIONS.filter((t) => selectedTopics.has(t));
    if (topics.length === 0) {
      toast.error('Select at least one topic');
      return;
    }
    try {
      const editing =
        Boolean(activePromptId && existing && existing._id === activePromptId);
      if (editing) {
        await updatePrompt({ id: activePromptId, body: { length, topics } });
        toast.success('Prompt saved');
        onCreated(activePromptId);
      } else {
        const created = await createPrompt({ length, topics });
        toast.success('Prompt saved');
        onCreated(created._id);
      }
    } catch {
      toast.error('Could not save prompt');
    }
  }

  if (waitingForPrompt) {
    return <LoadingLine>Loading prompt…</LoadingLine>;
  }

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
                  {selected ? (
                    <span aria-hidden="true">✔️</span>
                  ) : null}
                  {topic}
                </TopicChip>
              );
            })}
          </ChipGrid>
        </FieldBlock>
        <SetupFormSubmit pending={isPending} label="Save prompt" />
      </Row>
    </Form>
  );
}
