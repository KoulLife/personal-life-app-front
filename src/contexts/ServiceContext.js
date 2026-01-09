import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ServiceContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const ServiceProvider = ({ children }) => {
    const [activeServices, setActiveServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchActiveServices = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/user/services`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setActiveServices(data); // ["PROJECT_MANAGER", "ALERT_MANAGER", ...]
            } else {
                console.error("Failed to fetch active services");
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchActiveServices();
    }, [fetchActiveServices]);

    // Refresh method for other components to call
    const refreshServices = () => {
        fetchActiveServices();
    };

    return (
        <ServiceContext.Provider value={{ activeServices, loading, refreshServices }}>
            {children}
        </ServiceContext.Provider>
    );
};

export const useServices = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useServices must be used within a ServiceProvider');
    }
    return context;
};
