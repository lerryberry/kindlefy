import { createBrowserRouter, RouterProvider as RRProvider } from 'react-router-dom';
import TopBar from '../components/layouts/TopBar';
import PageLayout from '../components/layouts/PageLayout';
import DecisionList from '../components/decision/decisionList';
import DecisionHeader from '../components/decision/DecisionHeader';
import CriteriaList from '../components/criteria/CriteriaList';
import Profile from '../components/auth/profile';
import CreateDecisionForm from '../components/decision/CreateDecisionForm';
import CreateCriteriaForm from '../components/criteria/CreateCriteriaForm';
import CriterionDetail from '../components/criteria/CriterionDetail';
import CreateOptionForm from '../components/options/CreateOptionForm';
import OptionDetail from '../components/options/OptionDetail';
import LandingPage from '../components/landing/LandingPage';
import DecisionReportPage from '../components/decision/DecisionReportPage';


const router = createBrowserRouter([
    {
        path: "/",
        element: <TopBar />,
        children: [
            { index: true, element: <LandingPage /> },
            { path: "decisions", element: <PageLayout title="Decisions" addButtonText="Add Decision" onAddClick={() => window.location.href = "/decisions/new"}><DecisionList /></PageLayout> },
            { path: "decisions/new", element: <PageLayout title="New Decision"><CreateDecisionForm /></PageLayout> },
            { path: "decisions/:decisionId/edit", element: <PageLayout title="Edit Decision"><CreateDecisionForm /></PageLayout> },
            {
                path: "decisions/:decisionId",
                element: <DecisionHeader />,
                children: [
                    { index: true, element: <CriteriaList /> },
                    { path: "report", element: <DecisionReportPage /> },
                    { path: "criteria/new", element: <CreateCriteriaForm /> },
                    { path: "criteria/:criterionId/edit", element: <PageLayout title="Edit Criteria"><CreateCriteriaForm /></PageLayout> },
                    { path: "criteria/:criterionId", element: <CriterionDetail /> },
                    { path: "criteria/:criterionId/options/new", element: <CreateOptionForm /> },
                    {
                        path: "options/:optionId",
                        children: [
                            { index: true, element: <OptionDetail /> },
                            { path: "edit", element: <PageLayout title="Edit Option"><CreateOptionForm /></PageLayout> }
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