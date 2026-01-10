import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-title">{title}</div>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onCancel}>
                        취소
                    </button>
                    <button className="modal-btn confirm" onClick={onConfirm}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
