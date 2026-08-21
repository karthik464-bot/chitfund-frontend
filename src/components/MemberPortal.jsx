import React, { useState, useEffect } from 'react';
import api from '../api';

export default function MemberPortal({ user, onLogout }) {
  const [memberData, setMemberData] = useState({
    groups: [],
    auctions: [],
    collections: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const memberId = localStorage.getItem('memberId') || 1;

  useEffect(() => {
    const fetchMemberDashboard = async () => {
      try {
        const res = await api.get(`/member/dashboard/${memberId}`);
        setMemberData(res.data);
      } catch (err) {
        console.error('Member portal error:', err);
        setError('Failed to load member portal data.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDashboard();
  }, [memberId]);

  if (loading) return <div style={{ padding: '24px', color: '#fff' }}>Loading your portal...</div>;

  return (
    <div className="portal-container" style={{ padding: '24px', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Member Self-Service Portal</h2>
        <button onClick={onLogout} style={{ background: '#e53935', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {error && (
        <div className="alert error" style={{ marginBottom: '16px', background: '#e5393522', color: '#ff8a80', padding: '12px', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Enrolled Chit Schemes */}
      <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>My Enrolled Chit Groups</h3>
        {!memberData.groups || memberData.groups.length === 0 ? (
          <p style={{ color: '#888' }}>No active chit groups found.</p>
        ) : (
          memberData.groups.map((group) => (
            <div key={group.id} style={{ background: '#2b2b3d', padding: '12px 16px', borderRadius: '6px', marginTop: '10px' }}>
              <strong>{group.groupName}</strong>
              <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '14px' }}>
                Chit Amount: ₹{group.chitAmount} | Monthly Installment: ₹{group.monthlyInstallment}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Auction History */}
      <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>Upcoming & Past Auctions</h3>
        {!memberData.auctions || memberData.auctions.length === 0 ? (
          <p style={{ color: '#888' }}>No auction records available.</p>
        ) : (
          memberData.auctions.map((auc) => (
            <div key={auc.id} style={{ background: '#2b2b3d', padding: '12px 16px', borderRadius: '6px', marginTop: '10px' }}>
              <p style={{ margin: 0 }}><strong>Winning Bid:</strong> ₹{auc.winningBidAmount}</p>
              <p style={{ margin: '4px 0 0', color: '#aaa', fontSize: '14px' }}>Date: {auc.auctionDate}</p>
            </div>
          ))
        )}
      </div>

      {/* Payment Receipts */}
      <div style={{ background: '#1e1e2d', padding: '20px', borderRadius: '10px' }}>
        <h3>My Payment History</h3>
        {!memberData.collections || memberData.collections.length === 0 ? (
          <p style={{ color: '#888' }}>No collection history available.</p>
        ) : (
          memberData.collections.map((col) => (
            <div key={col.id} style={{ background: '#2b2b3d', padding: '12px 16px', borderRadius: '6px', marginTop: '10px' }}>
              <p style={{ margin: 0 }}><strong>Amount Paid: ₹{col.amount}</strong> ({col.paymentDate})</p>
              <p style={{ margin: '4px 0 0', color: col.status === 'PAID' ? '#4caf50' : '#ff9800', fontSize: '14px' }}>
                Status: {col.status}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}