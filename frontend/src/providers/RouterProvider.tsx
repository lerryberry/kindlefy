import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import DecisionList from '../components/decision/decisionList';
import Decision from '../components/decision/Decision';
import Profile from '../components/auth/profile';
import CreateDecisionForm from '../components/decision/CreateDecisionForm';

const router = createBrowserRouter([
    {
        path: "/",
        element: <TopBar />,
        children: [
            { path: "decisions", element: <DecisionList /> },
            { path: "decisions/:decisionId", element: <Decision /> },
            { path: "decisions/new", element: <CreateDecisionForm /> },
            { path: "profile", element: <Profile /> },
            { path: "*", element: <div>Page not found</div> }
        ]
    }
]);

export function RouterProvider() {
    return <RRProvider router={router} />;
}