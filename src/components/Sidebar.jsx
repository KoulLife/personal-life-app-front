import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaEdit, FaCode, FaImage, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

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

            <button className="new-entry-btn">
                <span>+ New Service</span>
            </button>

            <div className="nav-section">
                <div className="nav-label">Main</div>
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                >
                    <FaHome className="nav-icon" />
                    <span>Home</span>
                </NavLink>

                <div className="nav-label" style={{ marginTop: '20px' }}>Recent Entries</div>
                <div className="nav-item">
                    <FaEdit className="nav-icon" />
                    <span>Daily Journal</span>
                </div>
                <NavLink
                    to="/dashboard/project"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                >
                    <FaCode className="nav-icon" />
                    <span>Project Manage</span>
                </NavLink>
                <div className="nav-item">
                    <FaImage className="nav-icon" />
                    <span>Design Assets</span>
                </div>
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
