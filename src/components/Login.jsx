import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login({ onLogin, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, role, memberId } = res.data;

      // Store auth session keys
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userRole', role);
      if (memberId) {
        localStorage.setItem('memberId', memberId);
      }

      // Trigger parent handler callback
      const loginCallback = onLoginSuccess || onLogin;
      if (loginCallback) {
        loginCallback(res.data);
      }

      // Role-based route redirection
      const isMember = role === 'ROLE_MEMBER' || role === 'MEMBER';
      if (isMember) {
        navigate('/member-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid username or password!';
      setError(msg);
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleLogin} className="login-card">
        <h2>Chit Fund Login</h2>
        <p className="subtitle">Enter your credentials to access the portal</p>

        {error && <div className="alert error">{error}</div>}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn-primary">
          Sign In
        </button>
      </form>
    </div>
  );
}