import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaArrowUp, FaArrowDown, FaPlus, FaDownload, FaEllipsisH, FaRobot, FaTimes, FaCalendarAlt, FaUser, FaCoins, FaBullseye, FaFingerprint } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './FinancialManagerPage.css';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05 // Faster stagger for dense UI
        }
    }
};

const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 80 } }
};

const FinancialManagerPage = () => {
    const navigate = useNavigate();

    // Financial Summary State
    const [financialSummary, setFinancialSummary] = useState({
        monthlyRevenue: 0,
        monthlyAvailableFunds: 0,
        monthlyExpenses: 0
    });

    // Transaction Modal State    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({ desc: '', amount: '', category: '식비' });

    // Financial Status Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // AI Modal State
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [statusData, setStatusData] = useState({
        age: '',
        job: '',
        household: '1인 가구', // Default
        income: '',
        fixedExpense: '',
        assets: '',
        debt: '',
        goal: '',
        goalAmount: '',
        goalDate: new Date(),
        hightPriority: [],
        lowPriority: [],
        feedbackStyle: '팩트 폭행',
        mbti: '',
        activityTime: '저녁 (18~22시)',
        investmentRisk: '중립형'
    });

    // Mock Options
    const households = ['1인 가구', '신혼 부부', '자녀 있음', '부모님 동거', '기타'];
    const mbtis = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];
    const categories = ['식비', '카페/간식', '생활용품', '의류/미용', '취미/여가', '자기계발', '교통/차량', '주거/통신', '기타'];
    const times = ['새벽 (00~06시)', '오전 (06~12시)', '오후 (12~18시)', '저녁 (18~22시)', '심야 (22~24시)'];

    const [financialRecords, setFinancialRecords] = useState([]);
    const [pageInfo, setPageInfo] = useState({
        pageNumber: 0,
        totalPages: 0,
        first: true,
        last: true
    });

    // Fetch Records
    const fetchRecords = async (page = 0) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial/records?page=${page}&size=10`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setFinancialRecords(data.content || []);
                setPageInfo({
                    pageNumber: data.pageable.pageNumber,
                    totalPages: data.totalPages,
                    first: data.first,
                    last: data.last
                });
            }
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    };

    useEffect(() => {
        fetchRecords(0);
    }, []);

    // ... (keep other effects)

    // ... (inside render)



    // Heatmap Data State
    const [currentMonth, setCurrentMonth] = useState('');
    const [heatmapData, setHeatmapData] = useState([]);
    const [heatmapTooltip, setHeatmapTooltip] = useState(null);

    // Graph Data State
    const [graphData, setGraphData] = useState({
        revenue: [],
        availableFunds: [],
        expenses: []
    });
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Fetch Financial Summary & Graph from Backend
    useEffect(() => {
        const fetchFinancialData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };

                // Fetch Summary
                const summaryResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial/summary`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: headers
                });

                if (summaryResponse.ok) {
                    const data = await summaryResponse.json();
                    setFinancialSummary({
                        monthlyRevenue: data.monthlyRevenue || 0,
                        monthlyAvailableFunds: data.monthlyAvailableFunds || 0,
                        monthlyExpenses: data.monthlyExpenses || 0
                    });
                }

                // Fetch Graph Data
                const graphResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial/graph`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: headers
                });

                if (graphResponse.ok) {
                    const data = await graphResponse.json();
                    setGraphData({
                        revenue: data.revenue || [],
                        availableFunds: data.availableFunds || [],
                        expenses: data.expenses || []
                    });
                }

                // Fetch Heatmap Data
                const currentDate = new Date();
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth() + 1;

                const heatmapResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial/heatmap?year=${year}&month=${month}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: headers
                });

                if (heatmapResponse.ok) {
                    const heatmapDataRaw = await heatmapResponse.json();

                    // Set current month label
                    setCurrentMonth(currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' }));

                    // Transform response to array format
                    const daysInMonth = new Date(year, month, 0).getDate();
                    const transformedData = Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const amount = heatmapDataRaw[day] || 0;

                        // Calculate level (0-4) based on amount
                        let level = 0;
                        if (amount > 0) {
                            if (amount < 5000) level = 1;
                            else if (amount < 15000) level = 2;
                            else if (amount < 30000) level = 3;
                            else level = 4;
                        }

                        return {
                            day: day,
                            amount: amount,
                            level: level
                        };
                    });

                    setHeatmapData(transformedData);
                }

            } catch (error) {
                console.error('Error fetching financial data:', error);
            }
        };

        fetchFinancialData();
    }, []);

    // Fetch Financial Profile when modal opens
    useEffect(() => {
        const fetchProfile = async () => {
            if (!isStatusModalOpen) return;

            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial-profile`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.profileData) {
                        // Map backend fields to frontend state
                        setStatusData({
                            age: data.profileData.age || '',
                            job: data.profileData.occupation || '',
                            household: data.profileData.householdType || '1인 가구',
                            income: data.profileData.monthlyIncome || '',
                            fixedExpense: data.profileData.fixedExpenses || '',
                            assets: data.profileData.totalAssets || '',
                            debt: data.profileData.totalDebt || '',
                            goal: data.profileData.financialGoal || '',
                            goalAmount: data.profileData.goalAmount || '',
                            goalDate: data.profileData.goalDeadline ? new Date(data.profileData.goalDeadline) : new Date(),
                            hightPriority: data.profileData.highPriorityCategories || [],
                            lowPriority: data.profileData.lowPriorityCategories || [],
                            feedbackStyle: data.profileData.feedbackPreference || '팩트 폭행',
                            mbti: data.profileData.mbti || '',
                            activityTime: data.profileData.preferredActivityTime || '저녁 (18~22시)',
                            investmentRisk: data.profileData.riskTolerance || '중립형'
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, [isStatusModalOpen]);

    const handleAddTransaction = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial/record`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: newTransaction.desc,
                    amount: Number(newTransaction.amount),
                    category: newTransaction.category
                })
            });

            if (response.ok) {
                // Refresh list
                await fetchRecords(0);
                setIsModalOpen(false);
                setNewTransaction({ desc: '', amount: '', category: '식비' });
            } else {
                console.error('Failed to add transaction');
                alert('소비 내역 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('accessToken');

            // Map frontend state to backend fields
            const profilePayload = {
                age: statusData.age,
                occupation: statusData.job,
                householdType: statusData.household,
                monthlyIncome: statusData.income,
                fixedExpenses: statusData.fixedExpense,
                totalAssets: statusData.assets,
                totalDebt: statusData.debt,
                financialGoal: statusData.goal,
                goalAmount: statusData.goalAmount,
                goalDeadline: statusData.goalDate.toISOString(),
                highPriorityCategories: statusData.hightPriority,
                lowPriorityCategories: statusData.lowPriority,
                feedbackPreference: statusData.feedbackStyle,
                mbti: statusData.mbti,
                preferredActivityTime: statusData.activityTime,
                riskTolerance: statusData.investmentRisk
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial-profile`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profilePayload)
            });

            if (response.ok) {
                alert('재정 상태가 업데이트 되었습니다. AI 분석이 시작됩니다.');
                setIsStatusModalOpen(false);
            } else {
                console.error('Failed to save profile');
                alert('재정 상태 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('오류가 발생했습니다.');
        }
    };

    const toggleChip = (category, type) => {
        setStatusData(prev => {
            const list = prev[type];
            if (list.includes(category)) {
                return { ...prev, [type]: list.filter(c => c !== category) };
            } else {
                return { ...prev, [type]: [...list, category] };
            }
        });
    };

    const handleAiAnalysis = async () => {
        setIsAiModalOpen(true);
        setAiLoading(true);
        setAiResult(null);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/financial/ai-report`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const contentType = response.headers.get("content-type");

            if (response.ok) {
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    setAiResult(data);
                    setAiLoading(false);
                } else {
                    const text = await response.text();
                    if (text.includes("AI가 리포트를 생성 중입니다")) {
                        // Still generating
                        setAiResult({ status: 'analyzing', message: text });
                    } else {
                        // Unexpected text response
                        console.warn("Unexpected text response:", text);
                        setAiResult(null);
                    }
                    // Keep loading state or show specific "analyzing" UI?
                    // The user said: "AI가 리포트를 생성 중입니다..." response comes if not ready.
                    // We can show this message in the UI.
                    setAiLoading(false);
                }
            } else {
                console.error('Failed to fetch AI report');
                setAiLoading(false);
            }
        } catch (error) {
            console.error('Error fetching AI report:', error);
            setAiLoading(false);
        }
    };

    return (
        <div className="financial-page">
            <motion.div
                className="financial-grid-high-density"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* Header Row */}
                <motion.div className="header-bar" variants={item}>
                    <div className="page-header">
                        <h1>Financial Manager</h1>
                    </div>
                    <div className="header-tools">
                        <button className="tool-btn"><FaDownload /></button>
                    </div>
                </motion.div>

                {/* Metric Cards Row */}
                <motion.div className="metric-card revenue" variants={item}>
                    <div className="card-label">총 수익</div>
                    <div className="card-value">{financialSummary.monthlyRevenue.toLocaleString()} 원</div>
                    <div className="card-trend positive"> + 100,000 원 (전월 대비)</div>
                </motion.div>

                <motion.div className="metric-card funds" variants={item}>
                    <div className="card-label">가용 자금</div>
                    <div className="card-value">{financialSummary.monthlyAvailableFunds.toLocaleString()} 원</div>
                    <div className="card-trend positive"> + 300,000 원 (전월 대비)</div>
                </motion.div>

                <motion.div className="metric-card expenses" variants={item}>
                    <div className="card-label">총 지출</div>
                    <div className="card-value">{financialSummary.monthlyExpenses.toLocaleString()} 원</div>
                    <div className="card-trend negative"> - 1.2% (목표 대비)</div>
                </motion.div>

                <motion.div
                    className="metric-card ai-feedback-card"
                    variants={item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAiAnalysis}
                >
                    <div className="card-label">AI 리포트</div>
                    <div className="card-value flex-center">
                        <span>AI 피드백</span>
                    </div>
                    <div className="card-trend positive">2025/12 소비 피드백</div>
                </motion.div>

                {/* Financial Status Registration Panel (Black Hole Style) */}
                <motion.div
                    className="metric-card black-hole-card full-width"
                    variants={item}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsStatusModalOpen(true)}
                >
                    <div className="black-hole-content">
                        <h2>나의 재정 상태 등록 / 수정</h2>
                        <p>현재 자산 및 예산 데이터를 관리하세요</p>
                    </div>
                    <div className="black-hole-effect"></div>
                </motion.div>

                {/* Financial Graph Section */}
                <motion.div className="card chart-card-lg" variants={item} style={{ position: 'relative' }}>
                    <div className="card-header">
                        <h3>재무 그래프</h3>
                        {/* Tooltip */}
                        {hoveredPoint && (
                            <div className="chart-tooltip" style={{
                                left: hoveredPoint.x,
                                top: hoveredPoint.y - 40,
                                position: 'absolute',
                                transform: 'translateX(-50%)',
                                zIndex: 10
                            }}>
                                <span className="tooltip-value">{hoveredPoint.value}</span>
                                <span className="tooltip-label">{hoveredPoint.label}</span>
                            </div>
                        )}
                    </div>
                    <div className="chart-legend">
                        <span className="legend-item"><span className="dot green"></span>총 수익</span>
                        <span className="legend-item"><span className="dot blue"></span>가용 자금</span>
                        <span className="legend-item"><span className="dot red"></span>총 지출</span>
                    </div>
                    <div className="mock-line-chart" style={{ position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none">
                            {(() => {
                                const width = 500;
                                const height = 150;
                                const padding = 20;
                                const dataLength = 9;

                                // Helper to get max value for scaling
                                const allValues = [
                                    ...graphData.revenue,
                                    ...graphData.availableFunds,
                                    ...graphData.expenses
                                ];
                                const maxValue = Math.max(...allValues, 100000); // Minimum scale

                                // Helper to calculate points
                                const getPoints = (data) => {
                                    return data.map((val, index) => {
                                        const x = (index / (dataLength - 1)) * width;
                                        const y = height - (val / maxValue) * (height - padding) - padding / 2;
                                        return `${x},${y}`;
                                    }).join(' ');
                                };

                                // Calculate points for tooltips
                                const renderInteractionPoints = (data, labelPrefix, color) => {
                                    return data.map((val, index) => {
                                        const x = (index / (dataLength - 1)) * width;
                                        const y = height - (val / maxValue) * (height - padding) - padding / 2;

                                        // Calculate month for tooltip
                                        const date = new Date();
                                        date.setMonth(date.getMonth() - (dataLength - 1 - index));
                                        const monthLabel = `${date.getMonth() + 1}월`;

                                        return (
                                            <circle
                                                key={`${labelPrefix}-${index}`}
                                                cx={x}
                                                cy={y}
                                                r="6"
                                                fill="transparent"
                                                className="chart-point"
                                                onMouseEnter={(e) => {
                                                    const rect = e.target.getBoundingClientRect();
                                                    // Calculate relative position for tooltip
                                                    const parent = e.target.closest('.chart-card-lg');
                                                    const parentRect = parent.getBoundingClientRect();

                                                    setHoveredPoint({
                                                        x: rect.left - parentRect.left + rect.width / 2,
                                                        y: rect.top - parentRect.top,
                                                        value: `${val.toLocaleString()}원`,
                                                        label: `${monthLabel} ${labelPrefix}`
                                                    });
                                                }}
                                                onMouseLeave={() => setHoveredPoint(null)}
                                            />
                                        );
                                    });
                                };

                                return (
                                    <>
                                        {/* Revenue (Green) */}
                                        <polyline
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="2"
                                            points={getPoints(graphData.revenue)}
                                        />

                                        {/* Available Funds (Blue) */}
                                        <polyline
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="2"
                                            strokeDasharray="4"
                                            points={getPoints(graphData.availableFunds)}
                                        />

                                        {/* Expenses (Red) */}
                                        <polyline
                                            fill="none"
                                            stroke="#f87171"
                                            strokeWidth="2"
                                            strokeDasharray="2"
                                            points={getPoints(graphData.expenses)}
                                        />

                                        {/* Interaction Layers */}
                                        {renderInteractionPoints(graphData.revenue, '총 수익', '#22c55e')}
                                        {renderInteractionPoints(graphData.availableFunds, '가용 자금', '#3b82f6')}
                                        {renderInteractionPoints(graphData.expenses, '총 지출', '#f87171')}
                                    </>
                                );
                            })()}
                        </svg>
                    </div>
                    <div className="chart-axis-x">
                        {Array.from({ length: 9 }).map((_, i) => {
                            const date = new Date();
                            date.setMonth(date.getMonth() - (8 - i));
                            return <span key={i}>{date.getMonth() + 1}월</span>;
                        })}
                    </div>
                </motion.div>

                {/* Monthly Spending Heatmap Section */}
                <motion.div className="card chart-card-lg" variants={item} style={{ position: 'relative' }}>
                    <div className="card-header">
                        <h3>월별 지출</h3>
                        <span className="month-label">{currentMonth}</span>
                        {/* Tooltip */}
                        {heatmapTooltip && (
                            <div className="heatmap-tooltip" style={{
                                left: heatmapTooltip.x,
                                top: heatmapTooltip.y,
                                position: 'absolute',
                                transform: 'translate(-50%, -120%)',
                                zIndex: 10
                            }}>
                                <span className="tooltip-value">{heatmapTooltip.month}월 {heatmapTooltip.day}일: {heatmapTooltip.amount.toLocaleString()}원</span>
                            </div>
                        )}
                    </div>
                    <div className="heatmap-container">
                        <div className="heatmap-grid" style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
                            {heatmapData.map((data, index) => (
                                <div
                                    key={index}
                                    className={`heatmap-cell level-${data.level}`}
                                    onMouseEnter={(e) => {
                                        const rect = e.target.getBoundingClientRect();
                                        const parent = e.target.closest('.chart-card-lg');
                                        const parentRect = parent.getBoundingClientRect();

                                        setHeatmapTooltip({
                                            day: data.day,
                                            month: new Date().getMonth() + 1,
                                            amount: data.amount,
                                            x: rect.left - parentRect.left + rect.width / 2,
                                            y: rect.top - parentRect.top
                                        });
                                    }}
                                    onMouseLeave={() => setHeatmapTooltip(null)}
                                ></div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Dense Data Table */}
                <motion.div className="card table-card-full" variants={item}>
                    <div className="card-header">
                        <h3>최근 소비 내역</h3>
                        <div className="header-actions">
                            <button className="icon-btn" onClick={() => setIsModalOpen(true)}>
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                    <div className="table-container">
                        <table className="dense-table">
                            <thead>
                                <tr>
                                    <th className="left">일자</th>
                                    <th className="left">소비 내역</th>
                                    <th className="left">카테고리</th>
                                    <th className="right">금액</th>
                                    <th className="center">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {financialRecords.length > 0 ? (
                                    financialRecords.map(row => (
                                        <tr key={row.financialRecordId}>
                                            <td className="left muted">
                                                {new Date(row.createdDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="left"><span className="row-title">{row.description}</span></td>
                                            <td className="left">{row.category}</td>
                                            <td className="right bold">
                                                {row.amount.toLocaleString()}원
                                            </td>
                                            <td className="center">
                                                <span className={`status-dot ${row.amount > 50000 ? 'over' : 'good'}`}></span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="center">데이터가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            disabled={pageInfo.first}
                            onClick={() => fetchRecords(pageInfo.pageNumber - 1)}
                        >
                            &lt; 이전
                        </button>
                        <span className="page-info">{pageInfo.pageNumber + 1} / {pageInfo.totalPages === 0 ? 1 : pageInfo.totalPages}</span>
                        <button
                            className="pagination-btn"
                            disabled={pageInfo.last}
                            onClick={() => fetchRecords(pageInfo.pageNumber + 1)}
                        >
                            다음 &gt;
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Add Transaction Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <div className="modal-header">
                                <h3>소비 내역 추가</h3>
                                <button className="close-btn" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleAddTransaction}>

                                <div className="form-group">
                                    <label>카테고리</label>
                                    <div className="category-chips-container">
                                        {categories.map((cat) => (
                                            <div
                                                key={cat}
                                                className={`category-chip ${newTransaction.category === cat ? 'selected' : ''}`}
                                                onClick={() => setNewTransaction({ ...newTransaction, category: cat })}
                                            >
                                                {cat}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>소비 내역</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="소비 내역 입력"
                                        value={newTransaction.desc}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, desc: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>금액</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="금액 입력"
                                        value={newTransaction.amount}
                                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>취소</button>
                                    <button type="submit" className="btn-submit">추가</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isStatusModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content status-modal"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                        >
                            <form onSubmit={handleStatusSubmit} className="status-modal-form">
                                <div className="modal-header">
                                    <h3>나의 재정 상태 설정</h3>
                                    <button type="button" className="close-btn" onClick={() => setIsStatusModalOpen(false)}><FaTimes /></button>
                                </div>

                                <div className="modal-body custom-scrollbar">
                                    {/* 1. Basic Info */}
                                    <div className="form-section">
                                        <div className="section-title"><FaUser /> 기본 인적 사항</div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>나이</label>
                                                <input type="number" className="form-input" value={statusData.age} onChange={e => setStatusData({ ...statusData, age: e.target.value })} placeholder="만 나이" required />
                                            </div>
                                            <div className="form-group">
                                                <label>직업 / 직군</label>
                                                <input type="text" className="form-input" value={statusData.job} onChange={e => setStatusData({ ...statusData, job: e.target.value })} placeholder="예: 개발자, 학생" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>가구 구성</label>
                                            <select className="form-input" value={statusData.household} onChange={e => setStatusData({ ...statusData, household: e.target.value })}>
                                                {households.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* 2. Financial Info */}
                                    <div className="form-section">
                                        <div className="section-title"><FaCoins /> 재무 기초 정보</div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>월 실수령액 (원)</label>
                                                <input type="number" className="form-input" value={statusData.income} onChange={e => setStatusData({ ...statusData, income: e.target.value })} placeholder="0" required />
                                            </div>
                                            <div className="form-group">
                                                <label>월 고정 지출 (원)</label>
                                                <input type="number" className="form-input" value={statusData.fixedExpense} onChange={e => setStatusData({ ...statusData, fixedExpense: e.target.value })} placeholder="0" required />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>총 자산 (원)</label>
                                                <input type="number" className="form-input" value={statusData.assets} onChange={e => setStatusData({ ...statusData, assets: e.target.value })} placeholder="0" />
                                            </div>
                                            <div className="form-group">
                                                <label>총 부채 (원)</label>
                                                <input type="number" className="form-input" value={statusData.debt} onChange={e => setStatusData({ ...statusData, debt: e.target.value })} placeholder="0" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. Goals & Values */}
                                    <div className="form-section">
                                        <div className="section-title"><FaBullseye /> 목표 및 가치관</div>
                                        <div className="form-group">
                                            <label>재무 목표</label>
                                            <div className="compound-input">
                                                <input type="text" className="form-input" value={statusData.goal} onChange={e => setStatusData({ ...statusData, goal: e.target.value })} placeholder="예: 1억 모으기" style={{ flex: 2 }} />
                                                <input type="number" className="form-input" value={statusData.goalAmount} onChange={e => setStatusData({ ...statusData, goalAmount: e.target.value })} placeholder="목표 금액" style={{ flex: 1 }} />
                                            </div>
                                            <div className="mt-2" style={{ width: '100%' }}>
                                                <DatePicker
                                                    selected={statusData.goalDate}
                                                    onChange={(date) => setStatusData({ ...statusData, goalDate: date })}
                                                    className="form-input"
                                                    dateFormat="yyyy-MM-dd"
                                                    locale="ko"
                                                    placeholderText="목표 달성 기한"
                                                    wrapperClassName="full-width-datepicker"
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="sub-label">소비 허용 (High Priority) - 아끼지 않는 분야</label>
                                            <div className="chip-group">
                                                {categories.map(cat => (
                                                    <div
                                                        key={cat}
                                                        className={`chip ${statusData.hightPriority.includes(cat) ? 'active' : ''}`}
                                                        onClick={() => toggleChip(cat, 'hightPriority')}
                                                    >
                                                        {cat}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="sub-label">소비 통제 (Low Priority) - 절약할 분야</label>
                                            <div className="chip-group">
                                                {categories.map(cat => (
                                                    <div
                                                        key={cat}
                                                        className={`chip red ${statusData.lowPriority.includes(cat) ? 'active' : ''}`}
                                                        onClick={() => toggleChip(cat, 'lowPriority')}
                                                    >
                                                        {cat}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Personality */}
                                    <div className="form-section">
                                        <div className="section-title"><FaFingerprint /> 성향 및 설정</div>
                                        <div className="form-group">
                                            <label>피드백 스타일</label>
                                            <div className="choice-btn-group">
                                                {['팩트 폭행', '칭찬과 위로'].map(style => (
                                                    <button
                                                        type="button"
                                                        key={style}
                                                        className={`choice-btn ${statusData.feedbackStyle === style ? 'active' : ''}`}
                                                        onClick={() => setStatusData({ ...statusData, feedbackStyle: style })}
                                                    >
                                                        {style}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>MBTI</label>
                                                <select className="form-input" value={statusData.mbti} onChange={e => setStatusData({ ...statusData, mbti: e.target.value })}>
                                                    <option value="">선택</option>
                                                    {mbtis.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>주 활동 시간</label>
                                                <select className="form-input" value={statusData.activityTime} onChange={e => setStatusData({ ...statusData, activityTime: e.target.value })}>
                                                    {times.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn-cancel" onClick={() => setIsStatusModalOpen(false)}>취소</button>
                                    <button type="submit" className="btn-submit">저장하기</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* AI Feedback Modal */}
            <AnimatePresence>
                {isAiModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content ai-modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                        >
                            <div className="ai-modal-header">
                                <FaRobot className="ai-modal-icon" />
                                <h3>AI Financial Guard</h3>
                                <button className="close-btn" onClick={() => setIsAiModalOpen(false)}><FaTimes /></button>
                            </div>

                            <div className="ai-modal-body">
                                {aiLoading ? (
                                    <div className="ai-loading-container">
                                        <div className="ai-scanner"></div>
                                        <p className="loading-text">지출 습관 분석중...</p>
                                        <div className="loading-steps">
                                            <span className="step complete">수입/지출 데이터 로드</span>
                                            <span className="step active">카테고리별 패턴 분석</span>
                                            <span className="step">또래 비교 알고리즘 실행</span>
                                        </div>
                                    </div>
                                ) : aiResult && aiResult.status === 'analyzing' ? (
                                    <div className="ai-loading-container">
                                        <FaRobot className="ai-icon bounce" style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                                        <p className="loading-text" style={{ color: '#fff' }}>{aiResult.message}</p>
                                    </div>
                                ) : (
                                    aiResult && (
                                        <div className="ai-result-container">
                                            <div className="score-section">
                                                <div className="score-ring">
                                                    <svg width="120" height="120">
                                                        <circle cx="60" cy="60" r="54" fill="none" stroke="#334155" strokeWidth="8" />
                                                        <circle
                                                            cx="60" cy="60" r="54" fill="none" stroke="#3b82f6" strokeWidth="8"
                                                            strokeDasharray="339.292"
                                                            strokeDashoffset={339.292 * (1 - aiResult.score / 100)}
                                                            strokeLinecap="round"
                                                            transform="rotate(-90 60 60)"
                                                        />
                                                    </svg>
                                                    <div className="score-value">
                                                        <span className="number">{aiResult.score}</span>
                                                        <span className="label">점</span>
                                                    </div>
                                                </div>
                                                <div className="score-text">
                                                    <h4>재무 건강 상태 {aiResult.status}</h4>
                                                    <p>{aiResult.summary}</p>
                                                </div>
                                            </div>

                                            <div className="insight-grid">
                                                {aiResult.details.map((detail, idx) => (
                                                    <div key={idx} className={`insight-card ${detail.type}`}>
                                                        <h5>{detail.category}</h5>
                                                        <p>{detail.content}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="action-plan">
                                                <h4>🚀 AI Action Plan</h4>
                                                <ul>
                                                    {aiResult.actions.map((action, idx) => (
                                                        <li key={idx}>
                                                            <span className="check-icon">✓</span>
                                                            {action}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FinancialManagerPage;
