import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Login({ onLogin, onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Agent Registration State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const res = await API.post('/auth/login', { username, password });
      const { token, role, memberId, userId } = res.data;
      
      // Extract logged-in username from response or form input
      const activeUsername = res.data.username || username;

      // Store complete auth session keys
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userRole', role);
      localStorage.setItem('username', activeUsername);
      localStorage.setItem('user', activeUsername);
      
      if (memberId) localStorage.setItem('memberId', memberId);
      if (userId) localStorage.setItem('userId', userId);

      // Trigger parent callback handler
      const loginCallback = onLoginSuccess || onLogin;
      if (loginCallback) {
        loginCallback({ ...res.data, username: activeUsername });
      }

      // Role-based routing
      const isMember = role === 'ROLE_MEMBER' || role === 'MEMBER';
      if (isMember) {
        navigate('/member-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const serverMsg = err.response?.data?.message || 'Invalid username or password!';
      setMessage({ type: 'error', text: serverMsg });
    }
  };

  const handleAgentRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      await API.post('/auth/register-agent', {
        username,
        password,
        fullName,
        email,
        phone,
      });

      setMessage({ type: 'success', text: 'Agent registered successfully! You can now log in.' });
      setIsRegistering(false);
      setPassword('');
    } catch (err) {
      console.error('Agent registration error:', err);
      const serverMsg = err.response?.data?.message || 'Agent registration failed.';
      setMessage({ type: 'error', text: serverMsg });
    }
  };

  const fieldStyle = {
    backgroundColor: '#0f1120',
    border: '1px solid #282c45',
    borderRadius: '8px',
    padding: '0 14px',
    height: '42px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <div style={{ backgroundColor: '#131629', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #1e2238' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '8px', textAlign: 'center', fontSize: '22px', fontWeight: '700' }}>
          {isRegistering ? 'Agent Registration' : 'Chit Fund Login'}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>
          {isRegistering ? 'Create your collection agent account' : 'Enter your credentials to access the portal'}
        </p>

        {message.text && (
          <div className={`alert ${message.type}`} style={{ marginBottom: '16px' }}>
            {message.text}
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLogin}>
            <div>
              <label style={labelStyle}>Username *</label>
              <input
                type="text"
                placeholder="Enter username"
                style={fieldStyle}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                style={fieldStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleAgentRegister}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. John Agent"
                style={fieldStyle}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Username *</label>
              <input
                type="text"
                placeholder="e.g. agent01"
                style={fieldStyle}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                placeholder="agent@example.com"
                style={fieldStyle}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Mobile Number *</label>
              <input
                type="text"
                placeholder="10-digit mobile"
                style={fieldStyle}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                placeholder="••••••••"
                style={fieldStyle}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                height: '42px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Register as Agent
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setMessage({ type: '', text: '' });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#a78bfa',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isRegistering ? 'Already have an account? Sign In' : 'Need an Agent account? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
}