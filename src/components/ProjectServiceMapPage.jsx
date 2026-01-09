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
import { FaArrowLeft, FaCheckCircle, FaCube, FaPlus, FaSave, FaTimes, FaLink } from 'react-icons/fa';

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

    // Creation State
    const [selectedNode, setSelectedNode] = useState(null);
    const [newProjectContent, setNewProjectContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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
        setIsCreating(true); // Open panel on click
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setIsCreating(false); // Close panel when clicking on pane
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
                setSelectedNode(null); // Clear selected node after creation
                setIsCreating(false); // Close panel after creation
                fetchData(); // Refresh graph
            } else {
                console.error('Failed to create project');
            }
        } catch (error) {
            console.error('Error creating project:', error);
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

            {/* Creation Panel */}
            <div className={`creation-panel ${isCreating ? 'panel-active' : ''}`}>
                <div className="panel-header">
                    <span className="panel-label">
                        {selectedNode ? <><FaLink /> Linked to: <strong>{selectedNode.data.label}</strong></> : <><FaPlus /> New Root Project</>}
                    </span>
                    {isCreating &&
                        <button className="panel-close-btn" onClick={() => { setSelectedNode(null); setIsCreating(false); setNewProjectContent(''); }}><FaTimes /></button>
                    }
                </div>
                <div className="panel-body">
                    <input
                        type="text"
                        className="creation-input"
                        placeholder="Enter project name..."
                        value={newProjectContent}
                        onChange={(e) => setNewProjectContent(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    />
                    <button className="creation-submit-btn" onClick={handleCreateProject}>
                        <FaSave /> Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectServiceMapPage;
