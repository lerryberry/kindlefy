import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import FormInput from '../util/FormInput';
import { useAuthenticatedAxios } from '../../api/services/useAuthenticatedAxios';
import { usePlacesEnabledQuery, type PlaceSuggestion } from '../../hooks/usePlaces';

const SearchWrap = styled.div`
  position: relative;
  width: 100%;
`;

const dropdownListCss = `
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 240px;
  overflow-y: auto;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border-primary);
  background: var(--color-background-secondary);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
`;

const SuggestionsListPortal = styled.ul`
  ${dropdownListCss}
  position: fixed;
  z-index: 10050;
`;

const SuggestionItem = styled.li`
  padding: 0.65rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-primary);

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &[aria-selected='true'] {
    background: var(--color-background-tertiary);
  }
`;

const LoadingRow = styled.li`
  padding: 0.65rem 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  cursor: default;
`;

const SearchBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
`;

type LocationPlacesFieldProps = {
  locationText: string;
  onLocationTextChange: (value: string) => void;
  disabled?: boolean;
};

function newSessionToken() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type MenuRect = { top: number; left: number; width: number };

const LOCATION_FIELD_ID = 'content-location-text';

/** Text sent to Places autocomplete (whole field; typical entries are one line). */
function autocompleteInputFromLocationText(text: string) {
  return text.trim().slice(0, 200);
}

export default function LocationPlacesField({
  locationText,
  onLocationTextChange,
  disabled = false,
}: LocationPlacesFieldProps) {
  const api = useAuthenticatedAxios();
  const { data: placesConfigured } = usePlacesEnabledQuery();
  const listId = useId();

  const anchorRef = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);

  const sessionTokenRef = useRef(newSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autocompleteReqIdRef = useRef(0);
  const suppressNextAutocompleteRef = useRef(false);
  const hasInteractedRef = useRef(false);
  const lastSentInputRef = useRef('');

  const canAutocomplete = placesConfigured === true;

  const updateMenuRect = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setMenuRect({
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 200),
    });
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurCloseRef.current) clearTimeout(blurCloseRef.current);
    };
  }, []);

  const runAutocomplete = useCallback(
    async (input: string) => {
      if (!canAutocomplete || input.length < 2) {
        setSuggestions([]);
        return;
      }
      const reqId = ++autocompleteReqIdRef.current;
      setLoading(true);
      try {
        const res = await api.post<{ data: { suggestions: PlaceSuggestion[] } }>('/places/autocomplete', {
          input,
          sessionToken: sessionTokenRef.current,
        });
        if (reqId !== autocompleteReqIdRef.current) return;
        setSuggestions(res.data.data.suggestions || []);
        setOpen(true);
        setHighlight(-1);
      } catch {
        if (reqId !== autocompleteReqIdRef.current) return;
        setSuggestions([]);
      } finally {
        if (reqId === autocompleteReqIdRef.current) {
          setLoading(false);
        }
      }
    },
    [api, canAutocomplete]
  );

  const acInput = autocompleteInputFromLocationText(locationText);

  useEffect(() => {
    if (!canAutocomplete || !hasInteractedRef.current) return;
    if (suppressNextAutocompleteRef.current) {
      suppressNextAutocompleteRef.current = false;
      lastSentInputRef.current = acInput;
      return;
    }
    const charsDiff = Math.abs(acInput.length - lastSentInputRef.current.length);
    if (charsDiff < 2 && acInput.length >= 2) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastSentInputRef.current = acInput;
      void runAutocomplete(acInput);
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [acInput, canAutocomplete, runAutocomplete]);

  const showDropdown =
    open && canAutocomplete && acInput.length >= 2 && (loading || suggestions.length > 0);

  useLayoutEffect(() => {
    if (!showDropdown) {
      setMenuRect(null);
      return;
    }
    updateMenuRect();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => updateMenuRect()) : null;
    if (anchorRef.current && ro) ro.observe(anchorRef.current);

    const onScroll = () => updateMenuRect();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      ro?.disconnect();
    };
  }, [showDropdown, updateMenuRect, suggestions.length, loading]);

  const pickSuggestion = async (s: PlaceSuggestion) => {
    setOpen(false);
    setSuggestions([]);
    setMenuRect(null);
    setLoading(true);
    suppressNextAutocompleteRef.current = true;
    try {
      const res = await api.post<{ data: { plainText: string } }>('/places/resolve', {
        placeId: s.placeId,
        sessionToken: sessionTokenRef.current,
      });
      suppressNextAutocompleteRef.current = true;
      onLocationTextChange(res.data.data.plainText);
      sessionTokenRef.current = newSessionToken();
    } catch {
      suppressNextAutocompleteRef.current = true;
      onLocationTextChange(s.label);
    } finally {
      setLoading(false);
    }
  };

  const onLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!showDropdown) return;
    const navigableCount = loading ? 0 : suggestions.length;
    if (navigableCount === 0) {
      if (e.key === 'Escape') setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % navigableCount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? navigableCount - 1 : h - 1));
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      void pickSuggestion(suggestions[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const renderDropdownContent = () => {
    if (loading && suggestions.length === 0) {
      return <LoadingRow role="status">Searching places…</LoadingRow>;
    }
    return suggestions.map((s, i) => (
      <SuggestionItem
        key={s.placeId}
        role="option"
        aria-selected={i === highlight}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => void pickSuggestion(s)}
      >
        {s.label}
      </SuggestionItem>
    ));
  };

  const dropdownNode =
    showDropdown && menuRect && typeof document !== 'undefined'
      ? createPortal(
          <SuggestionsListPortal
            id={listId}
            role="listbox"
            aria-label="Place suggestions"
            style={{
              top: menuRect.top,
              left: menuRect.left,
              width: menuRect.width,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {renderDropdownContent()}
          </SuggestionsListPortal>,
          document.body
        )
      : null;

  const placeholder = canAutocomplete
    ? 'Type a town (e.g. Bristol)'
    : 'Town, region, country';

  return (
    <SearchBlock>
      <SearchWrap ref={anchorRef}>
        <FormInput
          componentType="input"
          type="text"
          id={LOCATION_FIELD_ID}
          name="locationText"
          placeholder={placeholder}
          value={locationText}
          onChange={(e) => {
            hasInteractedRef.current = true;
            onLocationTextChange(e.target.value);
            if (canAutocomplete) setOpen(true);
          }}
          onFocus={() => {
            if (!canAutocomplete) return;
            hasInteractedRef.current = true;
            setOpen(true);
            if (acInput.length >= 2) {
              void runAutocomplete(acInput);
            }
          }}
          onBlur={() => {
            blurCloseRef.current = setTimeout(() => {
              setOpen(false);
              setMenuRect(null);
            }, 200);
          }}
          onKeyDown={onLocationKeyDown}
          disabled={disabled}
          maxLength={500}
          autoComplete="nope"
          aria-autocomplete={canAutocomplete ? 'list' : undefined}
          aria-expanded={canAutocomplete ? showDropdown : undefined}
          aria-controls={canAutocomplete ? listId : undefined}
          role={canAutocomplete ? 'combobox' : undefined}
        />
        {canAutocomplete ? dropdownNode : null}
      </SearchWrap>
    </SearchBlock>
  );
}
