import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Stepper from '../util/Stepper';
import { readApproveSenderNextPressed, useDigestWizard } from '../../hooks/useDigestWizard';
import { useDigestsQuery, useDigestTimingsQuery } from '../../hooks/useDigests';

const Wrap = styled.div`
  padding: 1rem;
  padding-bottom: 3rem;
`;

const Main = styled.div`
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
`;

function activeStepIdFromPath(pathname: string): string {
  if (pathname.endsWith('/targets')) return 'targets';
  if (pathname.endsWith('/approve-sender')) return 'approve-sender';
  if (pathname.endsWith('/schedule')) return 'schedule';
  if (pathname.endsWith('/confirm')) return 'confirm';
  return 'content';
}

export default function SetupLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { digestId, selectedTimingId } = useDigestWizard();
  const { data: digests } = useDigestsQuery();
  const { data: timingsData } = useDigestTimingsQuery(digestId);
  const timings = timingsData?.timings;

  const resolvedTimingId = selectedTimingId || (timings?.[0]?.timingId ?? null);
  const selectedTiming = resolvedTimingId ? timings?.find((t) => t.timingId === resolvedTimingId) : null;
  const currentDigest = digestId ? (digests || []).find((d) => d._id === digestId) : null;
  const digestEnabled = currentDigest ? currentDigest.enabled !== false : false;

  const stepContentComplete = !!digestId;
  const stepScheduleComplete = !!digestId && (timings?.length ?? 0) > 0;
  const stepTargetsComplete = !!digestId && !!selectedTiming && (selectedTiming.targetsCount ?? 0) > 0;
  const isSetupReady = stepContentComplete && stepScheduleComplete && stepTargetsComplete;
  const approveSenderNextPressed = readApproveSenderNextPressed(digestId);
  // Do not gate on digestEnabled: digest stays disabled until Finish setup; tick = Next pressed on this step.
  const stepApproveSenderComplete = isSetupReady && approveSenderNextPressed;
  const stepConfirmComplete = isSetupReady && digestEnabled;

  const go = (path: string) => () => navigate(path);
  const activeStepId = activeStepIdFromPath(pathname);

  return (
    <Wrap className="container">
      <div className="container-content">
        <Main>
          <Stepper
            activeStepId={activeStepId}
            steps={[
              {
                id: 'content',
                label: 'Create digest',
                isComplete: stepContentComplete,
                onClick: digestId ? go(`/${digestId}/content`) : go('/new/content'),
              },
              {
                id: 'schedule',
                label: 'Set schedule',
                isComplete: stepScheduleComplete,
                onClick: digestId ? go(`/${digestId}/schedule`) : undefined,
              },
              {
                id: 'targets',
                label: 'Add Kindle',
                isComplete: stepTargetsComplete,
                onClick: digestId ? go(`/${digestId}/targets`) : undefined,
              },
              {
                id: 'approve-sender',
                label: 'Approve sender',
                isComplete: stepApproveSenderComplete,
                onClick: digestId ? go(`/${digestId}/approve-sender`) : undefined,
              },
              {
                id: 'confirm',
                label: 'Finish setup',
                isComplete: stepConfirmComplete,
                onClick: digestId ? go(`/${digestId}/confirm`) : undefined,
              },
            ]}
          >
            <Outlet />
          </Stepper>
        </Main>
      </div>
    </Wrap>
  );
}
