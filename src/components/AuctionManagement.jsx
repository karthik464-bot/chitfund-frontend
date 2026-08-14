import React, { useState, useEffect } from 'react';
import API from '../api';

export default function AuctionManagement() {
  const [auctions, setAuctions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    chitGroup: { id: '' },
    winnerMember: { id: '' },
    bidAmount: '',
    auctionDate: ''
  });

  const fetchData = async () => {
    try {
      const [aucRes, grpRes, memRes] = await Promise.all([
        API.get(`/auctions?search=${search}`),
        API.get('/groups'),
        API.get('/members')
      ]);
      setAuctions(aucRes.data);
      setGroups(grpRes.data);
      setMembers(memRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error fetching auction details.' });
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auctions', formData);
      setMessage({ type: 'success', text: 'Auction recorded successfully!' });
      setFormData({ chitGroup: { id: '' }, winnerMember: { id: '' }, bidAmount: '', auctionDate: '' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to record auction.' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this auction record?')) {
      await API.delete(`/auctions/${id}`);
      setMessage({ type: 'success', text: 'Auction deleted.' });
      fetchData();
    }
  };

  return (
    <div className="module-container">
      <h2>Module 3: Auction Management</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <h3>Create New Auction Record</h3>
        <div className="form-grid">
          <select value={formData.chitGroup.id} onChange={e => setFormData({...formData, chitGroup: { id: e.target.value }})} required>
            <option value="">-- Select Chit Group --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.groupName} (₹{g.chitAmount})</option>)}
          </select>

          <select value={formData.winnerMember.id} onChange={e => setFormData({...formData, winnerMember: { id: e.target.value }})} required>
            <option value="">-- Select Winner Member --</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.memberName}</option>)}
          </select>

          <input type="number" placeholder="Winning Bid Amount (₹)" value={formData.bidAmount} onChange={e => setFormData({...formData, bidAmount: e.target.value})} required />
          <input type="date" value={formData.auctionDate} onChange={e => setFormData({...formData, auctionDate: e.target.value})} required />
        </div>
        <button type="submit" className="btn-primary">Save Auction</button>
      </form>

      <div className="search-bar">
        <input type="text" placeholder="Search Auctions by Group Name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Winner Member</th>
            <th>Winning Bid Amount</th>
            <th>Auction Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {auctions.map(a => (
            <tr key={a.id}>
              <td>{a.chitGroup?.groupName}</td>
              <td>{a.winnerMember?.memberName}</td>
              <td>₹{a.bidAmount}</td>
              <td>{a.auctionDate}</td>
              <td>
                <button onClick={() => handleDelete(a.id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}