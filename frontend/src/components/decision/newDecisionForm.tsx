import { useAuth0 } from "@auth0/auth0-react";

const NewDecisionForm = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    
    if (!isAuthenticated) return null;
    
    const postData = async (data: any) => {
        try {
            const token = await getAccessTokenSilently();

            fetch('http://localhost:3000/api/v1/decisions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            //console.log(response);

            //setData(JSON.stringify(result));
        } catch (error) {
            //setData(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted", e.currentTarget.title.value);
        postData({ title: e.currentTarget.title.value });
    };

    return (
        <form className="new-decision-form" onSubmit={handleSubmit}>
            <input type="text" placeholder="Decision Title" name="title" />
            <button type="submit">Create Decision</button>
        </form>
    );
};

export default NewDecisionForm;