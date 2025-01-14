import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');

    const checkConnection = async () => {
        try {
            setStatus('checking');
            setMessage('Checking connection...');

            const response = await fetch('http://localhost:9090/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Include credentials if using session-based auth
            });

            if (response.status === 403) {
                throw new Error('Access forbidden. Check backend security configuration.');
            }

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            setMessage(data.message || 'Connected successfully!');
            setStatus('connected');
        } catch (error) {
            console.error('Connection test failed:', error);
            setStatus('error');
            setMessage(error.message);
        }
    };

    useEffect(() => {
        checkConnection();
    }, []);

    const getStatusStyle = () => {
        switch (status) {
            case 'connected':
                return { backgroundColor: '#ddf3dd', color: '#285b28', border: '1px solid #9ed49e' };
            case 'error':
                return { backgroundColor: '#fde8e8', color: '#981b1b', border: '1px solid #f8b4b4' };
            default:
                return { backgroundColor: '#e5e7eb', color: '#374151', border: '1px solid #d1d5db' };
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
            <button 
                onClick={checkConnection} 
                style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: status === 'checking' ? 'wait' : 'pointer',
                    marginBottom: '16px',
                }}
                disabled={status === 'checking'}
            >
                {status === 'checking' ? 'Checking...' : 'Test Connection'}
            </button>

            <div style={{
                padding: '16px',
                borderRadius: '4px',
                marginTop: '16px',
                ...getStatusStyle()
            }}>
                <h3 style={{ margin: '0 0 8px 0' }}>
                    Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                </h3>
                <p style={{ margin: '0' }}>{message}</p>
                
                {status === 'error' && (
                    <div style={{ marginTop: '16px' }}>
                        <h4 style={{ margin: '0 0 8px 0' }}>Troubleshooting Steps:</h4>
                        <ul style={{ margin: '0', paddingLeft: '20px' }}>
                            <li>Verify Spring Security configuration is correct</li>
                            <li>Check if endpoint is properly mapped in controller</li>
                            <li>Ensure CORS configuration is correct</li>
                            <li>Check application.properties security settings</li>
                            <li>Review server logs for security-related messages</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectionTest;