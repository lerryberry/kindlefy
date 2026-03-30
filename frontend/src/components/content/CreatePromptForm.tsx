import ContentItemForm from './ContentItemForm';

interface CreatePromptFormProps {
  /** When set, a digest is already created; this wrapper will create an additional content item. */
  digestId: string | null;
  onCreated: (digestId: string) => void;
}

/**
 * Backwards compatibility wrapper.
 * The app now uses multi-content digest editing via `DigestContentsAccordion` + `ContentItemForm`.
 */
export default function CreatePromptForm({ digestId, onCreated }: CreatePromptFormProps) {
  return (
    <ContentItemForm
      mode="create"
      digestId={digestId}
      onCreated={(result) => {
        onCreated(result.digestId);
      }}
    />
  );
}

