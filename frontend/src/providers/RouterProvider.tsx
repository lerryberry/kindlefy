import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import DecisionList from '../components/decision/decisionList';
import DecisionPage from '../components/decision/DecisionPage';
import CriteriaList from '../components/criteria/CriteriaList';
import Profile from '../components/auth/profile';
import CreateDecisionForm from '../components/decision/CreateDecisionForm';
import CreateCriteriaForm from '../components/criteria/CreateCriteriaForm';
import CriterionDetail from '../components/criteria/CriterionDetail';
import CreateOptionForm from '../components/options/CreateOptionForm';
import OptionDetail from '../components/options/OptionDetail';
import OptionPage from '../components/options/OptionPage';



const router = createBrowserRouter([
    {
        path: "/",
        element: <TopBar />,
        children: [
            { path: "decisions", element: <PageLayout title="Decisions" addButtonText="Add Decision" onAddClick={() => window.location.href = "/decisions/new"}><DecisionList /></PageLayout> },
            { path: "decisions/new", element: <PageLayout title="New Decision"><CreateDecisionForm /></PageLayout> },
            {
                path: "decisions/:decisionId",
                element: <DecisionPage />,
                children: [
                    { index: true, element: <CriteriaList /> },
                    { path: "criteria/new", element: <CreateCriteriaForm /> },
                    { path: "criteria/:criterionId", element: <CriterionDetail /> },
                    { path: "criteria/:criterionId/options/new", element: <CreateOptionForm /> },
                    {
                        path: "options/:optionId",
                        element: <OptionPage />,
                        children: [
                            { index: true, element: <OptionDetail /> }
                        ]
                    }
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