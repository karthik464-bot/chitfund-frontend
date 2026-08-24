import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChitGroupManagement from './components/ChitGroupManagement';
import MemberManagement from './components/MemberManagement';
import AuctionManagement from './components/AuctionManagement';
import CollectionManagement from './components/CollectionManagement';
import MemberPortal from './components/MemberPortal';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || localStorage.getItem('userRole');
    const memberId = localStorage.getItem('memberId');

    if (token && role) {
      setUser({ token, role, memberId });
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    const role = userData.role;
    setUser(userData);

    if (role === 'ROLE_MEMBER' || role === 'MEMBER') {
      navigate('/member-portal');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  if (loading) return null;

  // 1. Unauthenticated -> Render Login Route
  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<Login onLogin={handleLoginSuccess} onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const isMember = user.role === 'ROLE_MEMBER' || user.role === 'MEMBER';

  // 2. Member User -> Render Member Portal exclusively
  if (isMember) {
    return (
      <Routes>
        <Route path="/member-portal" element={<MemberPortal user={user} onLogout={handleLogout} />} />
        <Route path="*" element={<Navigate to="/member-portal" replace />} />
      </Routes>
    );
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Chit Groups', path: '/groups' },
    { label: 'Members', path: '/members' },
    { label: 'Auctions', path: '/auctions' },
    { label: 'Collections', path: '/collections' },
  ];

  // 3. Admin User -> Render Full Management Portal
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0e1b', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: '260px', backgroundColor: '#131629', padding: '28px 20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #1e2238' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#a78bfa', marginBottom: '36px', lineHeight: '1.3' }}>
          Chit Fund Management<br />System
        </h2>

        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    style={{
                      display: 'block',
                      padding: '12px 18px',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: isActive ? '600' : '500',
                      textDecoration: 'none',
                      color: isActive ? '#ffffff' : '#9ca3af',
                      background: isActive
                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                        : 'transparent',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.35)' : 'none',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            backgroundColor: '#1f2438',
            color: '#ef4444',
            border: '1px solid #374151',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%',
            transition: 'background 0.2s ease',
          }}
        >
          Logout
        </button>
      </aside>

      {/* Main Viewport */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<ChitGroupManagement />} />
          <Route path="/members" element={<MemberManagement />} />
          <Route path="/auctions" element={<AuctionManagement />} />
          <Route path="/collections" element={<CollectionManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}