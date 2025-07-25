import { Outlet } from 'react-router-dom';
import MainMenu from './MainMenu'

// Create a layout component
export default function DashboardLayout() {
    return (
        <>
            <MainMenu />
            <Outlet />
        </>
    );
}