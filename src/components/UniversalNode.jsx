import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlus } from 'react-icons/fa';

const UniversalNode = ({ data, selected }) => {
    const isService = data.type === 'service';
    const borderColor = isService ? '#4da6ff' : '#00e676';
    const glowColor = isService ? 'rgba(77, 166, 255, 0.4)' : 'rgba(0, 230, 118, 0.4)';

    const nodeStyle = {
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%)',
        border: `1px solid ${selected ? borderColor : '#555'}`,
        borderRadius: '12px',
        color: '#fff',
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: selected ? `0 0 15px ${glowColor}` : '0 4px 6px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
    };

    const handleStyle = { background: '#aaa', width: '8px', height: '8px', border: 'none' };

    // Icon wrapper style
    const iconStyle = {
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: isService ? 'rgba(77, 166, 255, 0.15)' : 'rgba(0, 230, 118, 0.15)',
        color: isService ? '#4da6ff' : '#00e676',
        fontSize: '16px'
    };

    return (
        <div style={nodeStyle}>
            <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
            <Handle type="target" position={Position.Left} id="left" style={handleStyle} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {data.icon && <div style={iconStyle}>{data.icon}</div>}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{data.label}</span>
                        <span style={{ fontSize: '10px', color: '#888' }}>{data.category}</span>
                    </div>
                </div>

                <div style={{
                    opacity: '0.6',
                    cursor: 'pointer',
                    marginLeft: '15px'
                }}>
                    <FaPlus style={{ fontSize: '12px' }} />
                </div>
            </div>

            <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
            <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
        </div>
    );
};

export default memo(UniversalNode);
