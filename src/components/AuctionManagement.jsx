import React, { useState, useEffect } from 'react';
import API from '../api';
import { exportToCSV } from '../utils/exportToCSV';

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);

  // Form State
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [winnerMemberId, setWinnerMemberId] = useState('');
  const [winningBidAmount, setWinningBidAmount] = useState('');
  const [dividendPerMember, setDividendPerMember] = useState('');
  const [auctionDate, setAuctionDate] = useState(new Date().toISOString().split('T')[0]);

  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aucRes, grpRes, memRes] = await Promise.all([
        API.get('/auctions'),
        API.get('/groups'),
        API.get('/members'),
      ]);
      setAuctions(aucRes.data || []);
      setGroups(grpRes.data || []);
      setMembers(memRes.data || []);
    } catch (err) {
      console.error('Fetch error in Auctions module:', err);
      setMessage({ type: 'error', text: 'Failed to load auction data.' });
    }
  };

  const handleBidChange = (bidVal) => {
    setWinningBidAmount(bidVal);
    if (!selectedGroupId || !bidVal) {
      setDividendPerMember('');
      return;
    }

    const group = groups.find((g) => g.id === parseInt(selectedGroupId, 10));
    if (group && group.numberOfMembers > 0) {
      const bid = parseFloat(bidVal) || 0;
      const dividend = (bid / group.numberOfMembers).toFixed(2);
      setDividendPerMember(dividend);
    }
  };

  const handleRecordAuction = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedGroupId || !winnerMemberId || !winningBidAmount || !auctionDate) {
      setMessage({ type: 'error', text: 'Please fill out all required auction details.' });
      return;
    }

    const groupIdNum = parseInt(selectedGroupId, 10);
    const memberIdNum = parseInt(winnerMemberId, 10);
    const bidAmountNum = parseFloat(winningBidAmount);

    const payload = {
      chitGroup: { id: groupIdNum },
      group: { id: groupIdNum },
      winnerMember: { id: memberIdNum },
      member: { id: memberIdNum },
      winningBidAmount: bidAmountNum,
      dividendPerMember: parseFloat(dividendPerMember) || 0,
      auctionDate,
    };

    try {
      await API.post('/auctions', payload);
      setMessage({ type: 'success', text: 'Auction recorded successfully!' });
      setSelectedGroupId('');
      setWinnerMemberId('');
      setWinningBidAmount('');
      setDividendPerMember('');
      fetchData();
    } catch (err) {
      console.error('Record auction error:', err);
      const serverMsg = err.response?.data?.message || 'Failed to record auction.';
      setMessage({ type: 'error', text: serverMsg });
    }
  };

  const handleDeleteAuction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this auction record?')) return;

    try {
      await API.delete(`/auctions/${id}`);
      setMessage({ type: 'success', text: 'Auction record deleted successfully.' });
      fetchData();
    } catch (err) {
      console.error('Delete auction error:', err);
      setMessage({ type: 'error', text: 'Failed to delete auction record.' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Auction ID', 'Chit Group', 'Winner Name', 'Winning Bid Amount (₹)', 'Dividend per Member (₹)', 'Auction Date'];
    const rows = filteredAuctions.map((auc) => [
      auc.id,
      auc.chitGroup?.groupName || auc.group?.groupName || 'N/A',
      auc.winnerMember?.name || auc.member?.name || 'N/A',
      auc.winningBidAmount || 0,
      auc.dividendPerMember || 0,
      auc.auctionDate || 'N/A',
    ]);
    exportToCSV('Auction_History_Report', headers, rows);
  };

  // Filter & Pagination Logic
  const filteredAuctions = auctions.filter((auc) => {
    const term = search.toLowerCase();
    const groupName = (auc.chitGroup?.groupName || auc.group?.groupName || '').toLowerCase();
    const winnerName = (auc.winnerMember?.name || auc.member?.name || '').toLowerCase();
    return groupName.includes(term) || winnerName.includes(term);
  });

  const totalPages = Math.ceil(filteredAuctions.length / pageSize) || 1;
  const paginatedAuctions = filteredAuctions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
    display: 'block',
  };

  return (
    <div className="module-container">
      <h2>Monthly Auction Management</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      {/* Record Auction Card */}
      <form onSubmit={handleRecordAuction} className="form-card" style={{ marginBottom: '28px' }}>
        <h3>Conduct & Record Auction</h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
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
                <option key={g.id} value={g.id}>{g.groupName}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Auction Winner *</label>
            <select
              style={fieldStyle}
              value={winnerMemberId}
              onChange={(e) => setWinnerMemberId(e.target.value)}
              required
            >
              <option value="">-- Select Winner --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Winning Bid / Discount (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 15000"
              style={fieldStyle}
              value={winningBidAmount}
              onChange={(e) => handleBidChange(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Auto Dividend / Member (₹)</label>
            <input
              type="number"
              placeholder="0.00"
              style={{ ...fieldStyle, backgroundColor: '#131629', color: '#10b981', fontWeight: 'bold' }}
              value={dividendPerMember}
              onChange={(e) => setDividendPerMember(e.target.value)}
              readOnly
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

        <div className="btn-group" style={{ marginTop: '20px' }}>
          <button type="submit" className="btn-primary">
            Record Auction & Distribute Dividend
          </button>
        </div>
      </form>

      {/* History Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3>Auction History Log</h3>
          <button
            onClick={handleExportCSV}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            📥 Export to CSV / Excel
          </button>
        </div>

        {/* Filter & Page Size Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', marginBottom: '14px', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search Auctions by Group or Winner Name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{ ...fieldStyle, maxWidth: '360px' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px' }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ ...fieldStyle, width: '70px', height: '36px' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Chit Group</th>
                <th>Winning Member</th>
                <th>Winning Bid (Discount)</th>
                <th>Dividend / Member</th>
                <th>Auction Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAuctions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: '#9ca3af' }}>
                    No auction records found.
                  </td>
                </tr>
              ) : (
                paginatedAuctions.map((auc) => (
                  <tr key={auc.id}>
                    <td style={{ fontWeight: '600', color: '#ffffff' }}>
                      {auc.chitGroup?.groupName || auc.group?.groupName || 'N/A'}
                    </td>
                    <td>{auc.winnerMember?.name || auc.member?.name || 'N/A'}</td>
                    <td style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      ₹{Number(auc.winningBidAmount || 0).toLocaleString()}
                    </td>
                    <td style={{ color: '#00e676', fontWeight: 'bold' }}>
                      ₹{Number(auc.dividendPerMember || 0).toLocaleString()}
                    </td>
                    <td>{auc.auctionDate || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleDeleteAuction(auc.id)} className="btn-delete">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            color: '#9ca3af',
            fontSize: '13px',
          }}
        >
          <span>
            Page {currentPage} of {totalPages} ({filteredAuctions.length} total auctions)
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{
                backgroundColor: currentPage === 1 ? '#1f243888' : '#1f2438',
                color: currentPage === 1 ? '#6b7280' : '#ffffff',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              style={{
                backgroundColor: currentPage === totalPages ? '#1f243888' : '#1f2438',
                color: currentPage === totalPages ? '#6b7280' : '#ffffff',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}