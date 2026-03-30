import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import Profile from '../components/auth/profile';
import SetupLayout from '../components/setup/SetupLayout';
import ContentStep from '../components/content/ContentStep';
import ScheduleStep from '../components/schedule/ScheduleStep';
import TargetsStep from '../components/targets/TargetsStep';
import ConfirmationStep from '../components/confirm/ConfirmationStep';
import DigestListPage from '../components/digests/DigestListPage';

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
          { path: 'confirm', element: <ConfirmationStep /> },
        ],
      },
      { path: 'profile', element: <PageLayout title="Profile"><Profile /></PageLayout> },
      { path: '*', element: <PageLayout title="Page Not Found"><div>Page not found</div></PageLayout> },
    ],
  },
]);

export function RouterProvider() {
  return <RRProvider router={router} />;
}
