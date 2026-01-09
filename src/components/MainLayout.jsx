import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './MainLayout.css';
import bgImage from '../assets/images/login-backgrounds/login-background.jpg';
import { FaBars } from 'react-icons/fa';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="main-layout" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="layout-overlay"></div>

            <button className="mobile-menu-btn" onClick={toggleSidebar}>
                <FaBars />
            </button>

            <div className={`mobile-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="content-area">
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
