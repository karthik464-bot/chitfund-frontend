import React, { useState, useEffect } from 'react';
import API from '../api';

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const [formData, setFormData] = useState({
    memberName: '', mobileNumber: '', emailAddress: '', address: ''
  });

  const fetchData = async () => {
    try {
      const [memRes, grpRes] = await Promise.all([
        API.get(`/members?search=${search}`),
        API.get('/groups')
      ]);
      setMembers(memRes.data);
      setGroups(grpRes.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error fetching members or groups.' });
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/members/${editingId}`, formData);
        setMessage({ type: 'success', text: 'Member details updated!' });
      } else {
        await API.post('/members', formData);
        setMessage({ type: 'success', text: 'Member registered successfully!' });
      }
      resetForm();
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving member.' });
    }
  };

  const handleEnroll = async (memberId) => {
    if (!selectedGroupId) {
      alert('Select a Chit Group from the dropdown first!');
      return;
    }
    try {
      await API.post(`/members/${memberId}/enroll/${selectedGroupId}`);
      setMessage({ type: 'success', text: 'Member enrolled to group!' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to enroll member.' });
    }
  };

  const handleUnenroll = async (memberId, groupId) => {
    try {
      await API.delete(`/members/${memberId}/unenroll/${groupId}`);
      setMessage({ type: 'success', text: 'Member removed from group.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to unenroll.' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this member?')) {
      await API.delete(`/members/${id}`);
      setMessage({ type: 'success', text: 'Member deleted.' });
      fetchData();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ memberName: '', mobileNumber: '', emailAddress: '', address: '' });
  };

  return (
    <div className="module-container">
      <h2>Module 2 & 5: Member & Enrollment Management</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <h3>{editingId ? 'Edit Member' : 'Register New Member'}</h3>
        <div className="form-grid">
          <input placeholder="Member Name" value={formData.memberName} onChange={e => setFormData({...formData, memberName: e.target.value})} required />
          <input placeholder="Mobile Number" value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} required />
          <input type="email" placeholder="Email Address" value={formData.emailAddress} onChange={e => setFormData({...formData, emailAddress: e.target.value})} required />
          <input placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
        </div>
        <div className="btn-group">
          <button type="submit" className="btn-primary">{editingId ? 'Update Member' : 'Register Member'}</button>
          {editingId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
        </div>
      </form>

      <div className="search-bar" style={{ display: 'flex', gap: '15px' }}>
        <input type="text" placeholder="Search Member Name..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
          <option value="">-- Select Group to Assign --</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>
              {g.groupName} (₹{g.chitAmount})
            </option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Address</th>
              <th>Enrolled Chit Groups</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id}>
                <td>{m.memberName}</td>
                <td>{m.mobileNumber}</td>
                <td>{m.emailAddress}</td>
                <td>{m.address}</td>
                <td>
                  {m.chitGroups && m.chitGroups.length > 0 ? (
                    m.chitGroups.map(g => (
                      <span key={g.id} className="badge">
                        {g.groupName} 
                        <button onClick={() => handleUnenroll(m.id, g.id)} className="btn-x">×</button>
                      </span>
                    ))
                  ) : <em>Not Enrolled</em>}
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEnroll(m.id)} className="btn-assign">Assign Group</button>
                    <button onClick={() => { setEditingId(m.id); setFormData(m); }} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="btn-delete">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}