import React, { useState } from 'react';
import axios from 'axios';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('memberId', res.data.memberId || '');

      if (onLogin) {
        onLogin(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password!');
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

        <button type="submit" className="btn-primary">Sign In</button>
      </form>
    </div>
  );
}