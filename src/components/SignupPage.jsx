import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';
import { FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import bgImage from '../assets/images/login-backgrounds/login-background.jpg';

const SignupPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            if (!response.ok) {
                // Try to parse error message from server if possible, or use default
                const errorData = await response.text();
                throw new Error(errorData || '회원가입에 실패했습니다.');
            }

            alert('회원가입 성공!');
            navigate('/login');

        } catch (err) {
            console.error('Signup Error:', err);
            setError(err.message || '회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="login-container" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="overlay"></div>
            <div className="login-card">
                <div className="login-header">
                    <h2>회원가입</h2>
                </div>
                <form className="login-form" onSubmit={handleSignup}>
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
                        <FaEnvelope className="icon" />
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                    <div className="input-group">
                        <FaLock className="icon" />
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-btn">회원가입</button>

                    <div className="register-link">
                        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
