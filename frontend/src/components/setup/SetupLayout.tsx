import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Stepper from '../util/Stepper';
import { useSetupWizard } from '../../hooks/useSetupWizard';
import { useTimingsQuery, findTimingForPrompt } from '../../hooks/useTimings';
import { targetIdsFromTiming } from '../../hooks/useTargets';

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
  if (pathname.endsWith('/schedule')) return 'schedule';
  return 'content';
}

export default function SetupLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { promptId, timingId } = useSetupWizard();
  const { data: timingsRes } = useTimingsQuery();
  const timings = timingsRes?.data ?? [];

  const timingForPrompt = findTimingForPrompt(timings, promptId);
  const effectiveTimingId = timingId || timingForPrompt?._id || null;
  const targetCount = timingForPrompt ? targetIdsFromTiming(timingForPrompt.targets).length : 0;

  const stepContentComplete = !!promptId;
  const stepScheduleComplete = !!promptId && !!effectiveTimingId;
  const stepTargetsComplete = stepScheduleComplete && targetCount > 0;

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
                label: 'Content',
                isComplete: stepContentComplete,
                onClick: go('/content'),
              },
              {
                id: 'schedule',
                label: 'Schedule',
                isComplete: stepScheduleComplete,
                onClick: go('/schedule'),
              },
              {
                id: 'targets',
                label: 'Targets',
                isComplete: stepTargetsComplete,
                onClick: go('/targets'),
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
