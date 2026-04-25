import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import Profile from '../components/auth/profile';
import SetupLayout from '../components/setup/SetupLayout';
import ContentStep from '../components/content/ContentStep';
import ScheduleStep from '../components/schedule/ScheduleStep';
import TargetsStep from '../components/targets/TargetsStep';
import ApproveSenderStep from '../components/setup/ApproveSenderStep';
import ConfirmationStep from '../components/confirm/ConfirmationStep';
import DigestListPage from '../components/digests/DigestListPage';
import PlansPage from '../components/plans/PlansPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TopBar />,
    children: [
      { index: true, element: <DigestListPage /> },
      {
        path: 'new',
        element: <SetupLayout />,
        children: [{ path: 'content', element: <ContentStep /> }],
      },
      {
        path: ':digestId',
        element: <SetupLayout />,
        children: [
          { path: 'content', element: <ContentStep /> },
          { path: 'schedule', element: <ScheduleStep /> },
          { path: 'targets', element: <TargetsStep /> },
          { path: 'approve-sender', element: <ApproveSenderStep /> },
          { path: 'confirm', element: <ConfirmationStep /> },
        ],
      },
      { path: 'plans', element: <PlansPage /> },
      { path: 'profile', element: <PageLayout title="Profile"><Profile /></PageLayout> },
      { path: '*', element: <PageLayout title="Page Not Found"><div>Page not found</div></PageLayout> },
    ],
  },
]);

export function RouterProvider() {
  return <RRProvider router={router} />;
}
