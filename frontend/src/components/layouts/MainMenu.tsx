import { Link } from 'react-router-dom';
import LogoutButton from '../auth/logout'

export default function DashboardLayout() {
    return (
        <ul>
            <li><LogoutButton /></li>
            <li><Link to="/decisions">Go to Decisions</Link></li>
            <li ><Link to="/profile">Go to Profile</Link></li >
        </ul>
    );
}