import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';
import { FaUser, FaLock } from 'react-icons/fa';
import bgImage from '../assets/images/login-backgrounds/login-background.jpg';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
            }

            const data = await response.json();

            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('tokenType', data.tokenType);
                alert('로그인 성공!');
                // Navigate to dashboard or home page if needed
                // window.location.href = '/'; 
            } else {
                throw new Error('토큰을 받아오지 못했습니다.');
            }

        } catch (err) {
            console.error('Login Error:', err);
            setError(err.message || '로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="overlay"></div>
            <div className="login-card">
                <div className="login-header">
                    <h2>로그인</h2>
                </div>
                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-group">
                        <FaUser className="icon" />
                        <input
                            type="text"
                            placeholder="아이디"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="options">
                        <label>
                            <input type="checkbox" /> 로그인 상태 유지
                        </label>
                        <a href="#" className="forgot-password">비밀번호 찾기?</a>
                    </div>

                    <button type="submit" className="login-btn">로그인</button>

                    <div className="register-link">
                        계정이 없으신가요? <Link to="/signup">회원가입</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
