import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import Profile from '../components/auth/profile';
import Dashboard from '../components/dashboard/Dashboard';


const router = createBrowserRouter([
    {
        path: "/",
        element: <TopBar />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: "profile", element: <PageLayout title="Profile"><Profile /></PageLayout> },
            { path: "*", element: <PageLayout title="Page Not Found"><div>Page not found</div></PageLayout> }
        ]
    }
]);

export function RouterProvider() {
    return <RRProvider router={router} />;
}