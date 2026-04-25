import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Form from '../util/Form';
import SegmentedControl from '../util/SegmentedControl';
import SetupFormSubmit from '../util/SetupFormSubmit';
import { useDigestWizard } from '../../hooks/useDigestWizard';
import { useCreateDigestTimingMutation, useDigestTimingsQuery, useUpdateDigestTimingScheduleMutation } from '../../hooks/useDigests';
import type { Schedule } from '../../types/timing';
import {
  SCHEDULE_TIMEZONE_OPTIONS,
  coerceScheduleTimezone,
  detectBrowserTimezone,
  detectPreferredScheduleTimezone,
} from '../../constants/timezones';

const SCHEDULE_FREQUENCY = 'daily' as const;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const FieldLabel = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const TimezoneSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--color-background-tertiary);
  color: var(--color-text-primary);
  transition: border-color 0.2s ease-in-out;

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 0.875rem;
  }

  &:hover {
    border-color: var(--color-border-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    background-color: var(--color-background-secondary);
    cursor: not-allowed;
  }
`;

const TimePickersRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  width: 100%;
`;

const TimePickerField = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTE_OPTIONS = ['00', '30'] as const;

/** Snap legacy or odd values to the nearest half-hour (00 / 30). */
function snapTimeOfDayToHalfHour(raw: string): string {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec((raw || '').trim());
  if (!m) return '09:00';
  let h = parseInt(m[1], 10);
  const mn = parseInt(m[2], 10);
  if (mn < 15) return `${String(h).padStart(2, '0')}:00`;
  if (mn < 45) return `${String(h).padStart(2, '0')}:30`;
  h = (h + 1) % 24;
  return `${String(h).padStart(2, '0')}:00`;
}

function parseTimeOfDay(hhmm: string): { hour: string; minute: string } {
  const normalized = snapTimeOfDayToHalfHour(hhmm);
  const [h, mm] = normalized.split(':');
  return { hour: h, minute: mm };
}

function defaultTimezone(): string {
  return detectPreferredScheduleTimezone();
}

export default function TimingForm() {
  const navigate = useNavigate();
  const { digestId, selectedTimingId, setSelectedTimingId } = useDigestWizard();
  const { data: timingsData, isLoading } = useDigestTimingsQuery(digestId);
  const timings = timingsData?.timings;
  const resolvedTimingId = selectedTimingId || timings?.[0]?.timingId || null;

  const { mutateAsync: createTiming, isPending: isCreating } = useCreateDigestTimingMutation(digestId);
  const { mutateAsync: updateTiming, isPending: isUpdating } = useUpdateDigestTimingScheduleMutation(digestId);

  const [timezone, setTimezone] = useState(defaultTimezone());
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const browserTimezone = useMemo(() => detectBrowserTimezone(), []);

  const currentSchedule = useMemo(() => {
    if (!resolvedTimingId) return null;
    const found = timings?.find((t) => t.timingId === resolvedTimingId);
    return found?.schedule ?? null;
  }, [timings, resolvedTimingId]);

  useEffect(() => {
    if (!digestId) return;
    if (!resolvedTimingId || !currentSchedule) {
      setTimezone(defaultTimezone());
      setTimeOfDay('09:00');
      return;
    }
    setTimezone(coerceScheduleTimezone(currentSchedule.timezone || defaultTimezone()));
    setTimeOfDay(snapTimeOfDayToHalfHour(currentSchedule.timeOfDay || '09:00'));
  }, [digestId, resolvedTimingId, currentSchedule]);

  useEffect(() => {
    // Ensure selection is stable when a user arrives on `/.../schedule` without a persisted selection.
    if (resolvedTimingId && !selectedTimingId) {
      setSelectedTimingId(resolvedTimingId);
    }
  }, [resolvedTimingId, selectedTimingId, setSelectedTimingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!digestId) {
      toast.error('Missing digest');
      return;
    }
    const schedule: Schedule = {
      timezone: coerceScheduleTimezone(timezone),
      timeOfDay: timeOfDay.trim(),
      frequency: SCHEDULE_FREQUENCY,
    };
    if (!/^([01]\d|2[0-3]):(00|30)$/.test(schedule.timeOfDay)) {
      toast.error('Time must be HH:mm with minutes 00 or 30');
      return;
    }
    try {
      if (resolvedTimingId) {
        await updateTiming({
          timingId: resolvedTimingId,
          body: { schedule },
        });
        toast.success('Schedule updated');
      } else {
        const created = await createTiming({
          schedule,
        });
        toast.success('Schedule saved');
        setSelectedTimingId(created.timingId);
      }
      navigate(`/${digestId}/targets`);
    } catch {
      toast.error('Could not save schedule');
    }
  }

  if (isLoading) {
    return <p>Loading…</p>;
  }

  const pending = isCreating || isUpdating;
  const { hour: timeHour, minute: timeMinute } = parseTimeOfDay(timeOfDay);

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <FieldGroup>
          <FieldLabel as="label" htmlFor="schedule-timezone">
            Timezone
          </FieldLabel>
          <TimezoneSelect
            id="schedule-timezone"
            name="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            required
            disabled={pending}
          >
            {SCHEDULE_TIMEZONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TimezoneSelect>
          <FieldLabel style={{ fontWeight: 400 }}>
            Detected from browser: {browserTimezone}
          </FieldLabel>
        </FieldGroup>
        <div>
          <FieldLabel>Frequency</FieldLabel>
          <div style={{ marginTop: '0.5rem' }}>
            <SegmentedControl
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly', disabled: true },
                { value: 'monthly', label: 'Monthly', disabled: true },
              ]}
              value={SCHEDULE_FREQUENCY}
            />
          </div>
        </div>
        <FieldGroup>
          <FieldLabel as="span" id="schedule-time-of-day-label">
            Time of day
          </FieldLabel>
          <TimePickersRow aria-labelledby="schedule-time-of-day-label">
            <TimePickerField>
              <FieldLabel as="label" htmlFor="schedule-time-hour" style={{ fontWeight: 400 }}>
                Hour
              </FieldLabel>
              <TimezoneSelect
                id="schedule-time-hour"
                value={timeHour}
                onChange={(e) => setTimeOfDay(`${e.target.value}:${timeMinute}`)}
                required
                disabled={pending}
              >
                {HOUR_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </TimezoneSelect>
            </TimePickerField>
            <TimePickerField>
              <FieldLabel as="label" htmlFor="schedule-time-minute" style={{ fontWeight: 400 }}>
                Minute
              </FieldLabel>
              <TimezoneSelect
                id="schedule-time-minute"
                value={timeMinute}
                onChange={(e) => setTimeOfDay(`${timeHour}:${e.target.value}`)}
                required
                disabled={pending}
              >
                {MINUTE_OPTIONS.map((mm) => (
                  <option key={mm} value={mm}>
                    {mm}
                  </option>
                ))}
              </TimezoneSelect>
            </TimePickerField>
          </TimePickersRow>
        </FieldGroup>
        <SetupFormSubmit pending={pending} label="Save schedule" />
      </Row>
    </Form>
  );
}
