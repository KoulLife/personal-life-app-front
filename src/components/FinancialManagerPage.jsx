import React, { useState } from 'react';
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

    // Transaction Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({ date: new Date(), desc: '', amount: '' });

    // Financial Status Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
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
    const categories = ['식비', '카페/간식', '술/유흥', '생활용품', '의류/미용', '취미/여가', '자기계발', '교통/차량', '주거/통신', '경조사/선물'];
    const times = ['새벽 (00~06시)', '오전 (06~12시)', '오후 (12~18시)', '저녁 (18~22시)', '심야 (22~24시)'];

    // Mock Data for Table
    const [transactions, setTransactions] = useState([
        { id: 1, date: '3월 23일', desc: 'IT 인프라 구축', category: 'Software', budget: '-₩4,556,000', actual: '-₩6,485,000', variance: '₩1,902,000', status: 'Over' },
        { id: 2, date: '3월 23일', desc: 'Adobe Creative Cloud', category: 'Software', budget: '-₩1,108,000', actual: '-₩1,381,000', variance: '₩273,000', status: 'Warning' },
        { id: 3, date: '3월 22일', desc: '프리랜서 정산', category: 'Income', budget: '₩5,000,000', actual: '₩5,200,000', variance: '+₩200,000', status: 'Good' },
        { id: 4, date: '3월 20일', desc: 'AWS 서버 비용', category: 'Infrastructure', budget: '-₩2,000,000', actual: '-₩1,850,000', variance: '-₩150,000', status: 'Good' },
        { id: 5, date: '3월 18일', desc: '사무용품 구매', category: 'Operations', budget: '-₩500,000', actual: '-₩450,000', variance: '-₩50,000', status: 'Good' },
        { id: 6, date: '3월 15일', desc: '마케팅 캠페인', category: 'Marketing', budget: '-₩3,000,000', actual: '-₩3,500,000', variance: '₩500,000', status: 'Warning' },
    ]);

    // Generate Heatmap Data for Current Month (Jan 2026)
    const currentDate = new Date('2026-01-10'); // Fixed to current simulation time
    const currentMonth = currentDate.toLocaleString('ko-KR', { month: 'long', year: 'numeric' });
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const heatmapData = Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dateStr = `${currentDate.getMonth() + 1}월 ${day}일`;
        // Mock random levels and amounts for "actual" feel
        const level = Math.floor(Math.random() * 5); // 0-4
        const amount = level === 0 ? '0' : (Math.floor(Math.random() * 20) + 1) * 10000;
        return {
            date: dateStr,
            level: level,
            amount: level === 0 ? '0원' : `₩${amount.toLocaleString()}`
        };
    });

    const handleAddTransaction = (e) => {
        e.preventDefault();

        // Format date to "MMM DD" style like existing data -> Korean style "MM월 DD일"
        const dateStr = newTransaction.date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

        const newItem = {
            id: Date.now(),
            date: dateStr,
            desc: newTransaction.desc,
            category: 'Manual',
            budget: '-',
            actual: `₩${Number(newTransaction.amount).toLocaleString()}`,
            variance: '-',
            status: 'Good'
        };
        setTransactions([newItem, ...transactions]);
        setIsModalOpen(false);
        setNewTransaction({ date: new Date(), desc: '', amount: '' });
    };

    const handleStatusSubmit = (e) => {
        e.preventDefault();
        console.log("Status Data Submitted:", statusData);
        alert("재정 상태가 업데이트 되었습니다. AI 분석이 시작됩니다.");
        setIsStatusModalOpen(false);
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
                    <div className="card-value">₩ 3,123,094,000</div>
                    <div className="card-trend positive"> + ₩ 1,234,560 (전월 대비)</div>
                </motion.div>

                <motion.div className="metric-card funds" variants={item}>
                    <div className="card-label">가용 자금</div>
                    <div className="card-value">₩ 300,941,000</div>
                    <div className="card-trend positive"> + 12% (예상 대비)</div>
                </motion.div>

                <motion.div className="metric-card expenses" variants={item}>
                    <div className="card-label">총 지출</div>
                    <div className="card-value">₩ 14,000,000</div>
                    <div className="card-trend negative"> - 1.2% (목표 대비)</div>
                </motion.div>

                <motion.div
                    className="metric-card ai-feedback-card"
                    variants={item}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => alert("AI 분석 모달이 여기에 열립니다.")}
                >
                    <div className="card-label">AI 리포트</div>
                    <div className="card-value flex-center">
                        <span>AI 피드백 확인</span>
                    </div>
                    <div className="card-trend positive"> 2개의 새로운 제안</div>
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
                <motion.div className="card chart-card-lg" variants={item}>
                    <div className="card-header">
                        <h3>재무 그래프</h3>
                    </div>
                    <div className="chart-legend">
                        <span className="legend-item"><span className="dot green"></span>총 수익</span>
                        <span className="legend-item"><span className="dot blue"></span>가용 자금</span>
                        <span className="legend-item"><span className="dot red"></span>총 지출</span>
                    </div>
                    <div className="mock-line-chart">
                        <svg width="100%" height="100%" viewBox="0 0 500 150" preserveAspectRatio="none">
                            <polyline fill="none" stroke="#22c55e" strokeWidth="2" points="0,110 50,105 100,60 150,70 200,50 250,45 300,40 350,35 400,30 450,25 500,20" />
                            <polyline fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" points="0,90 50,85 100,50 150,55 200,60 250,50 300,55 350,60 400,65 450,70 500,75" />
                            <polyline fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="2" points="0,130 50,125 100,120 150,115 200,110 250,105 300,100 350,95 400,110 450,115 500,120" />
                        </svg>
                    </div>
                    <div className="chart-axis-x">
                        <span>1월</span><span>2월</span><span>3월</span><span>4월</span><span>5월</span><span>6월</span><span>7월</span><span>8월</span><span>9월</span>
                    </div>
                </motion.div>

                {/* Monthly Spending Heatmap Section */}
                <motion.div className="card chart-card-lg" variants={item}>
                    <div className="card-header">
                        <h3>월별 지출</h3>
                        <span className="month-label">{currentMonth}</span>
                    </div>
                    <div className="heatmap-container">
                        <div className="heatmap-grid" style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
                            {heatmapData.map((data, index) => (
                                <div
                                    key={index}
                                    className={`heatmap-cell level-${data.level}`}
                                    title={`${data.date}: ${data.amount}`}
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
                                    <th className="left">금액</th>
                                    <th className="right">여유 금액</th>
                                    <th className="center">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(row => (
                                    <tr key={row.id}>
                                        <td className="left muted">{row.date}</td>
                                        <td className="left"><span className="row-title">{row.desc}</span></td>
                                        <td className="left bold">{row.actual}</td>
                                        <td className="right">
                                            <span className={`variance-tag ${row.variance.includes('-') ? 'good' : 'bad'}`}>
                                                {row.variance}
                                            </span>
                                        </td>
                                        <td className="center">
                                            <span className={`status-dot ${row.status.toLowerCase()}`}></span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                    <label>일자</label>
                                    <div className="custom-datepicker-wrapper">
                                        <DatePicker
                                            selected={newTransaction.date}
                                            onChange={(date) => setNewTransaction({ ...newTransaction, date })}
                                            className="form-input"
                                            dateFormat="yyyy-MM-dd"
                                            locale="ko"
                                        />
                                        <FaCalendarAlt className="calendar-icon" />
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

            {/* Financial Status Modal */}
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
        </div>
    );
};

export default FinancialManagerPage;
