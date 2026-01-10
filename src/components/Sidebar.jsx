import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaEdit, FaCode, FaImage, FaCog, FaSignOutAlt, FaTimes, FaBolt, FaBell, FaWallet } from 'react-icons/fa';
import { useServices } from '../contexts/ServiceContext';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { activeServices } = useServices();

    const handleLogout = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('tokenType');
            navigate('/login');
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header-mobile">
                <div className="app-brand">Personal Life</div>
                <button className="close-sidebar-btn" onClick={onClose}>
                    <FaTimes />
                </button>
            </div>

            <div className="app-brand desktop-brand">Personal Life</div>

            <button className="new-entry-btn" onClick={() => {
                navigate('/dashboard/service/integration');
                onClose && onClose();
            }}>
                <span>+ New Service</span>
            </button>

            <div className="nav-section">
                <div className="nav-label">Menu</div>
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                >
                    <FaHome className="nav-icon" />
                    <span>Home</span>
                </NavLink>

                {activeServices.includes('PROJECT_MANAGER') && (
                    <NavLink
                        to="/dashboard/project"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <FaCode className="nav-icon" />
                        <span>Project Manager</span>
                    </NavLink>
                )}

                {activeServices.includes('REALTIME_WORKFLOW') && (
                    <div className="nav-item" onClick={onClose}>
                        <FaBolt className="nav-icon" />
                        <span>Real-time Workflow</span>
                    </div>
                )}

                {activeServices.includes('ALERT_MANAGER') && (
                    <NavLink
                        to="/dashboard/alert"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <FaBell className="nav-icon" />
                        <span>Alert Manager</span>
                    </NavLink>
                )}

                {activeServices.includes('FINANCIAL_MANAGER') && (
                    <NavLink
                        to="/dashboard/financial"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        onClick={onClose}
                    >
                        <FaWallet className="nav-icon" />
                        <span>Financial Manager</span>
                    </NavLink>
                )}
            </div>

            <div className="user-section">
                <div className="nav-item">
                    <FaCog className="nav-icon" />
                    <span>Settings</span>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt className="nav-icon" />
                    <span>Sign out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
