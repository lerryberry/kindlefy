import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
    const { user, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return <div>Loading ...</div>;
    }

    if (!isAuthenticated || !user) {
        return <div>Please log in to view your profile.</div>;
    }

    return (
        <div className="profile-container">
            {user.picture && (
                <img
                    src={user.picture}
                    alt={user.name || 'Profile picture'}
                    className="profile-picture"
                />
            )}
            <div className="profile-info">
                {user.name && <h2>{user.name}</h2>}
                {user.email && <p className="profile-email">{user.email}</p>}
                {user.nickname && <p className="profile-nickname">{user.nickname}</p>}
            </div>
        </div>
    );
};

export default Profile;