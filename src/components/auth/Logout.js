import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../Alert/Alert';

const Logout = () => {
    const navigate = useNavigate();
    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        const timer = setTimeout(() => {
            navigate('/login');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleAlertClose = () => {
        setShowAlert(false);
    };

    return (
        <>
            {showAlert && (
                <Alert 
                    type="success" 
                    message="Logged out successfully" 
                    onClose={handleAlertClose}
                    duration={3000}
                />
            )}
            <div>Logging out...</div>
        </>
    );
};

export default Logout;