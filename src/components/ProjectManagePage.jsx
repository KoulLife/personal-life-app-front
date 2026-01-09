import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectManagePage.css';
import { FaBolt, FaList, FaColumns, FaCode, FaShareAlt, FaChevronRight, FaChevronDown, FaPlus, FaArrowRight, FaCheck, FaCodeBranch, FaRegCalendarAlt } from 'react-icons/fa';

const ProjectManagePage = () => {
    const navigate = useNavigate();
    // State for tasks
    const [tasks, setTasks] = useState([]);
    // State for active input field (projectId)
    const [activeInputProjectId, setActiveInputProjectId] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

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
                        else if (group.status === 'IN_PROGRESS') statusClass = 'status-in_progress';

                        return {
                            id: group.projectGroupId,
                            title: group.groupName,
                            status: group.status,
                            statusClass: statusClass,
                            expanded: false,
                            totalCount: total,
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

    const handleToggleRow = async (taskId) => {
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
        // Toggle input mode for this active project
        if (activeInputProjectId === parentId) {
            // If already open, close it (cancel)
            setActiveInputProjectId(null);
            setNewTaskTitle('');
        } else {
            setActiveInputProjectId(parentId);
            setNewTaskTitle('');
        }
    };

    const handleKeyDown = (e, parentId) => {
        if (e.key === 'Enter') {
            submitNewTask(parentId);
        } else if (e.key === 'Escape') {
            setActiveInputProjectId(null);
            setNewTaskTitle('');
        }
    };

    const submitNewTask = (parentId) => {
        if (!newTaskTitle.trim()) {
            setActiveInputProjectId(null); // Just close if empty
            return;
        }

        setTasks(tasks.map(task => {
            if (task.id === parentId) {
                const newSubTask = {
                    id: Date.now(),
                    title: newTaskTitle,
                    status: 'TODO',
                    statusClass: 'status-todo',
                    timeline: { width: '0%', background: '#f5cd47' }
                };
                return { ...task, subtasks: [...task.subtasks, newSubTask], expanded: true };
            }
            return task;
        }));

        // Reset
        setActiveInputProjectId(null);
        setNewTaskTitle('');
        // TODO: Call API here to persist
    };

    const toggleSubtaskStatus = async (parentId, subtaskId, currentStatus) => {
        const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
        const isComplete = newStatus === 'DONE';

        // Optimistic Update
        setTasks(prev => prev.map(t => {
            if (t.id === parentId) {
                return {
                    ...t,
                    subtasks: t.subtasks.map(s =>
                        s.id === subtaskId
                            ? { ...s, status: newStatus, statusClass: isComplete ? 'status-done' : 'status-todo' }
                            : s
                    )
                };
            }
            return t;
        }));

        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${process.env.REACT_APP_API_URL}/project`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId: subtaskId,
                    completeStatus: isComplete
                })
            });
        } catch (error) {
            console.error('Error updating status:', error);
        }
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
                            <div className="header-cell">Project Name</div>
                        </div>

                        {tasks.map(task => (
                            <React.Fragment key={task.id}>
                                {/* Parent Task Row */}
                                <div className="task-row">
                                    {/* Progress Background */}
                                    <div className="inline-progress-container">
                                        <div className="inline-progress-bar"
                                            style={{
                                                width: task.timeline.width,
                                                background: task.timeline.background
                                            }}
                                        ></div>
                                    </div>
                                    {/* Progress Bottom Line */}
                                    <div className="inline-progress-line"
                                        style={{
                                            width: task.timeline.width,
                                            background: task.timeline.background
                                        }}
                                    ></div>

                                    <div className="task-info">
                                        <div className="task-left-group" style={{ alignItems: 'flex-start', paddingTop: '4px' }}>
                                            <div className="chevron-wrapper" onClick={() => handleToggleRow(task.id)} style={{ marginTop: '2px' }}>
                                                {task.expanded ? <FaChevronDown className="expand-icon" /> : <FaChevronRight className="expand-icon" />}
                                            </div>
                                            <div className="task-text-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                                                <div className="task-title-wrapper" onClick={() => handleToggleRow(task.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <FaBolt style={{ color: '#9d46ff', fontSize: '12px' }} />
                                                    <span className="task-title">{task.title}</span>
                                                    <button className="detail-btn" onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/dashboard/project-group/${task.id}`);
                                                    }}>Detail <FaArrowRight size={10} /></button>
                                                </div>
                                                <div className="task-metadata" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FaList size={10} /> {task.totalCount || 0} Projects
                                                    </span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff6b6b' }}>
                                                        <FaRegCalendarAlt size={10} /> D-3
                                                    </span>
                                                    {/* Percentage Text */}
                                                    <span className="progress-text" style={{ color: task.timeline.background }}>
                                                        {task.timeline.width}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="task-right-group">
                                            <span className={`task-status-badge ${task.statusClass}`}>{task.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Subtasks */}
                                {task.expanded && (
                                    <>
                                        {task.subtasks.map(subtask => (
                                            <div className="nested-row" key={subtask.id} style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                                <div className="task-info" style={{ paddingLeft: '40px', borderTop: 'none' }}>
                                                    <div className="subtask-left-group">
                                                        <div
                                                            className={`custom-checkbox ${subtask.status === 'DONE' ? 'checked' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleSubtaskStatus(task.id, subtask.id, subtask.status);
                                                            }}
                                                        >
                                                            {subtask.status === 'DONE' && <FaCheck size={12} />}
                                                        </div>
                                                        <div className="subtask-text-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '12px' }}>
                                                            <div className="subtask-title">
                                                                {subtask.title}
                                                            </div>
                                                            <div className="subtask-metadata" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <FaCodeBranch size={10} /> 3/5
                                                                </span>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ff6b6b' }}>
                                                                    <FaRegCalendarAlt size={10} /> 2025년 12월 29일
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Subtask Progress - simplified, full visual feedback */}
                                                <div className="inline-progress-line"
                                                    style={{
                                                        width: subtask.timeline.width,
                                                        background: subtask.timeline.background,
                                                        height: '1px',
                                                        opacity: 0.5
                                                    }}
                                                ></div>
                                            </div>
                                        ))}

                                        {/* Add Subtask Button or Input */}
                                        <div className="task-row nested-row">
                                            <div className="task-info" style={{ paddingLeft: '40px' }}>
                                                {activeInputProjectId === task.id ? (
                                                    <div className="task-creation-wrapper">
                                                        <input
                                                            type="text"
                                                            className="new-task-input"
                                                            placeholder="What needs to be done?"
                                                            value={newTaskTitle}
                                                            onChange={(e) => setNewTaskTitle(e.target.value)}
                                                            onKeyDown={(e) => handleKeyDown(e, task.id)}
                                                            autoFocus
                                                        />
                                                        <div className="creation-actions">
                                                            <button
                                                                className="btn-add"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    submitNewTask(task.id);
                                                                }}
                                                            >
                                                                Add
                                                            </button>
                                                            <button
                                                                className="btn-cancel"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveInputProjectId(null);
                                                                    setNewTaskTitle('');
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="subtask-left-group" style={{ cursor: 'pointer', color: '#6e8efb' }} onClick={() => addSubTask(task.id)}>
                                                        <FaPlus style={{ fontSize: '10px', marginRight: '8px' }} />
                                                        <span style={{ fontSize: '12px' }}>Create Task</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </React.Fragment>
                        ))}

                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProjectManagePage;
