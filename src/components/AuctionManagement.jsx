import React, { useState, useEffect } from 'react';
import API from '../api';

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedWinnerId, setSelectedWinnerId] = useState('');
  const [winningBidAmount, setWinningBidAmount] = useState('');
  const [auctionDate, setAuctionDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  const [calculatedMetrics, setCalculatedMetrics] = useState({
    commission: 0,
    totalDiscount: 0,
    dividendPerMember: 0,
    nextInstallment: 0,
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [aucRes, grpRes, memRes] = await Promise.all([
        API.get('/auctions'),
        API.get('/groups'),
        API.get('/members'),
      ]);
      setAuctions(aucRes.data);
      setGroups(grpRes.data);
      setMembers(memRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setMessage({ type: 'error', text: 'Failed to fetch auction records.' });
    }
  };

  useEffect(() => {
    if (selectedGroupId && winningBidAmount) {
      const group = groups.find((g) => g.id === parseInt(selectedGroupId, 10));
      if (group) {
        const chitAmount = group.chitAmount || 0;
        const totalMembers = group.numberOfMembers || 1;
        const bid = parseFloat(winningBidAmount) || 0;

        const comm = chitAmount * 0.05;
        const disc = chitAmount - bid;
        const div = (disc - comm) / totalMembers;
        const nextInst = chitAmount / totalMembers - div;

        setCalculatedMetrics({
          commission: comm,
          totalDiscount: disc,
          dividendPerMember: div > 0 ? div : 0,
          nextInstallment: nextInst > 0 ? nextInst : 0,
        });
      }
    }
  }, [selectedGroupId, winningBidAmount, groups]);

  const handleSaveAuction = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedGroupId || !selectedWinnerId || !winningBidAmount) {
      setMessage({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    try {
      const payload = {
        chitGroup: { id: parseInt(selectedGroupId, 10) },
        winnerMember: { id: parseInt(selectedWinnerId, 10) },
        winningBidAmount: parseFloat(winningBidAmount),
        auctionDate,
      };

      await API.post('/auctions', payload);
      setMessage({ type: 'success', text: 'Auction saved and dividends calculated successfully!' });
      setWinningBidAmount('');
      setSelectedGroupId('');
      setSelectedWinnerId('');
      fetchInitialData();
    } catch (err) {
      console.error('Save auction error:', err);
      setMessage({ type: 'error', text: 'Failed to save auction record.' });
    }
  };

  const filteredAuctions = auctions.filter((auc) => {
    const groupName = auc.chitGroup?.groupName?.toLowerCase() || '';
    const memberName = auc.winnerMember?.name?.toLowerCase() || '';
    const term = search.toLowerCase();
    return groupName.includes(term) || memberName.includes(term);
  });

  const fieldStyle = {
    backgroundColor: '#0f1120',
    border: '1px solid #282c45',
    borderRadius: '8px',
    padding: '0 14px',
    height: '42px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: '8px',
    minHeight: '36px',
    display: 'flex',
    alignItems: 'flex-end',
  };

  return (
    <div className="module-container">
      <h2>Auction & Dividend Engine</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSaveAuction} className="form-card">
        <h3>Record New Auction</h3>
        <div className="form-grid">
          <div className="form-group">
            <label style={labelStyle}>Select Chit Group *</label>
            <select
              style={fieldStyle}
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              required
            >
              <option value="">-- Select Group --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.groupName} (₹{g.chitAmount})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Winner Member *</label>
            <select
              style={fieldStyle}
              value={selectedWinnerId}
              onChange={(e) => setSelectedWinnerId(e.target.value)}
              required
            >
              <option value="">-- Select Winner --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Winning Bid Amount (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 180000"
              style={fieldStyle}
              value={winningBidAmount}
              onChange={(e) => setWinningBidAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Auction Date *</label>
            <input
              type="date"
              style={fieldStyle}
              value={auctionDate}
              onChange={(e) => setAuctionDate(e.target.value)}
              required
            />
          </div>
        </div>

        {selectedGroupId && winningBidAmount && (
          <div
            style={{
              background: '#0f1120',
              border: '1px solid #282c45',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <small style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>
                Foreman Commission (5%)
              </small>
              <strong style={{ fontSize: '15px' }}>₹{calculatedMetrics.commission.toFixed(2)}</strong>
            </div>
            <div>
              <small style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>
                Total Discount
              </small>
              <strong style={{ fontSize: '15px' }}>₹{calculatedMetrics.totalDiscount.toFixed(2)}</strong>
            </div>
            <div>
              <small style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>
                Dividend / Member
              </small>
              <strong style={{ fontSize: '15px', color: '#00e676' }}>
                ₹{calculatedMetrics.dividendPerMember.toFixed(2)}
              </strong>
            </div>
            <div>
              <small style={{ color: '#9ca3af', display: 'block', fontSize: '11px' }}>
                Adjusted Next Payable
              </small>
              <strong style={{ fontSize: '15px', color: '#7c4dff' }}>
                ₹{calculatedMetrics.nextInstallment.toFixed(2)}
              </strong>
            </div>
          </div>
        )}

        <div className="btn-group">
          <button type="submit" className="btn-primary">
            Save & Distribute Dividend
          </button>
        </div>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h3>Past Auction History</h3>
        <div className="search-bar" style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Search Auction by Group or Member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Chit Group</th>
                <th>Winner Member</th>
                <th>Winning Bid</th>
                <th>Dividend / Member</th>
                <th>Next Installment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuctions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af' }}>
                    No auction records found.
                  </td>
                </tr>
              ) : (
                filteredAuctions.map((auc) => (
                  <tr key={auc.id}>
                    <td>{auc.chitGroup?.groupName || 'Chit Scheme'}</td>
                    <td>{auc.winnerMember?.name || 'N/A'}</td>
                    <td>₹{auc.winningBidAmount ? auc.winningBidAmount.toLocaleString() : 0}</td>
                    <td style={{ color: '#00e676', fontWeight: 'bold' }}>
                      ₹{auc.dividendPerMember ? auc.dividendPerMember.toLocaleString() : 0}
                    </td>
                    <td style={{ color: '#7c4dff', fontWeight: 'bold' }}>
                      ₹{auc.nextInstallmentAmount ? auc.nextInstallmentAmount.toLocaleString() : 0}
                    </td>
                    <td>{auc.auctionDate || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}