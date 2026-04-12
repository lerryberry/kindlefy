import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
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

function defaultTimezone(): string {
  return detectPreferredScheduleTimezone();
}

export default function TimingForm() {
  const navigate = useNavigate();
  const { digestId, selectedTimingId, setSelectedTimingId } = useDigestWizard();
  const { data: timings, isLoading } = useDigestTimingsQuery(digestId);
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
    setTimeOfDay(currentSchedule.timeOfDay || '09:00');
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
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.timeOfDay)) {
      toast.error('Time must be HH:mm (24h)');
      return;
    }
    if (!/^([01]\d|2[0-3]):(00|30)$/.test(schedule.timeOfDay)) {
      toast.error('Time must be in 30-minute intervals');
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
        <FormInput
          label="Time of day"
          name="timeOfDay"
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          step={1800}
          required
        />
        <SetupFormSubmit pending={pending} label="Save schedule" />
      </Row>
    </Form>
  );
}
