import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Form from '../util/Form';
import FormInput from '../util/FormInput';
import SetupFormSubmit from '../util/SetupFormSubmit';
import {
  useCreateTimingMutation,
  useTimingsQuery,
  useUpdateTimingMutation,
  findTimingForPrompt,
} from '../../hooks/useTimings';
import { useSetupWizard } from '../../hooks/useSetupWizard';
import type { Schedule } from '../../types/timing';

const SCHEDULE_FREQUENCY = 'daily' as const;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

function defaultTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export default function TimingForm() {
  const navigate = useNavigate();
  const { promptId, setTimingId } = useSetupWizard();
  const { data: timingsRes, isLoading } = useTimingsQuery();
  const { mutateAsync: createTiming, isPending: isCreating } = useCreateTimingMutation();
  const { mutateAsync: updateTiming, isPending: isUpdating } = useUpdateTimingMutation();

  const existing = useMemo(() => {
    const list = timingsRes?.data ?? [];
    return findTimingForPrompt(list, promptId);
  }, [timingsRes?.data, promptId]);

  const [timezone, setTimezone] = useState(defaultTimezone());
  const [timeOfDay, setTimeOfDay] = useState('09:00');

  useEffect(() => {
    if (!existing) {
      setTimezone(defaultTimezone());
      setTimeOfDay('09:00');
      return;
    }
    const s: Schedule = existing.schedule;
    setTimezone(s.timezone || defaultTimezone());
    setTimeOfDay(s.timeOfDay || '09:00');
  }, [existing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!promptId) {
      toast.error('Select or create a prompt first (Content step)');
      return;
    }
    const schedule: Schedule = {
      timezone: timezone.trim() || defaultTimezone(),
      timeOfDay: timeOfDay.trim(),
      frequency: SCHEDULE_FREQUENCY,
    };
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(schedule.timeOfDay)) {
      toast.error('Time must be HH:mm (24h)');
      return;
    }
    try {
      if (existing?._id) {
        const updated = await updateTiming({
          id: existing._id,
          body: { schedule },
        });
        setTimingId(updated._id);
        toast.success('Schedule updated');
      } else {
        const created = await createTiming({
          prompt: promptId,
          schedule,
          targets: [],
        });
        setTimingId(created._id);
        toast.success('Schedule saved');
      }
      navigate('/targets');
    } catch {
      toast.error('Could not save schedule');
    }
  }

  if (!promptId) {
    return <p>Select a prompt on the Content step before scheduling.</p>;
  }

  if (isLoading) {
    return <p>Loading…</p>;
  }

  const pending = isCreating || isUpdating;

  return (
    <Form onSubmit={handleSubmit}>
      <Row>
        <FormInput
          label="Timezone"
          name="timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          required
          placeholder="e.g. America/New_York"
        />
        <FormInput
          label="Time of day"
          name="timeOfDay"
          type="time"
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          required
        />
        <FormInput
          label="Frequency"
          name="frequency"
          value={SCHEDULE_FREQUENCY}
          disabled
        />
        <SetupFormSubmit pending={pending} label="Save schedule" />
      </Row>
    </Form>
  );
}
