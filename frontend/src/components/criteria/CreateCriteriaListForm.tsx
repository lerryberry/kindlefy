import { useParams, useNavigate } from "react-router-dom";
import PageLayout from '../layouts/PageLayout';
import { useGetCriteriaList } from './useGetCriteria';
import CreateCriteriaListFormInput from './CreateCriteriaListFormInput';
import Loading from '../util/Loading';
import type { Criteria } from '../../types/criteria';

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
            {criteria.map((criterion: Criteria) => (
                <div key={criterion._id}>
                    <CreateCriteriaListFormInput
                        criterionId={criterion._id}
                        criterionTitle={criterion.title}
                        criterionPriority={criterion.priority}
                    />
                </div>
            ))}
            <CreateCriteriaListFormInput isNew={true} />
        </PageLayout>
    );
}

export default CreateCriteriaListForm;