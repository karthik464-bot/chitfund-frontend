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

  // Identify members who have already won an auction in the selected Chit Group
  const previousWinnerIds = auctions
    .filter((auc) => auc.chitGroup?.id === parseInt(selectedGroupId, 10))
    .map((auc) => auc.winnerMember?.id);

  // Filter out previous winners so a member can only win ONCE per group
  const eligibleMembers = members.filter(
    (m) => !previousWinnerIds.includes(m.id)
  );

  // Reset winner selection when group changes if previous winner is no longer eligible
  const handleGroupChange = (e) => {
    const newGroupId = e.target.value;
    setSelectedGroupId(newGroupId);
    setSelectedWinnerId('');
  };

  // Live Auto-Calculation preview
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

    const winnerIdNum = parseInt(selectedWinnerId, 10);
    if (previousWinnerIds.includes(winnerIdNum)) {
      setMessage({
        type: 'error',
        text: 'This member has already won an auction in this Chit Group! A member can win only once per group.',
      });
      return;
    }

    try {
      const payload = {
        chitGroup: { id: parseInt(selectedGroupId, 10) },
        winnerMember: { id: winnerIdNum },
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this auction record?')) {
      return;
    }

    try {
      await API.delete(`/auctions/${id}`);
      setMessage({ type: 'success', text: 'Auction record deleted successfully!' });
      fetchInitialData();
    } catch (err) {
      console.error('Delete auction error:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setMessage({ type: 'error', text: 'Unauthorized. Please log in as Admin.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete auction record.' });
      }
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

      {/* Record New Auction Form Card */}
      <form onSubmit={handleSaveAuction} className="form-card">
        <h3>Record New Auction</h3>
        <div className="form-grid">
          <div className="form-group">
            <label style={labelStyle}>Select Chit Group *</label>
            <select
              style={fieldStyle}
              value={selectedGroupId}
              onChange={handleGroupChange}
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
              disabled={!selectedGroupId}
            >
              <option value="">
                {!selectedGroupId
                  ? '-- Select Group First --'
                  : eligibleMembers.length === 0
                  ? '-- All Members Have Won --'
                  : '-- Select Winner --'}
              </option>
              {eligibleMembers.map((m) => (
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

        {/* Live Calculation Preview Banner */}
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

      {/* Past Auction History Section */}
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuctions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#9ca3af' }}>
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
                    <td>
                      <button
                        onClick={() => handleDelete(auc.id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </td>
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