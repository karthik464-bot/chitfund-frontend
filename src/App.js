import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Component Imports
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChitGroupManagement from './components/ChitGroupManagement';
import MemberManagement from './components/MemberManagement';
import AgentManagement from './components/AgentManagement';
import AuctionManagement from './components/AuctionManagement';
import CollectionManagement from './components/CollectionManagement';
import MemberPortal from './components/MemberPortal';
import './App.css';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole') || localStorage.getItem('role')
  );
  const [memberId, setMemberId] = useState(localStorage.getItem('memberId'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setUserRole(localStorage.getItem('userRole') || localStorage.getItem('role'));
      setMemberId(localStorage.getItem('memberId'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (data) => {
    const role = data.role;
    setToken(data.token);
    setUserRole(role);
    if (data.memberId) setMemberId(data.memberId);

    // Dynamic routing by role
    if (role === 'ROLE_MEMBER' || role === 'MEMBER') {
      navigate('/member-portal');
    } else if (role === 'ROLE_AGENT' || role === 'AGENT') {
      navigate('/collections');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setUserRole(null);
    setMemberId(null);
    navigate('/login');
  };

  // 1. Unauthenticated User -> Login Route
  if (!token) {
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

  const isAdmin = userRole === 'ROLE_ADMIN' || userRole === 'ADMIN';
  const isAgent = userRole === 'ROLE_AGENT' || userRole === 'AGENT';
  const isMember = userRole === 'ROLE_MEMBER' || userRole === 'MEMBER';

  // 2. Member Role -> Exclusive Member Portal
  if (isMember) {
    return (
      <Routes>
        <Route
          path="/member-portal"
          element={
            <MemberPortal
              user={{ token, role: userRole, memberId }}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="*" element={<Navigate to="/member-portal" replace />} />
      </Routes>
    );
  }

  // 3. Admin & Agent Roles -> Main Viewport with Sidebar
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0d19' }}>
      <Sidebar onLogout={handleLogout} />

      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        <Routes>
          {isAdmin && (
            <>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/groups" element={<ChitGroupManagement />} />
              <Route path="/members" element={<MemberManagement />} />
              <Route path="/agent-management" element={<AgentManagement />} />
              <Route path="/auctions" element={<AuctionManagement />} />
              <Route path="/collections" element={<CollectionManagement />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}

          {isAgent && (
            <>
              <Route path="/collections" element={<CollectionManagement />} />
              <Route path="*" element={<Navigate to="/collections" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}