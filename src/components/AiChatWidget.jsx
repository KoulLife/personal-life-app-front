import React, { useState, useRef, useEffect } from 'react';
import './AiChatWidget.css';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';

const AiChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "학습하고 싶은 것이나 시작하고 싶은 프로젝트 이름만 알려주세요. 자동으로 할 일을 추가해 드릴게요!", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
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

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newUserMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue('');

        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/chat?message=${encodeURIComponent(inputValue)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.text(); // Assuming endpoint returns String
                const botResponse = {
                    id: Date.now() + 1,
                    text: data,
                    sender: 'bot'
                };
                setMessages(prev => [...prev, botResponse]);
            } else {
                console.error('Failed to get AI response');
                const errorResponse = {
                    id: Date.now() + 1,
                    text: "죄송합니다. AI 응답을 가져오는데 실패했습니다.",
                    sender: 'bot'
                };
                setMessages(prev => [...prev, errorResponse]);
            }
        } catch (error) {
            console.error('Error calling AI API:', error);
            const errorResponse = {
                id: Date.now() + 1,
                text: "로그인이 필요하거나 서버에 연결할 수 없습니다.",
                sender: 'bot'
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
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
                        <button type="submit" className="chat-send-btn" disabled={isLoading}>
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
