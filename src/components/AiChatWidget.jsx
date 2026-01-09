import React, { useState, useRef, useEffect } from 'react';
import './AiChatWidget.css';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

const AiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "학습하고 싶은 것이나 시작하고 싶은 프로젝트 이름만 알려주세요. 자동으로 할 일을 추가해 드릴게요!", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');

        // Simulate Bot Response
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                text: "I'm currently a demo interface. Real AI integration coming soon!",
                sender: 'bot'
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="ai-chat-window">
                    <div className="chat-header">
                        <div className="chat-title">
                            <FaRobot style={{ color: '#6e8efb' }} />
                            AI Assistant
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" className="chat-send-btn">
                            <FaPaperPlane size={14} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Action Button */}
            <button
                className={`ai-chat-fab ${isOpen ? 'open' : ''}`}
                onClick={toggleChat}
                aria-label="Toggle AI Chat"
            >
                {<FaRobot />}
            </button>
        </>
    );
};

export default AiChatWidget;
