import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            fontSize: '3em',
            fontWeight: 'bold',
            color: '#333',
            backgroundColor: '#f0f2f5'
        }}>
            <h1>Welcome to Krystallise</h1>
            <Link to="/decisions" style={{
                marginTop: '20px',
                padding: '10px 20px',
                fontSize: '1.2em',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer'
            }}>
                Start Here
            </Link>
        </div>
    );
};

export default LandingPage;
