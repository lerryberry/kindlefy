export type TimezoneOption = {
  value: string;
  label: string;
};

export const SCHEDULE_TIMEZONE_OPTIONS: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Europe/London (UK)' },
  { value: 'Europe/Dublin', label: 'Europe/Dublin (Ireland)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (Central Europe)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (Central Europe)' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid (Spain)' },
  { value: 'Europe/Rome', label: 'Europe/Rome (Italy)' },
  { value: 'Europe/Athens', label: 'Europe/Athens (Greece)' },
  { value: 'America/New_York', label: 'America/New_York (US Eastern)' },
  { value: 'America/Chicago', label: 'America/Chicago (US Central)' },
  { value: 'America/Denver', label: 'America/Denver (US Mountain)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (US Pacific)' },
  { value: 'America/Toronto', label: 'America/Toronto (Canada Eastern)' },
  { value: 'America/Vancouver', label: 'America/Vancouver (Canada Pacific)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (Brazil)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (South Africa)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (UAE)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan)' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul (South Korea)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (New Zealand)' },
];

const TIMEZONE_VALUE_SET = new Set(SCHEDULE_TIMEZONE_OPTIONS.map((o) => o.value));

export function coerceScheduleTimezone(input: string | null | undefined): string {
  const value = (input || '').trim();
  if (value && TIMEZONE_VALUE_SET.has(value)) return value;
  return 'UTC';
}

export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function detectPreferredScheduleTimezone(): string {
  return coerceScheduleTimezone(detectBrowserTimezone());
}
