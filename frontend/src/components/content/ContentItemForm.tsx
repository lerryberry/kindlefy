import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import Form from '../util/Form';
import Button from '../util/Button';
import FormInput from '../util/FormInput';
import SegmentedControl from '../util/SegmentedControl';
import WordCountSlider from './WordCountSlider';
import LocationPlacesField from './LocationPlacesField';
import {
  useCreateDigestAndFirstContentItemMutation,
  useCreateDigestContentItemMutation,
  useUpdateDigestContentItemMutation,
  useDeleteDigestContentItemMutation,
} from '../../hooks/useDigests';
import {
  DEFAULT_NEWS_SCOPE,
  NEWS_SCOPE_SEGMENT_OPTIONS,
  type NewsScope,
} from '../../constants/newsScope';
import { PROMPT_TOPIC_OPTIONS } from '../../constants/promptTopics';
import { clampWordCount, DEFAULT_WORD_COUNT } from '../../utils/promptLength';
import type { DigestContentItem, LocationCoordinates } from '../../types/digest';

const MAX_SPECIAL_INTEREST_WORDS = 15;

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

const FieldCaption = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
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

/** Wraps segmented control so three labels fit on small screens. */
const NewsScopeSegmentWrap = styled.div`
  width: 100%;
  & > div > button {
    font-size: 0.8125rem;
    padding: 0.6rem 0.45rem;
    line-height: 1.25;
    min-width: 0;
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

type DraftFields = {
  length: number;
  topics: string[];
  newsScope: NewsScope;
  locationText: string;
  specialInterestText: string;
};

type EditModeProps = {
  mode: 'edit';
  digestId: string;
  content: DigestContentItem;
  onChange: (next: DigestContentItem) => void;
  onSaved?: (saved: DigestContentItem) => void;
  /** Close the accordion immediately when the user clicks "Save section". */
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

function validateLocationForScope(newsScope: NewsScope, locationText: string) {
  if (newsScope === 'global' || newsScope === 'special') return true;
  return locationText.trim().length >= 2;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isPresetTopic(topic: string) {
  return (PROMPT_TOPIC_OPTIONS as readonly string[]).includes(topic);
}

function splitTopicsForForm(topics: string[]) {
  const selected = new Set<string>();
  let specialInterestText = '';
  for (const topic of topics || []) {
    if (isPresetTopic(topic)) {
      selected.add(topic);
    } else if (!specialInterestText) {
      specialInterestText = topic;
    }
  }
  return { selected, specialInterestText };
}

function buildContentPayload(
  wordCount: number,
  topics: string[],
  newsScope: NewsScope,
  locationText: string,
  locationCoordinates: LocationCoordinates,
  locationTimezone: string,
  specialInterestText: string
) {
  const isGlobal = newsScope === 'global';
  const normalizedSpecialInterest = specialInterestText.trim();
  const baseTopics = newsScope === 'special' ? [] : topics;
  const mergedTopics =
    newsScope === 'special' && normalizedSpecialInterest
      ? [normalizedSpecialInterest]
      : baseTopics;
  return {
    length: wordCount,
    topics: mergedTopics,
    newsScope,
    locationText: isGlobal || newsScope === 'special' ? '' : locationText.trim(),
    locationCoordinates:
      isGlobal || newsScope === 'special' ? { lat: null, lng: null } : locationCoordinates,
    locationTimezone: isGlobal || newsScope === 'special' ? '' : locationTimezone,
  };
}

function buildTopicsFromSet(selectedTopics: Set<string>) {
  // Keep backend-normalized order stable (follow the preset option order).
  return PROMPT_TOPIC_OPTIONS.filter((t) => selectedTopics.has(t));
}

export default function ContentItemForm(props: ContentItemFormProps) {
  const isEdit = props.mode === 'edit';
  const onCreateDraftChange = props.mode === 'create' ? props.onDraftChange : undefined;

  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(() => new Set());
  const [wordCount, setWordCount] = useState(DEFAULT_WORD_COUNT);
  const [newsScope, setNewsScope] = useState<NewsScope>(DEFAULT_NEWS_SCOPE);
  const [locationText, setLocationText] = useState('');
  const [locationCoordinates, setLocationCoordinates] = useState<LocationCoordinates>({ lat: null, lng: null });
  const [locationTimezone, setLocationTimezone] = useState('');
  const [specialInterestText, setSpecialInterestText] = useState('');

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

  // Hydrate edit mode fields when switching items (avoid resetting on unrelated parent re-renders).
  useEffect(() => {
    if (!isEdit || !editContent) return;
    const { selected, specialInterestText: initialSpecialInterest } = splitTopicsForForm(editContent.topics || []);
    setWordCount(clampWordCount(editContent.length));
    setSelectedTopics(selected);
    setSpecialInterestText(initialSpecialInterest);
    setNewsScope(editContent.newsScope ?? DEFAULT_NEWS_SCOPE);
    setLocationText(editContent.locationText ?? '');
    setLocationCoordinates(editContent.locationCoordinates ?? { lat: null, lng: null });
    setLocationTimezone(editContent.locationTimezone ?? '');
  }, [isEdit, editContentId]);

  // draft change callback (create mode only)
  useEffect(() => {
    if (props.mode !== 'create') return;
    onCreateDraftChange?.({
      length: wordCount,
      topics:
        newsScope === 'special' && specialInterestText.trim()
          ? [...buildTopicsFromSet(selectedTopics), specialInterestText.trim()]
          : buildTopicsFromSet(selectedTopics),
      newsScope,
      locationText,
      specialInterestText,
    });
  }, [props.mode, onCreateDraftChange, wordCount, selectedTopics, newsScope, locationText, specialInterestText]);

  const selectedTopicsArray = useMemo(() => buildTopicsFromSet(selectedTopics), [selectedTopics]);
  // NOTE: we intentionally do NOT persist edits on change.
  // Edits are saved only when the user presses the "Save section" button.

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
    const topics =
      newsScope === 'special' && specialInterestText.trim()
        ? [...selectedTopicsArray, specialInterestText.trim()]
        : selectedTopicsArray;
    if (!validateTopics(topics)) {
      toast.error('Select at least one topic');
      return;
    }
    if (newsScope === 'special') {
      const words = countWords(specialInterestText);
      if (words === 0) {
        toast.error('Enter a special-interest topic');
        return;
      }
      if (words > MAX_SPECIAL_INTEREST_WORDS) {
        toast.error(`Special-interest topic must be ${MAX_SPECIAL_INTEREST_WORDS} words or fewer`);
        return;
      }
    }
    if (!validateLocationForScope(newsScope, locationText)) {
      toast.error('Enter your address down to at least town or city level');
      return;
    }

    const payload = buildContentPayload(
      wordCount,
      selectedTopicsArray,
      newsScope,
      locationText,
      locationCoordinates,
      locationTimezone,
      specialInterestText
    );

    try {
      if (props.mode === 'create') {
        if (!props.digestId) {
          const created = await createDigestAndFirst(payload);
          props.onCreated({ digestId: created.digestId, content: created.content });
          toast.success('Section saved');
          return;
        }

        const created = await createContentItem(payload);
        props.onCreated({ digestId: props.digestId, content: created });
        toast.success('Section saved');
        return;
      }

      // edit mode
      props.onSavingStart?.();
      updateMutation
        .mutateAsync(payload)
        .then((saved) => {
          onEditSaved?.(saved);
          toast.success('Section saved');
        })
        .catch(() => {
          toast.error('Could not save section');
        });
      return;
    } catch {
      toast.error('Could not save section');
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    try {
      await deleteMutation.mutateAsync(props.content.contentId);
      toast.success('Section removed');
      props.onDelete();
    } catch {
      toast.error('Could not remove section');
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
    onEditChange({
      ...editContent,
      ...buildContentPayload(
        wordCount,
        nextTopics,
        newsScope,
        locationText,
        locationCoordinates,
        locationTimezone,
        specialInterestText
      ),
    });
  }, [
    isEdit,
    wordCount,
    selectedTopicsArray,
    newsScope,
    locationText,
    locationCoordinates,
    locationTimezone,
    specialInterestText,
  ]);

  const showLocationField = newsScope === 'country' || newsScope === 'local';

  const canSubmit =
    validateTopics(
      newsScope === 'special' && specialInterestText.trim()
        ? [...selectedTopicsArray, specialInterestText.trim()]
        : selectedTopicsArray
    ) &&
    validateLocationForScope(newsScope, locationText) &&
    (newsScope !== 'special' ||
      (countWords(specialInterestText) > 0 &&
        countWords(specialInterestText) <= MAX_SPECIAL_INTEREST_WORDS));

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <FieldBlock>
          <FieldCaption>News scope</FieldCaption>
          <NewsScopeSegmentWrap>
            <SegmentedControl
              options={NEWS_SCOPE_SEGMENT_OPTIONS}
              value={newsScope}
              onChange={(v) => {
                const nextScope = v as NewsScope;
                setNewsScope(nextScope);
                if (nextScope === 'global' || nextScope === 'special') {
                  setLocationText('');
                  setLocationCoordinates({ lat: null, lng: null });
                  setLocationTimezone('');
                }
                if (nextScope === 'special') {
                  setSelectedTopics(new Set());
                }
              }}
              disabled={isPending}
            />
          </NewsScopeSegmentWrap>
        </FieldBlock>

        {newsScope === 'special' ? (
          <FieldBlock>
            <FormInput
              label={`Special interest (up to ${MAX_SPECIAL_INTEREST_WORDS} words)`}
              name="specialInterestText"
              value={specialInterestText}
              onChange={(e) => setSpecialInterestText(e.target.value)}
              placeholder="e.g. UK startup funding trends in climate tech"
              maxLength={300}
              disabled={isPending}
            />
          </FieldBlock>
        ) : null}

        {showLocationField ? (
          <FieldBlock>
            <FieldCaption as="label" htmlFor="content-location-text">
              Location
            </FieldCaption>
            <LocationPlacesField
              locationText={locationText}
              onLocationTextChange={setLocationText}
              lookupScope={newsScope === 'country' ? 'country' : 'local'}
              onLocationResolved={(resolved) => {
                setLocationCoordinates(resolved.coordinates ?? { lat: null, lng: null });
                const offsetMins = resolved.utcOffsetMinutes;
                if (offsetMins !== null) {
                  const sign = offsetMins >= 0 ? '+' : '-';
                  const h = Math.floor(Math.abs(offsetMins) / 60);
                  const m = Math.abs(offsetMins) % 60;
                  setLocationTimezone(`UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                } else {
                  setLocationTimezone('');
                }
              }}
              disabled={isPending}
            />
          </FieldBlock>
        ) : null}

        <FieldBlock>
          <FieldCaption as="label" htmlFor="content-word-count">
            Word count
          </FieldCaption>
          <WordCountSlider
            id="content-word-count"
            value={wordCount}
            onChange={setWordCount}
            disabled={isPending}
          />
        </FieldBlock>

        {newsScope !== 'special' ? (
          <FieldBlock>
            <FieldCaption>Topics</FieldCaption>
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
        ) : null}

        <FooterRow>
          <Button
            type="submit"
            size="medium"
            isResponsive={false}
            disabled={isPending || !canSubmit}
            text={isPending ? 'Saving…' : 'Save section'}
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
              aria-label="Remove unsaved section"
              title="Remove unsaved section"
            >
              <TrashIcon />
            </RemoveCircleButton>
          ) : null}
        </FooterRow>
      </Row>
    </Form>
  );
}

