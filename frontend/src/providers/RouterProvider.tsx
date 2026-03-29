import { createBrowserRouter, Outlet, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import Profile from '../components/auth/profile';
import { SetupWizardProvider } from './SetupWizardProvider';
import SetupLayout from '../components/setup/SetupLayout';
import ContentStep from '../components/content/ContentStep';
import ScheduleStep from '../components/schedule/ScheduleStep';
import TargetsStep from '../components/targets/TargetsStep';
import DigestListPage from '../components/digests/DigestListPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <TopBar />,
    children: [
      {
        element: (
          <SetupWizardProvider>
            <Outlet />
          </SetupWizardProvider>
        ),
        children: [
          { index: true, element: <DigestListPage /> },
          {
            element: <SetupLayout />,
            children: [
              { path: 'content', element: <ContentStep /> },
              { path: 'schedule', element: <ScheduleStep /> },
              { path: 'targets', element: <TargetsStep /> },
            ],
          },
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
