import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MainLayout.css';
import bgImage from '../assets/images/login-backgrounds/login-background.jpg';
import { FaBars } from 'react-icons/fa';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const isAlertPage = location.pathname.includes('/dashboard/alert');

    return (
        <div className="main-layout" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="layout-overlay"></div>

            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <FaBars />
            </button>

            <div className={`mobile-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={`content-area ${isAlertPage ? 'no-padding' : ''}`}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
