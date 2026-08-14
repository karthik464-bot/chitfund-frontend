import React, { useState, useEffect } from 'react';
import API from '../api';

export default function CollectionManagement() {
  const [collections, setCollections] = useState([]);
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    member: { id: '' },
    chitGroup: { id: '' },
    installmentAmount: '',
    paymentDate: '',
    paymentMode: 'CASH',
    paymentStatus: 'PAID'
  });

  const fetchData = async () => {
    try {
      const [colRes, memRes, grpRes] = await Promise.all([
        API.get(`/collections?search=${search}`),
        API.get('/members'),
        API.get('/groups')
      ]);
      setCollections(colRes.data);
      setMembers(memRes.data);
      setGroups(grpRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error loading payment collections.' });
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/collections', formData);
      setMessage({ type: 'success', text: 'Monthly collection recorded!' });
      setFormData({ member: { id: '' }, chitGroup: { id: '' }, installmentAmount: '', paymentDate: '', paymentMode: 'CASH', paymentStatus: 'PAID' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error recording payment.' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete payment collection record?')) {
      await API.delete(`/collections/${id}`);
      setMessage({ type: 'success', text: 'Record deleted.' });
      fetchData();
    }
  };

  return (
    <div className="module-container">
      <h2>Module 4: Monthly Collection Management</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <h3>Record Monthly Collection</h3>
        <div className="form-grid">
          <select value={formData.member.id} onChange={e => setFormData({...formData, member: { id: e.target.value }})} required>
            <option value="">-- Select Member --</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.memberName}</option>)}
          </select>

          <select value={formData.chitGroup.id} onChange={e => setFormData({...formData, chitGroup: { id: e.target.value }})} required>
            <option value="">-- Select Chit Group --</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.groupName} (Installment: ₹{g.monthlyInstallment})</option>)}
          </select>

          <input type="number" placeholder="Installment Amount (₹)" value={formData.installmentAmount} onChange={e => setFormData({...formData, installmentAmount: e.target.value})} required />
          <input type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} required />
          
          <select value={formData.paymentMode} onChange={e => setFormData({...formData, paymentMode: e.target.value})}>
            <option value="CASH">CASH</option>
            <option value="UPI">UPI</option>
            <option value="BANK_TRANSFER">BANK TRANSFER</option>
          </select>

          <select value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value})}>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>
        <button type="submit" className="btn-primary">Record Collection</button>
      </form>

      <div className="search-bar">
        <input type="text" placeholder="Search by Member Name..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Group</th>
            <th>Amount</th>
            <th>Payment Date</th>
            <th>Mode</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.map(c => (
            <tr key={c.id}>
              <td>{c.member?.memberName}</td>
              <td>{c.chitGroup?.groupName}</td>
              <td>₹{c.installmentAmount}</td>
              <td>{c.paymentDate}</td>
              <td>{c.paymentMode}</td>
              <td><span className={`status ${c.paymentStatus.toLowerCase()}`}>{c.paymentStatus}</span></td>
              <td>
                <button onClick={() => handleDelete(c.id)} className="btn-delete">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}