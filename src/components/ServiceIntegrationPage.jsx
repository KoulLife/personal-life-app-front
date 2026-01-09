import React, { useState, useEffect } from 'react';
import './ServiceIntegrationPage.css';
import { FaTasks, FaBolt, FaBell, FaWallet, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../contexts/ServiceContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const ServiceIntegrationPage = () => {
    const navigate = useNavigate();
    const { activeServices, refreshServices } = useServices();

    // Initial State Mockup
    // Services State with Backend Enum IDs
    const [services, setServices] = useState([
        {
            id: 'PROJECT_MANAGER',
            title: 'Project Manager',
            description: 'Coordinate tasks, manage timelines, and track progress effortlessly with our Project Manager integration.',
            icon: <FaTasks />,
            connected: false
        },
        {
            id: 'REALTIME_WORKFLOW',
            title: 'Real-time workflow',
            description: 'Automate your daily processes and trigger actions in real-time to boost productivity.',
            icon: <FaBolt />,
            connected: false
        },
        {
            id: 'ALERT_MANAGER',
            title: 'Alert Manager',
            description: 'Stay on top of critical events with instant notifications sent directly to your preferred channels.',
            icon: <FaBell />,
            connected: false
        },
        {
            id: 'FINANCIAL_MANAGER',
            title: 'Financial Manager',
            description: 'Track expenses, monitor budgets, and gain financial insights with our comprehensive tool.',
            icon: <FaWallet />,
            connected: false
        }
    ]);

    // State for Disconnect Confirmation Modal
    const [disconnectingService, setDisconnectingService] = useState(null);

    // Sync state with Context
    useEffect(() => {
        if (activeServices) {
            setServices(prev => prev.map(service => ({
                ...service,
                connected: activeServices.includes(service.id)
            })));
        }
    }, [activeServices]);

    const handleToggleClick = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        if (service.connected) {
            // If already connected, open confirmation modal
            setDisconnectingService(service);
        } else {
            // If not connected, proceed to connect immediately
            connectService(serviceId);
        }
    };

    const connectService = async (serviceId) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }

            // Optimistic update
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, connected: true } : s
            ));

            const response = await fetch(`${API_URL}/user/services?serviceType=${serviceId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to connect service");
            }

            refreshServices();
        } catch (error) {
            console.error("Error connecting service:", error);
            // Revert on failure
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, connected: false } : s
            ));
            alert("서비스 연결에 실패했습니다.");
        }
    };

    const confirmDisconnect = async () => {
        if (!disconnectingService) return;

        const serviceId = disconnectingService.id;
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            // Optimistic update
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, connected: false } : s
            ));
            setDisconnectingService(null); // Close modal

            const response = await fetch(`${API_URL}/user/services?serviceType=${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to disconnect service");
            }

            refreshServices();
            setDisconnectingService(null); // Close modal
        } catch (error) {
            console.error("Error disconnecting service:", error);
            // Revert
            setServices(prev => prev.map(s =>
                s.id === serviceId ? { ...s, connected: true } : s
            ));
            alert("서비스 연결 해제에 실패했습니다.");
        }
    };

    const cancelDisconnect = () => {
        setDisconnectingService(null);
    };

    return (
        <div className="service-integration-container">
            {/* Disconnect Confirmation Modal */}
            {disconnectingService && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>서비스 연결 해제</h3>
                        <p>
                            <strong>{disconnectingService.title}</strong> 서비스의 연결을 해제하시겠습니까?
                            <br /><br />
                            <span className="warning-text">
                                연결 해제 시 관련된 <strong>모든 사용자 데이터가 영구적으로 삭제</strong>되며 복구할 수 없습니다.
                            </span>
                        </p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={cancelDisconnect}>취소</button>
                            <button className="modal-btn confirm" onClick={confirmDisconnect}>연결 해제</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="integration-header">
                <button onClick={() => navigate(-1)} style={{
                    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <FaArrowLeft /> Back
                </button>
                <h1>Integrations</h1>
                <p>Supercharge your workflow by connecting with your favorite services.</p>
            </div>

            <div className="services-grid">
                {services.map(service => (
                    <div key={service.id} className="service-card">
                        <div className="card-header">
                            <div className={`service-icon-wrapper ${service.id.toLowerCase()}`}>
                                {service.icon}
                            </div>
                            <button
                                className={`toggle-btn ${service.connected ? 'connected' : 'connect'}`}
                                onClick={() => handleToggleClick(service.id)}
                            >
                                {service.connected ? 'Connected' : 'Connect'}
                            </button>
                        </div>
                        <div className="service-title">{service.title}</div>
                        <div className="service-desc">{service.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServiceIntegrationPage;
