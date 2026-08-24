import React, { useState, useEffect } from 'react';
import API from '../api';

export default function CollectionManagement() {
  const [collections, setCollections] = useState([]);
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [search, setSearch] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [colRes, memRes, grpRes] = await Promise.all([
        API.get('/collections'),
        API.get('/members'),
        API.get('/groups'),
      ]);
      setCollections(colRes.data);
      setMembers(memRes.data);
      setGroups(grpRes.data);
    } catch (err) {
      console.error('Fetch collections error:', err);
      setMessage({ type: 'error', text: 'Failed to fetch collections data.' });
    }
  };

  const handleGroupSelect = async (groupId) => {
    setSelectedGroupId(groupId);
    if (!groupId) {
      setAmount('');
      return;
    }

    try {
      const res = await API.get(`/auctions/latest/group/${groupId}`);
      if (res.data && res.data.nextInstallmentAmount) {
        setAmount(res.data.nextInstallmentAmount);
      } else {
        const group = groups.find((g) => g.id === parseInt(groupId, 10));
        if (group) {
          setAmount(group.monthlyInstallment || group.chitAmount / group.numberOfMembers);
        }
      }
    } catch (err) {
      const group = groups.find((g) => g.id === parseInt(groupId, 10));
      if (group) {
        setAmount(group.monthlyInstallment || group.chitAmount / group.numberOfMembers);
      }
    }
  };

  const handleRecordCollection = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!selectedMemberId || !selectedGroupId || !amount || !paymentDate) {
      setMessage({ type: 'error', text: 'Please fill out all required fields.' });
      return;
    }

    const memberIdNum = parseInt(selectedMemberId, 10);
    const groupIdNum = parseInt(selectedGroupId, 10);
    const numericAmount = parseFloat(amount);

    const payload = {
      member: { id: memberIdNum },
      chitGroup: { id: groupIdNum },
      group: { id: groupIdNum },
      amount: numericAmount,
      installmentAmount: numericAmount,
      paymentDate: paymentDate,
      paymentMode: paymentMode,
      status: 'PAID',
      paymentStatus: 'PAID'
    };

    try {
      await API.post('/collections', payload);
      setMessage({ type: 'success', text: 'Payment collected successfully!' });
      setAmount('');
      setSelectedMemberId('');
      setSelectedGroupId('');
      fetchData();
    } catch (err) {
      console.error('Record collection error:', err.response || err);
      const serverError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null) ||
        'Failed to record collection.';

      setMessage({ type: 'error', text: `Backend Error: ${serverError}` });
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection record?')) {
      return;
    }

    try {
      await API.delete(`/collections/${id}`);
      setMessage({ type: 'success', text: 'Collection record deleted successfully!' });
      fetchData();
    } catch (err) {
      console.error('Delete collection error:', err);
      setMessage({ type: 'error', text: 'Failed to delete collection record.' });
    }
  };

  const filteredCollections = collections.filter((col) => {
    const memberName = col.member?.name?.toLowerCase() || '';
    const groupName = col.chitGroup?.groupName?.toLowerCase() || col.group?.groupName?.toLowerCase() || '';
    const term = search.toLowerCase();
    return memberName.includes(term) || groupName.includes(term);
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
      <h2>Payment Collections</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      <form onSubmit={handleRecordCollection} className="form-card">
        <h3>Record Monthly Installment Payment</h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="form-group">
            <label style={labelStyle}>Select Member *</label>
            <select
              style={fieldStyle}
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              required
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Select Chit Group *</label>
            <select
              style={fieldStyle}
              value={selectedGroupId}
              onChange={(e) => handleGroupSelect(e.target.value)}
              required
            >
              <option value="">-- Select Group --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.groupName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Auto-Filled Payable Amount (₹) *</label>
            <input
              type="number"
              placeholder="0.00"
              style={fieldStyle}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Payment Mode *</label>
            <select
              style={fieldStyle}
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              required
            >
              <option value="CASH">CASH</option>
              <option value="UPI">UPI / GPay</option>
              <option value="BANK_TRANSFER">BANK TRANSFER</option>
              <option value="CHEQUE">CHEQUE</option>
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Payment Date *</label>
            <input
              type="date"
              style={fieldStyle}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="btn-group" style={{ marginTop: '20px' }}>
          <button type="submit" className="btn-primary">
            Record Payment & Issue Receipt
          </button>
        </div>
      </form>

      <div style={{ marginTop: '30px' }}>
        <h3>Recent Collection History</h3>
        <div className="search-bar" style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Search Collections by Member..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Chit Group</th>
                <th>Paid Amount</th>
                <th>Payment Mode</th>
                <th>Payment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#9ca3af' }}>
                    No collection records found.
                  </td>
                </tr>
              ) : (
                filteredCollections.map((col) => {
                  const displayAmount = col.amount ?? col.installmentAmount ?? 0;
                  const displayStatus = col.status || col.paymentStatus || 'PAID';
                  return (
                    <tr key={col.id}>
                      <td>{col.member?.name || 'N/A'}</td>
                      <td>{col.chitGroup?.groupName || col.group?.groupName || 'N/A'}</td>
                      <td style={{ color: '#00e676', fontWeight: 'bold' }}>
                        ₹{Number(displayAmount).toLocaleString()}
                      </td>
                      <td>{col.paymentMode || 'CASH'}</td>
                      <td>{col.paymentDate || 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            background: '#10b98122',
                            color: '#34d399',
                            border: '1px solid #10b98188',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            display: 'inline-block',
                          }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteCollection(col.id)}
                          className="btn-delete"
                        >
                          Delete
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
    </div>
  );
}