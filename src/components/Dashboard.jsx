import React, { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeGroupsCount: 0,
    totalMembersCount: 0,
    totalChitAmount: 0,
    totalCollectionsAmount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ color: '#fff', padding: '24px' }}>Loading dashboard metrics...</div>;
  }

  return (
    <div className="dashboard-container" style={{ padding: '24px', color: '#fff' }}>
      <h2 style={{ marginBottom: '20px' }}>Dashboard Overview</h2>
      
      {error && (
        <div className="alert error" style={{ marginBottom: '20px', background: '#e5393522', color: '#ff8a80', padding: '12px', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #7c4dff' }}>
          <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Active Groups</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '28px' }}>{stats.activeGroupsCount || 0}</h3>
        </div>

        <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #00e676' }}>
          <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Total Members</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '28px' }}>{stats.totalMembersCount || 0}</h3>
        </div>

        <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #ff9100' }}>
          <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Total Chit Value</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '28px' }}>₹{stats.totalChitAmount || 0}</h3>
        </div>

        <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #00b0ff' }}>
          <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>Total Collections</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '28px' }}>₹{stats.totalCollectionsAmount || 0}</h3>
        </div>
      </div>
    </div>
  );
}