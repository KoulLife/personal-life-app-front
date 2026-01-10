import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../contexts/ServiceContext';
import { FaBolt, FaArrowRight, FaGlobeAmericas, FaLayerGroup, FaWallet } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './DashboardHome.css';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
};

const DashboardHome = () => {
    const navigate = useNavigate();
    const { activeServices } = useServices();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Time Formatting
    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    return (
        <div className="dashboard-container">
            {/* Ambient Background Glow (Subtle overlay on top of MainLayout bg) */}
            <div className="ambient-glow"></div>

            <motion.div
                className="bento-grid"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* 1. Header / Welcome Block */}
                <motion.div className="bento-item welcome-box" variants={item}>
                    <div className="content">
                        <span className="sub-label">Control Deck</span>
                        <h1>Good Evening, <br /><span className="gradient-text">Dongik.</span></h1>
                        <p className="status-text">
                            <span className="dot pulse"></span>
                            System Operational
                        </p>
                    </div>
                </motion.div>

                {/* 2. Primary Action - Project Manager */}
                <motion.div
                    className="bento-item project-box"
                    variants={item}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/project')}
                >
                    <div className="content">
                        <div className="icon-wrapper primary">
                            <FaLayerGroup />
                        </div>
                        <h3>Project Manager</h3>
                        <div className="mini-ui-mockup">
                            <div className="ui-header">
                                <div className="ui-dot red"></div>
                                <div className="ui-dot yellow"></div>
                            </div>
                            <div className="ui-row">
                                <div className="ui-checkbox"></div>
                                <div className="ui-line long"></div>
                            </div>
                            <div className="ui-row">
                                <div className="ui-checkbox"></div>
                                <div className="ui-line medium"></div>
                            </div>
                            <div className="ui-row">
                                <div className="ui-checkbox"></div>
                                <div className="ui-line short"></div>
                            </div>
                        </div>
                        <div className="action-row">
                            <span>Open Workspace</span>
                            <FaArrowRight />
                        </div>
                    </div>
                </motion.div>

                {/* 3. Clock Widget */}
                <motion.div className="bento-item clock-box" variants={item}>
                    <div className="content centered">
                        <div className="time-display">{formatTime(currentTime)}</div>
                        <div className="date-display">{formatDate(currentTime)}</div>
                    </div>
                </motion.div>

                {/* 4. Integrations */}
                <motion.div
                    className="bento-item integration-box"
                    variants={item}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/dashboard/service/integration')}
                >
                    <div className="content">
                        <div className="header-row">
                            <div className="icon-wrapper secondary"><FaBolt /></div>
                            <div className="active-indicator">
                                {activeServices?.length || 0} Connected
                            </div>
                        </div>
                        <h3>Integrations</h3>
                        <p className="caption">Automate your workflow.</p>
                    </div>
                </motion.div>

                {/* 5. Financial Manager Widget (Conditional) */}
                {activeServices?.includes('FINANCIAL_MANAGER') ? (
                    <motion.div
                        className="bento-item financial-box"
                        variants={item}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(16, 185, 129, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard/financial')}
                    >
                        <div className="content">
                            <div className="header-row">
                                <div className="icon-wrapper financial">
                                    <FaWallet />
                                </div>
                                <span className="value-up">+12%</span>
                            </div>
                            <div className="financial-info">
                                <span className="label">Total Assets</span>
                                <span className="value">$24,593</span>
                            </div>
                            <div className="mini-chart-line">
                                <div className="chart-track">
                                    <div className="chart-fill" style={{ width: '68%' }}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="bento-item financial-box locked"
                        variants={item}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate('/dashboard/service/integration')}
                    >
                        <div className="content centered">
                            <div className="icon-wrapper locked">
                                <FaWallet />
                            </div>
                            <h3>Financial Manager</h3>
                            <p className="locked-msg">Activate to manage assets.</p>
                            <button className="activate-btn">Subscribe</button>
                        </div>
                    </motion.div>
                )}

                {/* 6. Network Status */}
                <motion.div className="bento-item status-box" variants={item}>
                    <div className="content centered">
                        <div className="status-ring">
                            <FaGlobeAmericas />
                            <div className="ring-pulse"></div>
                        </div>
                        <div className="status-label">Network Secure</div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default DashboardHome;
