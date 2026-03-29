import { useState } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Form from '../util/Form';
import Button from '../util/Button';
import SegmentedControl from '../util/SegmentedControl';
import { useCreatePromptMutation } from '../../hooks/usePrompts';
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

const Actions = styled.div`
  margin-top: 0.5rem;
`;

interface CreatePromptFormProps {
  onCreated: (promptId: string) => void;
}

export default function CreatePromptForm({ onCreated }: CreatePromptFormProps) {
  const { mutateAsync, isPending } = useCreatePromptMutation();
  const [length, setLength] = useState<PromptLength>('medium');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => new Set());

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
    const topics = Array.from(selectedTopics);
    if (topics.length === 0) {
      toast.error('Select at least one topic');
      return;
    }
    try {
      const created = await mutateAsync({
        length,
        topics,
      });
      toast.success('Prompt saved');
      onCreated(created._id);
    } catch {
      toast.error('Could not save prompt');
    }
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
                  {topic}
                </TopicChip>
              );
            })}
          </ChipGrid>
        </FieldBlock>
        <Actions>
          <Button type="submit" text={isPending ? 'Saving…' : 'Save prompt'} disabled={isPending} isResponsive />
        </Actions>
      </Row>
    </Form>
  );
}
