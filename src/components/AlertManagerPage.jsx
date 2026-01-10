import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import './AlertManagerPage.css';
import AlertSidebar from './AlertSidebar';
import ConfirmationModal from './ConfirmationModal';
import UniversalNode from './UniversalNode';

const AlertManagerPage = () => {
    // Clear initial nodes
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const nodeTypes = useMemo(() => ({ universal: UniversalNode }), []);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );
    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#aaa' } }, eds)),
        [],
    );

    const handleAddNode = (label, type, icon, category) => {
        const id = `${nodes.length + 1}`;
        const newNode = {
            id,
            type: 'universal', // Use our custom node
            position: { x: Math.random() * 400 + 100, y: Math.random() * 200 + 100 }, // Random position near center
            data: { label, type, icon, category },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const handleSaveClick = () => {
        setIsModalOpen(true);
    };

    const handleConfirmSave = () => {
        // Save logic here (e.g., API call)
        setIsModalOpen(false);
    };

    return (
        <div className="alert-manager-container">
            <ConfirmationModal
                isOpen={isModalOpen}
                title="저장 확인"
                message="현재 알람 구성을 저장하시겠습니까?"
                onConfirm={handleConfirmSave}
                onCancel={() => setIsModalOpen(false)}
            />
            <div className="alert-manager-header">
                <div className="workflow-title">Alert Manager</div>
                <div className="header-actions">
                    <button className="btn-secondary">비활성</button>

                    <button className="btn-primary" onClick={handleSaveClick}>저장</button>
                </div>
            </div>
            <div className="workspace-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div className="flow-container" style={{ flex: 1, position: 'relative' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        fitView
                        attributionPosition="bottom-right"
                    >
                        <Background color="#555" gap={16} />
                        <Controls />
                        <MiniMap nodeStrokeColor={(n) => '#fff'} nodeColor={(n) => '#333'} maskColor="rgba(0, 0, 0, 0.6)" />
                    </ReactFlow>
                </div>
                <AlertSidebar onAddNode={handleAddNode} />
            </div>
        </div>
    );
};

export default AlertManagerPage;
