import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        if (!token) return false;

        // Simple token existence check instead of async validation
        const user = JSON.parse(localStorage.getItem('user'));
        const loggedInAt = user ? new Date(user.loggedInAt) : null;
        
        // Token expires after 1 hours
        if (loggedInAt) {
            const now = new Date();
            const hoursSinceLogin = (now - new Date(loggedInAt)) / (1000 * 60 * 60);
            if (hoursSinceLogin > 1) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                return false;
            }
        }

        return true;
    };

    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;