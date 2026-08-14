import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Error loading dashboard:', err));
  }, []);

  if (!stats) return <div className="loading">Loading dashboard metrics...</div>;

  return (
    <div className="module-container">
      <h2>Dashboard Overview</h2>
      
      <div className="metrics-grid">
        <div className="card">
          <h4>Total Chit Groups</h4>
          <p className="metric">{stats.totalChitGroups}</p>
        </div>
        <div className="card">
          <h4>Total Members</h4>
          <p className="metric">{stats.totalMembers}</p>
        </div>
        <div className="card">
          <h4>Active Groups</h4>
          <p className="metric active">{stats.activeChitGroups}</p>
        </div>
        <div className="card">
          <h4>Completed Groups</h4>
          <p className="metric completed">{stats.completedChitGroups}</p>
        </div>
        <div className="card">
          <h4>Total Collections</h4>
          <p className="metric money">₹{stats.totalMonthlyCollections}</p>
        </div>
        <div className="card">
          <h4>Pending Collections</h4>
          <p className="metric pending">₹{stats.pendingCollections}</p>
        </div>
      </div>

      <h3 style={{ marginTop: '30px' }}>Recent Auctions</h3>
      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Winner Member</th>
            <th>Bid Amount</th>
            <th>Auction Date</th>
          </tr>
        </thead>
        <tbody>
          {stats.recentAuctions && stats.recentAuctions.length > 0 ? (
            stats.recentAuctions.map((auc) => (
              <tr key={auc.id}>
                <td>{auc.chitGroup?.groupName}</td>
                <td>{auc.winnerMember?.memberName}</td>
                <td>₹{auc.bidAmount}</td>
                <td>{auc.auctionDate}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No recent auctions available.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}