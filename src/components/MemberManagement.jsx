import React, { useState, useEffect } from 'react';
import API from '../api';
import { exportToCSV } from '../utils/exportToCSV';

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [assignMemberId, setAssignMemberId] = useState('');
  const [assignGroupId, setAssignGroupId] = useState('');

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
      const [memRes, grpRes] = await Promise.all([
        API.get('/members'),
        API.get('/groups'),
      ]);
      setMembers(memRes.data || []);
      setGroups(grpRes.data || []);
    } catch (err) {
      console.error('Fetch error in Members module:', err);
      setMessage({ type: 'error', text: 'Failed to load members or chit groups data.' });
    }
  };

  // Comprehensive entity field getters for mobile and email
  const getMobileNumber = (m) =>
    m.phone || m.mobile || m.phoneNumber || m.mobileNumber || m.phoneNo || m.contactNo || 'N/A';

  const getEmailAddress = (m) =>
    m.email || m.emailId || m.email_id || m.emailAddress || m.mail || m.user?.email || 'N/A';

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!name || !phone) {
      setMessage({ type: 'error', text: 'Member Name and Mobile Number are required.' });
      return;
    }

    const payload = {
      name,
      memberName: name,
      phone,
      mobile: phone,
      phoneNumber: phone,
      mobileNumber: phone,
      email,
      emailId: email,
      emailAddress: email,
      address,
    };

    try {
      await API.post('/members', payload);
      setMessage({ type: 'success', text: 'Member registered successfully!' });
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      fetchData();
    } catch (err) {
      console.error('Register member error:', err);
      const serverMsg = err.response?.data?.message || 'Failed to register member.';
      setMessage({ type: 'error', text: serverMsg });
    }
  };

  const handleAssignGroup = async (e) => {
    e.preventDefault();
    if (!assignMemberId || !assignGroupId) {
      setMessage({ type: 'error', text: 'Please select both a Member and a Chit Group to assign.' });
      return;
    }

    try {
      await API.post(`/members/${assignMemberId}/groups/${assignGroupId}`);
      setMessage({ type: 'success', text: 'Member successfully assigned to Chit Group!' });
      setAssignMemberId('');
      setAssignGroupId('');
      fetchData();
    } catch (err) {
      console.error('Assign group error:', err);
      const serverMsg = err.response?.data?.message || 'Failed to assign group to member.';
      setMessage({ type: 'error', text: serverMsg });
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;

    try {
      await API.delete(`/members/${id}`);
      setMessage({ type: 'success', text: 'Member deleted successfully.' });
      fetchData();
    } catch (err) {
      console.error('Delete member error:', err);
      setMessage({ type: 'error', text: 'Failed to delete member.' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Member ID', 'Member Name', 'Mobile Number', 'Email', 'Address', 'Enrolled Chit Groups'];
    const rows = filteredMembers.map((m) => {
      const groupNames = (m.chitGroups || m.groups || [])
        .map((g) => g.groupName)
        .join('; ');
      return [m.id, m.name || m.memberName, getMobileNumber(m), getEmailAddress(m), m.address || 'N/A', groupNames || 'None'];
    });
    exportToCSV('Members_Directory_Report', headers, rows);
  };

  // Filter & Pagination Logic
  const filteredMembers = members.filter((m) => {
    const term = search.toLowerCase();
    const mName = (m.name || m.memberName || '').toLowerCase();
    const mPhone = getMobileNumber(m).toLowerCase();
    const mEmail = getEmailAddress(m).toLowerCase();
    return mName.includes(term) || mPhone.includes(term) || mEmail.includes(term);
  });

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = filteredMembers.slice(
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
    <div className="module-container" style={{ paddingBottom: '40px', color: '#ffffff' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
        Member & Enrollment Management
      </h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      {/* Register New Member Form Card */}
      <form onSubmit={handleRegisterMember} className="form-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#ffffff', marginBottom: '16px' }}>
          Register New Member
        </h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label style={labelStyle}>Member Name *</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              style={fieldStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Mobile Number *</label>
            <input
              type="text"
              placeholder="10-digit mobile"
              style={fieldStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              style={fieldStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Residential Address</label>
            <input
              type="text"
              placeholder="Address"
              style={fieldStyle}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="btn-group" style={{ marginTop: '20px' }}>
          <button type="submit" className="btn-primary" style={{ height: '42px', padding: '0 24px' }}>
            Register Member
          </button>
        </div>
      </form>

      {/* Assign Member to Chit Group Form */}
      <form
        onSubmit={handleAssignGroup}
        className="form-card"
        style={{ marginBottom: '32px', background: '#0f1120', border: '1px solid #1e2238' }}
      >
        <h3 style={{ fontSize: '15px', color: '#a78bfa', marginBottom: '16px' }}>
          Assign Member to Chit Group
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
            gap: '16px',
            alignItems: 'end',
          }}
        >
          <div className="form-group">
            <label style={labelStyle}>Select Member</label>
            <select
              style={fieldStyle}
              value={assignMemberId}
              onChange={(e) => setAssignMemberId(e.target.value)}
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.memberName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Select Chit Group</label>
            <select
              style={fieldStyle}
              value={assignGroupId}
              onChange={(e) => setAssignGroupId(e.target.value)}
            >
              <option value="">-- Choose Chit Group --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.groupName}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ height: '42px', padding: '0 24px', whiteSpace: 'nowrap' }}
          >
            Assign Group
          </button>
        </div>
      </form>

      {/* Enrolled Members Directory Card */}
      <div
        style={{
          backgroundColor: '#131629',
          border: '1px solid #1e2238',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', margin: 0 }}>
            Enrolled Members Directory
          </h3>
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

        {/* Search Input and Rows Per Page Dropdown */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: '20px',
            gap: '12px',
          }}
        >
          <input
            type="text"
            placeholder="Search Members by Name, Phone, or Email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{ ...fieldStyle, maxWidth: '360px' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '13px', whiteSpace: 'nowrap' }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ ...fieldStyle, width: '75px', height: '38px' }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #282c45', color: '#9ca3af', fontSize: '12px', height: '44px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Member Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Mobile</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Address</th>
                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Enrolled Chit Groups</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                    No member records found.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((m) => {
                  const memberGroups = m.chitGroups || m.groups || [];
                  return (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: '1px solid #1e2238',
                        fontSize: '14px',
                        height: '52px',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#ffffff' }}>
                        {m.name || m.memberName}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#d1d5db' }}>{getMobileNumber(m)}</td>
                      <td style={{ padding: '12px 16px', color: '#d1d5db' }}>{getEmailAddress(m)}</td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{m.address || 'N/A'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {memberGroups.length === 0 ? (
                          <span style={{ color: '#6b7280', fontSize: '12px' }}>Unassigned</span>
                        ) : (
                          memberGroups.map((g) => (
                            <span
                              key={g.id}
                              style={{
                                background: '#8b5cf622',
                                color: '#a78bfa',
                                border: '1px solid #8b5cf666',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                marginRight: '6px',
                                display: 'inline-block',
                              }}
                            >
                              {g.groupName}
                            </span>
                          ))
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button onClick={() => handleDeleteMember(m.id)} className="btn-delete">
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

        {/* Clean, Non-Overlapping Pagination Bar */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #1e2238',
            color: '#9ca3af',
            fontSize: '13px',
            flexWrap: 'wrap',
            gap: '12px',
            width: '100%',
          }}
        >
          <div style={{ whiteSpace: 'nowrap' }}>
            Page {currentPage} of {totalPages} ({filteredMembers.length} total members)
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              style={{
                backgroundColor: currentPage === 1 ? '#1f243888' : '#1f2438',
                color: currentPage === 1 ? '#6b7280' : '#ffffff',
                border: '1px solid #374151',
                borderRadius: '6px',
                padding: '6px 14px',
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
                padding: '6px 14px',
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