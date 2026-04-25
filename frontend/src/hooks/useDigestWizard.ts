import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const SELECTED_TIMING_KEY_PREFIX = 'kindlefy_digest_selectedTimingId:';
const APPROVE_SENDER_NEXT_KEY_PREFIX = 'kindlefy_digest_approveSenderNext:';

function readStored(key: string): string | null {
  try {
    const v = sessionStorage.getItem(key);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

/** Client-only: stepper tick for Approve sender after Next is pressed on that step. */
export function readApproveSenderNextPressed(digestId: string | null): boolean {
  if (!digestId) return false;
  try {
    return sessionStorage.getItem(APPROVE_SENDER_NEXT_KEY_PREFIX + digestId) === '1';
  } catch {
    return false;
  }
}

export function markApproveSenderNextPressed(digestId: string) {
  try {
    sessionStorage.setItem(APPROVE_SENDER_NEXT_KEY_PREFIX + digestId, '1');
  } catch {
    /* ignore */
  }
}

export function useDigestWizard() {
  const params = useParams();
  const digestId = params.digestId ? String(params.digestId) : null;

  const [selectedTimingId, setSelectedTimingIdState] = useState<string | null>(() => {
    if (!digestId) return null;
    return readStored(SELECTED_TIMING_KEY_PREFIX + digestId);
  });

  useEffect(() => {
    if (!digestId) {
      setSelectedTimingIdState(null);
      return;
    }
    setSelectedTimingIdState(readStored(SELECTED_TIMING_KEY_PREFIX + digestId));
  }, [digestId]);

  const setSelectedTimingId = (id: string | null) => {
    setSelectedTimingIdState(id);
    try {
      if (!digestId) return;
      const key = SELECTED_TIMING_KEY_PREFIX + digestId;
      if (id) sessionStorage.setItem(key, id);
      else sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  };

  return useMemo(
    () => ({
      digestId,
      selectedTimingId,
      setSelectedTimingId,
    }),
    [digestId, selectedTimingId]
  );
}

