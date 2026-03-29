import { createContext } from 'react';

export interface SetupWizardContextValue {
  promptId: string | null;
  setPromptId: (id: string | null) => void;
  timingId: string | null;
  setTimingId: (id: string | null) => void;
  /** Set both ids when opening an existing digest from the list (does not clear timing). */
  selectDigest: (promptId: string, timingId: string) => void;
}

export const SetupWizardContext = createContext<SetupWizardContextValue | null>(null);
