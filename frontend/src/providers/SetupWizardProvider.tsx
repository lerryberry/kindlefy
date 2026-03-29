import React, { useCallback, useMemo, useState } from 'react';
import { SetupWizardContext } from './setupWizardContext';

const PROMPT_KEY = 'kindlefy_setup_promptId';
const TIMING_KEY = 'kindlefy_setup_timingId';

function readStored(key: string): string | null {
  try {
    const v = sessionStorage.getItem(key);
    return v && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function SetupWizardProvider({ children }: { children: React.ReactNode }) {
  const [promptId, setPromptIdState] = useState<string | null>(() => readStored(PROMPT_KEY));
  const [timingId, setTimingIdState] = useState<string | null>(() => readStored(TIMING_KEY));

  const setPromptId = useCallback((id: string | null) => {
    setPromptIdState(id);
    try {
      if (id) sessionStorage.setItem(PROMPT_KEY, id);
      else sessionStorage.removeItem(PROMPT_KEY);
    } catch {
      /* ignore */
    }
    setTimingIdState(null);
    try {
      sessionStorage.removeItem(TIMING_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const setTimingId = useCallback((id: string | null) => {
    setTimingIdState(id);
    try {
      if (id) sessionStorage.setItem(TIMING_KEY, id);
      else sessionStorage.removeItem(TIMING_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const selectDigest = useCallback((p: string, t: string) => {
    setPromptIdState(p);
    setTimingIdState(t);
    try {
      sessionStorage.setItem(PROMPT_KEY, p);
      sessionStorage.setItem(TIMING_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ promptId, setPromptId, timingId, setTimingId, selectDigest }),
    [promptId, setPromptId, timingId, setTimingId, selectDigest]
  );

  return <SetupWizardContext.Provider value={value}>{children}</SetupWizardContext.Provider>;
}
