import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import DecisionList from '../components/decision/decisionList';
import DecisionHeader from '../components/decision/DecisionHeader';
import CriteriaRankingList from '../components/criteria/CriteriaRankingList';
import Profile from '../components/auth/profile';
import CreateDecisionForm from '../components/decision/CreateDecisionForm';
import CreateCriteriaListForm from '../components/criteria/CreateCriteriaListForm';
import CreateOptionListForm from '../components/options/CreateOptionListForm';
import DecisionReportPage from '../components/decision/DecisionReportPage';


const router = createBrowserRouter([
    {
        path: "/",
        element: <TopBar />,
        children: [
            { index: true, element: <DecisionList /> },
            { path: "decisions", element: <DecisionList /> },
            { path: "decisions/new", element: <CreateDecisionForm /> },
            { path: "decisions/:decisionId/edit", element: <CreateDecisionForm /> },
            {
                path: "decisions/:decisionId",
                element: <DecisionHeader />,
                children: [
                    { index: true, element: <CreateOptionListForm /> },
                    { path: "options", element: <CreateOptionListForm /> },
                    { path: "criteria", element: <CreateCriteriaListForm /> },
                    { path: "ranking", element: <CriteriaRankingList /> },
                    { path: "decide", element: <DecisionReportPage /> },
                ]
            },
            { path: "profile", element: <PageLayout title="Profile"><Profile /></PageLayout> },
            { path: "*", element: <PageLayout title="Page Not Found"><div>Page not found</div></PageLayout> }
        ]
    }
]);

export function RouterProvider() {
    return <RRProvider router={router} />;
}