import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import DecisionList from '../components/decision/decisionList';
import DecisionPage from '../components/decision/DecisionPage';
import Profile from '../components/auth/profile';
import CreateDecisionForm from '../components/decision/CreateDecisionForm';
import CreateCriteriaForm from '../components/criteria/CreateCriteriaForm';

const router = createBrowserRouter([
    {
        path: "/",
        element: <TopBar />,
        children: [
            { path: "decisions", element: <PageLayout title="Decisions"><DecisionList /></PageLayout> },
            { path: "decisions/:decisionId", element: <DecisionPage /> },
            { path: "decisions/new", element: <PageLayout title="New Decision"><CreateDecisionForm /></PageLayout> },
            { path: "decisions/:decisionId/criteria/new", element: <CreateCriteriaForm /> },
            { path: "profile", element: <PageLayout title="Profile"><Profile /></PageLayout> },
            { path: "*", element: <PageLayout title="Page Not Found"><div>Page not found</div></PageLayout> }
        ]
    }
]);

export function RouterProvider() {
    return <RRProvider router={router} />;
}