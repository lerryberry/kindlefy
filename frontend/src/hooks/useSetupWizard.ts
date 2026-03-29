import { useContext } from 'react';
import { SetupWizardContext } from '../providers/setupWizardContext';

export function useSetupWizard() {
  const ctx = useContext(SetupWizardContext);
  if (!ctx) {
    throw new Error('useSetupWizard must be used within SetupWizardProvider');
  }
  return ctx;
}
