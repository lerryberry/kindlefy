import { useParams, useNavigate } from "react-router-dom";
import PageLayout from '../layouts/PageLayout';
import { useGetAllOptions } from './useGetAllOptions';
import CreateOptionListFormInput from './CreateOptionListFormInput';
import Loading from '../util/Loading';
import type { Option } from '../../types/options';

function CreateOptionListForm() {
    const { decisionId } = useParams<{ decisionId: string }>();
    const navigate = useNavigate();
    const { data: optionsData, isLoading } = useGetAllOptions(decisionId!);

    if (isLoading) {
        return <Loading />;
    }

    const options = optionsData?.data || [];

    return (
        <PageLayout
            title="What are the options?"
            showBackButton={true}
            onBackClick={() => navigate('/decisions')}
            showNextButton={true}
            onNextClick={() => navigate(`/decisions/${decisionId}/criteria`)}
        >
            {options.map((option: Option) => (
                <div key={option._id}>
                    <CreateOptionListFormInput
                        optionId={option._id}
                        optionTitle={option.title}
                    />
                </div>
            ))}
            <CreateOptionListFormInput isNew={true} />
        </PageLayout>
    );
}

export default CreateOptionListForm;

