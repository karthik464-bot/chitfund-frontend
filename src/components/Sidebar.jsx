import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve user details from localStorage
  const userRole = localStorage.getItem('userRole') || localStorage.getItem('role') || 'GUEST';
  const username = localStorage.getItem('username') || localStorage.getItem('user') || 'User';

  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';
  const isAgent = userRole === 'ROLE_AGENT' || userRole === 'AGENT';
  const displayRole = userRole.replace('ROLE_', '');

  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const navItems = [
    ...(isAdmin ? [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' },
      { label: 'Chit Groups', path: '/groups', icon: '📁' },
      { label: 'Members', path: '/members', icon: '👥' },
      { label: 'Agent Management', path: '/agent-management', icon: '👔' },
      { label: 'Auctions', path: '/auctions', icon: '🔨' },
      { label: 'Collections', path: '/collections', icon: '💰' },
    ] : []),
    ...(isAgent ? [
      { label: 'Assigned Collections', path: '/collections', icon: '💰' },
    ] : [])
  ];

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? '#ffffff' : '#9ca3af',
      backgroundColor: isActive ? '#6366f1' : 'transparent',
      textDecoration: 'none',
      padding: '10px 12px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      justifyContent: isOpen ? 'flex-start' : 'center',
      transition: 'all 0.2s ease',
    };
  };

  return (
    <aside
      style={{
        width: isOpen ? '240px' : '70px',
        backgroundColor: '#0f1120',
        padding: '20px 12px',
        borderRight: '1px solid #1e2238',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        boxSizing: 'border-box',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Header with Toggle Switch */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          marginBottom: '20px',
        }}
      >
        {isOpen && (
          <h2
            style={{
              color: '#818cf8',
              fontSize: '15px',
              fontWeight: '700',
              margin: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Chit Fund System
          </h2>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: '#1e2238',
            color: '#a78bfa',
            border: '1px solid #374151',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            flexShrink: 0,
          }}
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* User Profile Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#171a2e',
          padding: isOpen ? '10px 12px' : '8px',
          borderRadius: '10px',
          border: '1px solid #282d4a',
          justifyContent: isOpen ? 'flex-start' : 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#6366f1',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px',
            flexShrink: 0,
          }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        {isOpen && (
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                color: '#e2e8f0',
                fontSize: '13px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={username}
            >
              {username}
            </div>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#312e81',
                color: '#a5b4fc',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                marginTop: '2px',
                textTransform: 'uppercase',
              }}
            >
              {displayRole}
            </span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} style={getLinkStyle(item.path)} title={!isOpen ? item.label : ''}>
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            {isOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Logout Action */}
      <button
        onClick={handleLogout}
        style={{
          marginTop: 'auto',
          backgroundColor: '#1e2238',
          color: '#f87171',
          border: '1px solid #ef444444',
          padding: '10px',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'flex-start' : 'center',
          gap: '10px',
        }}
        title={!isOpen ? 'Logout' : ''}
      >
        <span style={{ fontSize: '16px' }}>🚪</span>
        {isOpen && <span>Logout</span>}
      </button>
    </aside>
  );
}