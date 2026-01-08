import React, { useState, useEffect } from 'react';
import './ProjectManagePage.css';
import { FaBolt, FaList, FaColumns, FaCode, FaShareAlt, FaChevronRight, FaChevronDown, FaPlus } from 'react-icons/fa';

const ProjectManagePage = () => {
    // State for tasks
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const fetchProjectGroups = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${process.env.REACT_APP_API_URL}/project-group`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const mappedTasks = data.map(group => {
                        // Calculate progress percentage
                        const total = group.totalProjectCount || 0;
                        const completed = group.completedProjectCount || 0;
                        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

                        // Map status to CSS class
                        let statusClass = 'status-todo';
                        if (group.status === 'DONE') statusClass = 'status-done';
                        else if (group.status === 'IN_PROGRESS') statusClass = 'status-progress';

                        return {
                            id: group.projectGroupId,
                            title: group.groupName,
                            status: group.status,
                            statusClass: statusClass,
                            expanded: false,
                            timeline: { width: `${percentage}%`, background: getProgressColor(percentage) },
                            subtasks: [] // API doesn't provide subtasks yet, initializing empty
                        };
                    });
                    setTasks(mappedTasks);
                } else {
                    console.error('Failed to fetch project groups');
                }
            } catch (error) {
                console.error('Error fetching project groups:', error);
            }
        };

        fetchProjectGroups();
    }, []);

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return '#4bce97'; // Green
        if (percentage > 0) return '#579dff';   // Blue
        return '#f5cd47';                       // Yellow/Default
    };

    const toggleRow = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);

        // If we are about to expand
        if (!task.expanded) {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${process.env.REACT_APP_API_URL}/project-group/${taskId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // Map projects to subtasks
                    const subtasks = (data.projects || []).map(p => ({
                        id: p.projectId,
                        title: p.content,
                        status: p.completeStatus ? 'DONE' : 'TODO',
                        statusClass: p.completeStatus ? 'status-done' : 'status-todo',
                        timeline: {
                            width: p.completeStatus ? '100%' : '0%',
                            background: p.completeStatus ? '#4bce97' : '#f5cd47'
                        }
                    }));

                    setTasks(prev => prev.map(t =>
                        t.id === taskId ? { ...t, subtasks: subtasks, expanded: true } : t
                    ));
                    return;
                }
            } catch (error) {
                console.error('Error fetching project details:', error);
            }
        }

        // Default toggling behavior (collapse or fallback if fetch fails)
        setTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, expanded: !t.expanded } : t
        ));
    };

    const addSubTask = (parentId) => {
        // ... (Keep existing logic, possibly update to call API in future)
        const title = prompt("Enter sub-task title:");
        if (!title) return;

        setTasks(tasks.map(task => {
            if (task.id === parentId) {
                const newSubTask = {
                    id: Date.now(),
                    title: title,
                    status: 'TODO',
                    statusClass: 'status-todo',
                    timeline: { width: '0%', background: '#f5cd47' }
                };
                return { ...task, subtasks: [...task.subtasks, newSubTask], expanded: true };
            }
            return task;
        }));
    };

    return (
        <div className="project-manage-container">
            {/* Secondary Sidebar (Project specific) */}
            <div className="project-sidebar">
                <div className="project-info">
                    <div className="project-icon">TB</div>
                    <div className="project-details">
                        <div className="project-name">Travel Booking</div>
                        <div className="project-cat">Software project</div>
                    </div>
                </div>

                <div className="project-menu-label">Planning</div>
                <div className="project-menu-item active">
                    <FaList className="project-menu-icon" />
                    <span>Roadmap</span>
                </div>
                <div className="project-menu-item">
                    <FaList className="project-menu-icon" /> {/* Using List for backlog too */}
                    <span>Backlog</span>
                </div>
                <div className="project-menu-item">
                    <FaColumns className="project-menu-icon" />
                    <span>Board</span>
                </div>

                <div className="project-menu-label" style={{ marginTop: '20px' }}>Development</div>
                <div className="project-menu-item">
                    <FaCode className="project-menu-icon" />
                    <span>Code</span>
                </div>
            </div>

            {/* Main Project Content */}
            <div className="project-content">
                {/* Header */}
                <div className="project-header">
                    <div className="header-title">
                        <div className="breadcrumb">Projects / Travel Booking App</div>
                        <h1>Roadmap</h1>
                    </div>

                    <div className="header-controls">
                        <button className="control-btn"><FaShareAlt /> Share</button>
                        <button className="control-btn"><FaShareAlt /> Export</button>
                        <button className="control-btn primary-btn">Create</button>
                    </div>
                </div>

                {/* Roadmap Content */}
                <div className="roadmap-container">
                    <div className="roadmap-search-bar">
                        <input type="text" className="search-input" placeholder="Search epics..." />

                        <div className="filter-group">
                            <div className="user-avatars">
                                <div className="avatar" style={{ background: '#FF5722' }}>JD</div>
                                <div className="avatar" style={{ background: '#2196F3' }}>AS</div>
                                <div className="avatar" style={{ background: '#4CAF50' }}>MR</div>
                                <div className="avatar" style={{ background: '#607D8B' }}>+2</div>
                            </div>

                            <button className="control-btn">Status category</button>
                            <button className="control-btn">Version</button>
                        </div>
                    </div>

                    {/* Gantt Chart Implementation */}
                    <div className="gantt-chart">
                        <div className="chart-header">
                            <div className="header-cell">Task Name</div>
                            <div className="timeline-months">
                                <div className="month-cell">25%</div>
                                <div className="month-cell">50%</div>
                                <div className="month-cell">75%</div>
                                <div className="month-cell">100%</div>
                            </div>
                        </div>

                        {tasks.map(task => (
                            <React.Fragment key={task.id}>
                                {/* Parent Task Row */}
                                <div className="task-row">
                                    <div className="task-info">
                                        <div className="task-title-wrapper" onClick={() => toggleRow(task.id)}>
                                            {task.expanded ? <FaChevronDown className="expand-icon" /> : <FaChevronRight className="expand-icon" />}
                                            <div className="task-title"><FaBolt style={{ color: '#9d46ff' }} /> {task.title}</div>
                                        </div>
                                        <span className={`task-status ${task.statusClass}`}>{task.status}</span>
                                    </div>
                                    <div className="timeline-track">
                                        <div className="timeline-bar"
                                            style={{ ...task.timeline, left: '0%' }}></div>
                                    </div>
                                </div>

                                {/* Subtasks */}
                                {task.expanded && (
                                    <>
                                        {task.subtasks.map(subtask => (
                                            <div className="task-row nested-row" key={subtask.id}>
                                                <div className="task-info">
                                                    <div className="task-title" style={{ paddingLeft: '20px' }}>
                                                        <FaList style={{ color: '#4bce97', fontSize: '12px', marginRight: '8px' }} />
                                                        {subtask.title}
                                                    </div>
                                                    <span className={`task-status ${subtask.statusClass}`}>{subtask.status}</span>
                                                </div>
                                                <div className="timeline-track">
                                                    {/* Simple logic for subtask bar, can be improved */}
                                                    <div className="timeline-bar" style={{ ...subtask.timeline, left: '0%' }}></div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add Subtask Button */}
                                        <div className="task-row nested-row">
                                            <div className="task-info" style={{ paddingLeft: '40px', cursor: 'pointer', color: '#6e8efb' }} onClick={() => addSubTask(task.id)}>
                                                <div className="task-title"><FaPlus style={{ fontSize: '10px' }} /> Create child issue</div>
                                            </div>
                                            <div className="timeline-track"></div>
                                        </div>
                                    </>
                                )}
                            </React.Fragment>
                        ))}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectManagePage;
