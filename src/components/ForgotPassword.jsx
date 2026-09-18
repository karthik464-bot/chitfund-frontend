import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password/request', { email });
      setMessage({ type: 'info', text: res.data.message });
      setStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error sending OTP.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password/verify-otp', { email, otp });
      setMessage({ type: 'success', text: res.data.message });
      setStep(3);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Invalid or expired OTP.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoading(true);

    try {
      const res = await API.post('/auth/forgot-password/reset-password', { email, newPassword });
      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Password reset failed.' });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#0f1120',
    border: '1px solid #282c45',
    borderRadius: '8px',
    padding: '0 14px',
    height: '42px',
    color: '#ffffff',
    fontSize: '14px',
    width: '100%',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  const btnStyle = {
    width: '100%',
    height: '42px',
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
      <div style={{ backgroundColor: '#131629', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #1e2238' }}>
        <h2 style={{ color: '#ffffff', marginBottom: '8px', textAlign: 'center', fontSize: '20px', fontWeight: '700' }}>
          {step === 1 && 'Forgot Password'}
          {step === 2 && 'Verify OTP'}
          {step === 3 && 'Set New Password'}
        </h2>

        {message.text && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '16px',
            backgroundColor: message.type === 'error' ? '#3f1d24' : '#1b382b',
            color: message.type === 'error' ? '#f87171' : '#34d399',
            border: `1px solid ${message.type === 'error' ? '#f8717144' : '#34d39944'}`
          }}>
            {message.text}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <label style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
              Registered Email Address *
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <label style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
              Enter 6-Digit OTP *
            </label>
            <input
              type="text"
              placeholder="123456"
              style={inputStyle}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <label style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
              New Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '6px', display: 'block' }}>
              Confirm Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}