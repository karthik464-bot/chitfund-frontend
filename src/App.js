import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChitGroupManagement from './components/ChitGroupManagement';
import MemberManagement from './components/MemberManagement';
import AuctionManagement from './components/AuctionManagement';
import CollectionManagement from './components/CollectionManagement';
import MemberPortal from './components/MemberPortal';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  // 1. If not logged in, render Login page
  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  // 2. If logged in as MEMBER, render Member Portal directly
  if (user.role === 'ROLE_MEMBER') {
    return (
      <div className="app-container">
        <MemberPortal user={user} onLogout={handleLogout} />
      </div>
    );
  }

  // 3. If logged in as ADMIN or AGENT, render full Management Portal
  return (
    <div className="app-container">
      <header className="navbar">
        <h2>Chit Fund Management System</h2>
        <nav>
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'groups' ? 'active' : ''} onClick={() => setActiveTab('groups')}>Chit Groups</button>
          <button className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>Members</button>
          <button className={activeTab === 'auctions' ? 'active' : ''} onClick={() => setActiveTab('auctions')}>Auctions</button>
          <button className={activeTab === 'collections' ? 'active' : ''} onClick={() => setActiveTab('collections')}>Collections</button>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </nav>
      </header>

      <main className="content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'groups' && <ChitGroupManagement />}
        {activeTab === 'members' && <MemberManagement />}
        {activeTab === 'auctions' && <AuctionManagement />}
        {activeTab === 'collections' && <CollectionManagement />}
      </main>
    </div>
  );
}

export default App;