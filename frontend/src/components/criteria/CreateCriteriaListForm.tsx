import { useParams, useNavigate } from "react-router-dom";
import PageLayout from '../layouts/PageLayout';
import { useGetCriteriaList } from './useGetCriteria';
import CriteriaDragDropList from './CriteriaDragDropList';
import Loading from '../util/Loading';

function CreateCriteriaListForm() {
    const { decisionId } = useParams<{ decisionId: string }>();
    const navigate = useNavigate();
    const { data: criteriaData, isLoading } = useGetCriteriaList(decisionId!);

    if (isLoading) {
        return <Loading />;
    }

    const criteria = criteriaData?.output || [];



    return (
        <PageLayout
            title="What are the criteria?"
            showBackButton={true}
            onBackClick={() => navigate(`/decisions/${decisionId}/options`)}
            showNextButton={true}
            onNextClick={() => navigate(`/decisions/${decisionId}/ranking`)}
        >
            <CriteriaDragDropList criteria={criteria} />
        </PageLayout>
    );
}

export default CreateCriteriaListForm;