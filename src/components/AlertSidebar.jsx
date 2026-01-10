import React, { useState, useEffect } from 'react';
import { FaCode, FaBolt, FaBell, FaWallet, FaSlack, FaTelegramPlane, FaEnvelope, FaDatabase } from 'react-icons/fa';
import './AlertSidebar.css';

const AlertSidebar = ({ onAddNode }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    const serviceNameMap = {
        'PROJECT_MANAGER': { label: 'Project Manager', desc: 'Project Management', icon: <FaCode /> },
        'REALTIME_WORKFLOW': { label: 'Realtime Workflow', desc: 'Workflow Monitoring', icon: <FaBolt /> },
        'ALERT_MANAGER': { label: 'Alert Manager', desc: 'Alert Configuration', icon: <FaBell /> },
        'FINANCIAL_MANAGER': { label: 'Financial Manager', desc: 'Finance Tracking', icon: <FaWallet /> },
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:8080/user/services', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setServices(data);
                }
            } catch (error) {
                console.error('Failed to fetch services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    const messageChannels = [
        { id: 'slack', label: 'Slack', desc: 'Send to Slack', icon: <FaSlack /> },
        { id: 'telegram', label: 'Telegram', desc: 'Send to Telegram', icon: <FaTelegramPlane /> },
        { id: 'email', label: 'Email', desc: 'Send via Email', icon: <FaEnvelope /> },
    ];

    return (
        <div className="alert-sidebar">
            <div className="sidebar-header">
                알람 구성
            </div>

            <div className="sidebar-content" style={{ overflowY: 'auto', flex: 1 }}>
                <div className="sidebar-section">
                    <div className="section-title">나의 서비스</div>
                    {loading ? (
                        <div style={{ padding: '10px', color: '#888', fontSize: '12px' }}>로딩중...</div>
                    ) : (
                        services.map((serviceCode, index) => {
                            const serviceInfo = serviceNameMap[serviceCode] || {
                                label: serviceCode,
                                desc: 'Service Integration',
                                icon: <FaDatabase />
                            };

                            return (
                                <div key={index} className="node-item" onClick={() => onAddNode && onAddNode(serviceInfo.label, 'service', serviceInfo.icon, serviceInfo.desc)}>
                                    <div className="node-icon">{serviceInfo.icon}</div>
                                    <div className="node-info">
                                        <div className="node-name">{serviceInfo.label}</div>
                                        <div className="node-description">{serviceInfo.desc}</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="sidebar-section">
                    <div className="section-title">메시지 수단</div>
                    {messageChannels.map((channel) => (
                        <div key={channel.id} className="node-item" onClick={() => onAddNode && onAddNode(channel.label, 'channel', channel.icon, channel.desc)}>
                            <div className="node-icon">{channel.icon}</div>
                            <div className="node-info">
                                <div className="node-name">{channel.label}</div>
                                <div className="node-description">{channel.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlertSidebar;
