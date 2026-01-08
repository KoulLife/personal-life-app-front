import React from 'react';
import { FaFont, FaCode, FaImages, FaLayerGroup } from 'react-icons/fa';

const DashboardHome = () => {
    return (
        <div className="dashboard-home">
            <div className="greeting-section">
                <h1>Start creating with Personal Life</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>What would you like to build service?</p>
            </div>

            <div className="cards-grid">
                <div className="dashboard-card">
                    <div className="card-header">
                        <FaFont className="card-icon" />
                        <span>Project Manage</span>
                    </div>
                    <div className="card-preview">
                        {/* Placeholder visual */}
                        <div style={{ padding: '10px', fontSize: '10px', color: '#aaa' }}>
                            Write a blog...
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <FaCode className="card-icon" />
                        <span>Financial Manage</span>
                    </div>
                    <div className="card-preview">
                        <div style={{ padding: '10px', fontFamily: 'monospace', fontSize: '10px', color: '#88ff88' }}>
                            &lt;div&gt;Hello&lt;/div&gt;
                        </div>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <FaImages className="card-icon" />
                        <span>Study Record</span>
                    </div>
                    <div className="card-preview" style={{ background: 'linear-gradient(45deg, #333, #555)' }}>
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="card-header">
                        <FaLayerGroup className="card-icon" />
                        <span>Service Map</span>
                    </div>
                    <div className="card-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '40px', height: '10px', background: '#555', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
