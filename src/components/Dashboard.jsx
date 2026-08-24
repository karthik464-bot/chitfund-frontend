import React, { useState, useEffect } from 'react';
import API from '../api';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Individual Drill-down
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [grpRes, memRes, colRes, aucRes] = await Promise.all([
        API.get('/groups'),
        API.get('/members'),
        API.get('/collections'),
        API.get('/auctions'),
      ]);
      setGroups(grpRes.data || []);
      setMembers(memRes.data || []);
      setCollections(colRes.data || []);
      setAuctions(aucRes.data || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalChitValue = groups.reduce((sum, g) => sum + (parseFloat(g.chitAmount) || 0), 0);
  const totalCollections = collections.reduce(
    (sum, c) => sum + (parseFloat(c.amount ?? c.installmentAmount) || 0),
    0
  );

  // Helper: Get member-specific summary
  const getMemberDetails = (memberId) => {
    const memberCols = collections.filter((c) => c.member?.id === memberId);
    const memberAucs = auctions.filter((a) => a.winnerMember?.id === memberId);
    const totalPaid = memberCols.reduce(
      (sum, c) => sum + (parseFloat(c.amount ?? c.installmentAmount) || 0),
      0
    );

    return {
      collections: memberCols,
      auctions: memberAucs,
      totalPaid,
      paymentCount: memberCols.length,
      auctionsWonCount: memberAucs.length,
    };
  };

  if (loading) {
    return <div style={{ color: '#9ca3af', padding: '20px' }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
        Dashboard Overview
      </h2>

      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div style={cardStyle('#8b5cf6')}>
          <span style={cardLabelStyle}>Active Groups</span>
          <h3 style={cardValueStyle}>{groups.length}</h3>
        </div>

        <div style={cardStyle('#10b981')}>
          <span style={cardLabelStyle}>Total Members</span>
          <h3 style={cardValueStyle}>{members.length}</h3>
        </div>

        <div style={cardStyle('#f59e0b')}>
          <span style={cardLabelStyle}>Total Chit Value</span>
          <h3 style={cardValueStyle}>₹{totalChitValue.toLocaleString()}</h3>
        </div>

        <div style={cardStyle('#3b82f6')}>
          <span style={cardLabelStyle}>Total Collections</span>
          <h3 style={cardValueStyle}>₹{totalCollections.toLocaleString()}</h3>
        </div>
      </div>

      {/* Member Payments Summary Section */}
      <div
        style={{
          backgroundColor: '#131629',
          border: '1px solid #1e2238',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#a78bfa', margin: 0 }}>
            Member Contribution Summary
          </h3>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            Click on any member's name to view full statement
          </span>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #282c45', color: '#9ca3af', fontSize: '12px' }}>
                <th style={{ padding: '12px' }}>MEMBER NAME</th>
                <th style={{ padding: '12px' }}>CONTACT</th>
                <th style={{ padding: '12px' }}>PAYMENTS MADE</th>
                <th style={{ padding: '12px' }}>AUCTIONS WON</th>
                <th style={{ padding: '12px' }}>TOTAL PAID</th>
                <th style={{ padding: '12px' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                    No member records found.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const details = getMemberDetails(m.id);
                  return (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: '1px solid #1e2238',
                        fontSize: '14px',
                        transition: 'background 0.2s',
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => setSelectedMember(m)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#a78bfa',
                            fontWeight: '600',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '14px',
                            padding: 0,
                          }}
                        >
                          {m.name}
                        </button>
                      </td>
                      <td style={{ padding: '12px', color: '#9ca3af' }}>{m.phone || m.mobile || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{details.paymentCount} transaction(s)</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            background: details.auctionsWonCount > 0 ? '#10b98122' : '#ffffff10',
                            color: details.auctionsWonCount > 0 ? '#34d399' : '#9ca3af',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                          }}
                        >
                          {details.auctionsWonCount} Won
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#00e676', fontWeight: 'bold' }}>
                        ₹{details.totalPaid.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => setSelectedMember(m)}
                          style={{
                            backgroundColor: '#1f2438',
                            color: '#a78bfa',
                            border: '1px solid #374151',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          View Records
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INDIVIDUAL MEMBER DRILL-DOWN MODAL */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          details={getMemberDetails(selectedMember.id)}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}

// Modal Component for Individual Records
function MemberDetailModal({ member, details, onClose }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#131629',
          border: '1px solid #282c45',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', color: '#ffffff' }}>{member.name}'s Statement</h2>
            <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '13px' }}>
              Mobile: {member.phone || member.mobile || 'N/A'} | Email: {member.email || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1f2438',
              border: 'none',
              color: '#ffffff',
              fontSize: '18px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#0f1120', padding: '16px', borderRadius: '10px', border: '1px solid #282c45' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Total Amount Paid</span>
            <h3 style={{ margin: '4px 0 0 0', color: '#00e676', fontSize: '20px' }}>
              ₹{details.totalPaid.toLocaleString()}
            </h3>
          </div>
          <div style={{ background: '#0f1120', padding: '16px', borderRadius: '10px', border: '1px solid #282c45' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Auctions Won</span>
            <h3 style={{ margin: '4px 0 0 0', color: '#7c4dff', fontSize: '20px' }}>
              {details.auctionsWonCount} Group(s)
            </h3>
          </div>
        </div>

        {/* Collection History Table */}
        <h4 style={{ color: '#a78bfa', marginBottom: '12px' }}>Payment History</h4>
        <div className="table-responsive" style={{ marginBottom: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #282c45', color: '#9ca3af', fontSize: '12px' }}>
                <th style={{ padding: '8px' }}>DATE</th>
                <th style={{ padding: '8px' }}>GROUP</th>
                <th style={{ padding: '8px' }}>MODE</th>
                <th style={{ padding: '8px' }}>AMOUNT</th>
                <th style={{ padding: '8px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {details.collections.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '12px', textAlign: 'center', color: '#9ca3af' }}>
                    No payment collections recorded for this member.
                  </td>
                </tr>
              ) : (
                details.collections.map((col) => (
                  <tr key={col.id} style={{ borderBottom: '1px solid #1e2238', fontSize: '13px' }}>
                    <td style={{ padding: '8px' }}>{col.paymentDate || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{col.chitGroup?.groupName || col.group?.groupName || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{col.paymentMode || 'CASH'}</td>
                    <td style={{ padding: '8px', color: '#00e676', fontWeight: 'bold' }}>
                      ₹{Number(col.amount ?? col.installmentAmount ?? 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 'bold' }}>
                        {col.status || col.paymentStatus || 'PAID'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Auction History Table */}
        <h4 style={{ color: '#a78bfa', marginBottom: '12px' }}>Auction Winnings</h4>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #282c45', color: '#9ca3af', fontSize: '12px' }}>
                <th style={{ padding: '8px' }}>DATE</th>
                <th style={{ padding: '8px' }}>GROUP</th>
                <th style={{ padding: '8px' }}>WINNING BID</th>
                <th style={{ padding: '8px' }}>DIVIDEND</th>
              </tr>
            </thead>
            <tbody>
              {details.auctions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#9ca3af' }}>
                    No auctions won by this member yet.
                  </td>
                </tr>
              ) : (
                details.auctions.map((auc) => (
                  <tr key={auc.id} style={{ borderBottom: '1px solid #1e2238', fontSize: '13px' }}>
                    <td style={{ padding: '8px' }}>{auc.auctionDate || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>{auc.chitGroup?.groupName || 'N/A'}</td>
                    <td style={{ padding: '8px' }}>₹{Number(auc.winningBidAmount || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px', color: '#00e676', fontWeight: 'bold' }}>
                      ₹{Number(auc.dividendPerMember || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Close Statement
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline Styles Helper
const cardStyle = (borderColor) => ({
  backgroundColor: '#131629',
  border: '1px solid #1e2238',
  borderLeft: `4px solid ${borderColor}`,
  borderRadius: '10px',
  padding: '20px',
});

const cardLabelStyle = {
  fontSize: '12px',
  fontWeight: '500',
  color: '#9ca3af',
  display: 'block',
  marginBottom: '6px',
};

const cardValueStyle = {
  fontSize: '24px',
  fontWeight: '700',
  margin: 0,
  color: '#ffffff',
};