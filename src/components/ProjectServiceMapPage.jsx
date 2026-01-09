import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
    addEdge,
    ConnectionLineType,
    Panel,
    useNodesState,
    useEdgesState,
    MarkerType,
    Background,
    Controls,
    MiniMap,
    Handle,
    Position
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import './ProjectServiceMapPage.css';
import { FaArrowLeft, FaCheckCircle, FaCube, FaPlus, FaSave, FaTimes, FaLink, FaTrash, FaPen, FaUndo, FaCheck } from 'react-icons/fa';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 80;

// Custom Node Component to achieve the "Trendy" look
const CustomNode = ({ data, selected }) => {
    const isDone = data.status === 'DONE';
    return (
        <div className={`custom-node-shell ${isDone ? 'node-done' : 'node-progress'} ${selected ? 'node-selected' : ''}`}>
            <Handle type="target" position={Position.Left} className="handle-custom" />

            <div className="node-content">
                <div className="node-icon-wrapper">
                    {isDone ? <FaCheckCircle className="node-icon done" /> : <FaCube className="node-icon progress" />}
                </div>
                <div className="node-text">
                    <div className="node-label">{data.label}</div>
                    <div className="node-sub">Project ID: {data.originalId}</div>
                </div>
                {/* Status Indicator Bar */}
                <div className="status-bar-vertical"></div>
            </div>
            {/* Glossy Effect Overlay */}
            <div className="gloss-overlay"></div>

            <Handle type="source" position={Position.Right} className="handle-custom" />
        </div>
    );
};

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({
        rankdir: direction,
        ranksep: 200, // Horizontal gap (for LR)
        nodesep: 80   // Vertical gap
    });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const ProjectServiceMapPage = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [projectGroup, setProjectGroup] = useState(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // Creation & Edit State
    const [selectedNode, setSelectedNode] = useState(null);
    const [newProjectContent, setNewProjectContent] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Register Custom Node
    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
            ),
        [setEdges]
    );

    const fetchData = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/project-group/${groupId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProjectGroup(data);

                const projects = data.projects || [];
                const newNodes = [];
                const newEdges = [];

                projects.forEach((proj) => {
                    newNodes.push({
                        id: proj.projectId.toString(),
                        type: 'custom',
                        data: {
                            label: proj.content,
                            status: proj.completeStatus ? 'DONE' : 'IN_PROGRESS',
                            originalId: proj.projectId
                        },
                        position: { x: 0, y: 0 },
                    });

                    if (proj.nextProjectIds && proj.nextProjectIds.length > 0) {
                        proj.nextProjectIds.forEach(nextId => {
                            newEdges.push({
                                id: `e${proj.projectId}-${nextId}`,
                                source: proj.projectId.toString(),
                                target: nextId.toString(),
                                type: 'smoothstep',
                                animated: true,
                                markerEnd: {
                                    type: MarkerType.ArrowClosed,
                                    width: 20,
                                    height: 20,
                                    color: '#6e8efb',
                                },
                                style: {
                                    stroke: '#6e8efb',
                                    strokeWidth: 2,
                                },
                            });
                        });
                    }
                });

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    newNodes,
                    newEdges
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            }
        } catch (error) {
            console.error('Error fetching project group:', error);
        }
    }, [groupId, setNodes, setEdges]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onNodeClick = useCallback((event, node) => {
        setSelectedNode(node);
        setEditContent(node.data.label); // Init edit content
        setIsPanelOpen(true); // Open panel on click
        setIsEditing(false); // Reset edit mode
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setIsPanelOpen(false); // Close panel when clicking on pane
    }, []);

    const handleCreateProject = async () => {
        if (!newProjectContent.trim()) return;

        try {
            const token = localStorage.getItem('accessToken');
            const finalPayload = {
                content: newProjectContent,
                prevProjectId: selectedNode ? parseInt(selectedNode.id) : null,
                projectGroupId: parseInt(groupId)
            };

            const response = await fetch(`${process.env.REACT_APP_API_URL}/project`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(finalPayload)
            });

            if (response.ok) {
                setNewProjectContent('');
                // Keep panel open to show connection? Or close? User might want to add more.
                // But typically we refresh graph.
                fetchData();
            } else {
                console.error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    const handleEditProject = async () => {
        if (!selectedNode || !editContent.trim()) return;
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${process.env.REACT_APP_API_URL}/project/${selectedNode.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                },
                body: editContent
            });
            fetchData(); // Refresh to show new name
            setIsEditing(false); // Turn off edit mode
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const handleDeleteProject = async () => {
        if (!selectedNode || !window.confirm('Are you sure you want to delete this project?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${process.env.REACT_APP_API_URL}/project/${selectedNode.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSelectedNode(null);
            setIsPanelOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleToggleStatus = async () => {
        if (!selectedNode) return;
        const isDone = selectedNode.data.status === 'DONE';
        const endpoint = isDone ? 'undo-complete' : 'complete';

        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${process.env.REACT_APP_API_URL}/project/${selectedNode.id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Updating local state immediately for better UX before fetch?
            // Or just fetch. Let's fetch for consistency.
            fetchData();
            // Update selected node status locally so UI reflects it immediately if we don't close panel
            setSelectedNode(prev => ({
                ...prev,
                data: { ...prev.data, status: isDone ? 'IN_PROGRESS' : 'DONE' }
            }));
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    return (
        <div className="service-map-container">
            <div className="map-header">
                <button
                    onClick={() => navigate(-1)}
                    className="map-back-btn"
                >
                    <FaArrowLeft /> Back
                </button>
                <div className="map-title-group">
                    <h1>{projectGroup ? projectGroup.groupName : 'Loading...'}</h1>
                    <span className="map-badge">SERVICE MAP</span>
                </div>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.1}
                attributionPosition="bottom-left"
            >
                <Background color="#444" gap={20} size={1} />
                <Controls />
                <MiniMap style={{ background: '#12121a', border: '1px solid rgba(255,255,255,0.1)' }}
                    nodeColor={(n) => {
                        if (n.data.status === 'DONE') return '#4bce97';
                        return '#579dff';
                    }}
                />
            </ReactFlow>

            {/* Detail & Global Creation Panel */}
            <div className={`creation-panel ${isPanelOpen ? 'panel-active' : ''}`}>
                <div className="panel-header">
                    <span className="panel-label">
                        {selectedNode ? <><FaLink /> Project Details</> : <><FaPlus /> New Root Project</>}
                    </span>
                    {isPanelOpen &&
                        <button className="panel-close-btn" onClick={() => { setSelectedNode(null); setIsPanelOpen(false); setNewProjectContent(''); }}><FaTimes /></button>
                    }
                </div>

                <div className="panel-body">
                    {selectedNode ? (
                        <>
                            {/* Section 1: Manage Selected Node */}
                            <div className="panel-section">
                                <div className="section-title">Selected Project</div>

                                {isEditing ? (
                                    <div className="edit-row">
                                        <input
                                            type="text"
                                            className="creation-input"
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleEditProject()}
                                            autoFocus
                                        />
                                        <button className="icon-btn save-btn" onClick={handleEditProject} title="Save Name"><FaSave /></button>
                                        <button className="icon-btn cancel-btn" onClick={() => setIsEditing(false)} title="Cancel"><FaTimes /></button>
                                    </div>
                                ) : (
                                    <div className="display-row">
                                        <span className="display-label">{selectedNode.data.label}</span>
                                        <button className="icon-btn edit-btn" onClick={() => setIsEditing(true)} title="Edit Name"><FaPen /></button>
                                    </div>
                                )}

                                <div className="action-row">
                                    <button
                                        className={`action-btn ${selectedNode.data.status === 'DONE' ? 'btn-undo' : 'btn-complete'}`}
                                        onClick={handleToggleStatus}
                                    >
                                        {selectedNode.data.status === 'DONE' ? <><FaUndo /> Undo Complete</> : <><FaCheck /> Complete</>}
                                    </button>
                                    <button className="action-btn btn-delete" onClick={handleDeleteProject}>
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>

                            <div className="panel-divider"></div>

                            {/* Section 2: Create Next Step */}
                            <div className="panel-section">
                                <div className="section-title">Create Next Step</div>
                                <div className="create-row">
                                    <input
                                        type="text"
                                        className="creation-input"
                                        placeholder="Next project name..."
                                        value={newProjectContent}
                                        onChange={(e) => setNewProjectContent(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                                    />
                                    <button className="creation-submit-btn" onClick={handleCreateProject}>
                                        <FaPlus /> Add
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Root Creation Mode */
                        <div className="create-row">
                            <input
                                type="text"
                                className="creation-input"
                                placeholder="Root project name..."
                                value={newProjectContent}
                                onChange={(e) => setNewProjectContent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                            />
                            <button className="creation-submit-btn" onClick={handleCreateProject}>
                                <FaPlus /> Create
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectServiceMapPage;
