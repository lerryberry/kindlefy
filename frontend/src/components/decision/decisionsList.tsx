import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import DecisionListItem from "./decisionListItem";

interface Decision {
    _id: string;
    title: string;
    slug: string;
    isArchived: boolean;
}

interface DecisionsResponse {
    status: string;
    results: number;
    data: Decision[];
}

const MyDecisions = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [decisions, setDecisions] = useState<Decision[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch('http://localhost:3000/api/v1/decisions', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const result: DecisionsResponse = await response.json();
                setDecisions(result.data);
                setLoading(false);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Unknown error');
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, getAccessTokenSilently]);

    if (!isAuthenticated) return null;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="decisions-list">
            <h2>My Decisions</h2>
            {decisions.length === 0 ? (
                <p>No decisions found</p>
            ) : (
                <ul>
                    {decisions.map((decision) => (
                        <DecisionListItem key={decision._id} decisionObject={decision} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyDecisions;