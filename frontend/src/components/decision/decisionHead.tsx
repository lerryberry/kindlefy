import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

const MyDecisions = () => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [data, setData] = useState<string>("Loading...");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = await getAccessTokenSilently();

                const response = await fetch('http://localhost:3000/api/v1/decisions/682937a71f34c335a1c0e042', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                //console.log(response);

                const result = await response.json();
                setData(JSON.stringify(result));
            } catch (error) {
                setData(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, getAccessTokenSilently]);

    return (
        isAuthenticated && (
            <div>
                <h1>{data}</h1>
            </div>
        )
    );
};

export default MyDecisions;