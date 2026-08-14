import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ChitGroupManagement from './components/ChitGroupManagement';
import MemberManagement from './components/MemberManagement';
import AuctionManagement from './components/AuctionManagement';
import CollectionManagement from './components/CollectionManagement';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <Login onLogin={(user) => setUser(user)} />;
  }

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
          <button onClick={() => setUser(null)} className="btn-logout">Logout</button>
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