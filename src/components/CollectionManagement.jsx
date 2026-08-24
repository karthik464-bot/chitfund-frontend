import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import API from '../api';
import { exportToCSV } from '../utils/exportToCSV';

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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      setCollections(colRes.data || []);
      setMembers(memRes.data || []);
      setGroups(grpRes.data || []);
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
      paymentStatus: 'PAID',
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
    if (!window.confirm('Are you sure you want to delete this collection record?')) return;

    try {
      await API.delete(`/collections/${id}`);
      setMessage({ type: 'success', text: 'Collection record deleted successfully!' });
      fetchData();
    } catch (err) {
      console.error('Delete collection error:', err);
      setMessage({ type: 'error', text: 'Failed to delete collection record.' });
    }
  };

  // PDF Receipt Download
  const downloadReceipt = (col) => {
    const doc = new jsPDF();
    const memberName = col.member?.name || 'Member';
    const groupName = col.chitGroup?.groupName || col.group?.groupName || 'Chit Group';
    const paidAmt = Number(col.amount ?? col.installmentAmount ?? 0).toLocaleString();
    const payDate = col.paymentDate || new Date().toISOString().split('T')[0];
    const payMode = col.paymentMode || 'CASH';
    const receiptNo = `REC-${col.id || Math.floor(1000 + Math.random() * 9000)}`;

    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 130);

    doc.setFillColor(99, 102, 241);
    doc.rect(10, 10, 190, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CHIT FUND PAYMENT RECEIPT', 15, 26);
    doc.setFontSize(10);
    doc.text(`Receipt No: ${receiptNo}`, 145, 26);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    let currentY = 50;

    doc.setFont('helvetica', 'bold');
    doc.text('Member Name:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(memberName, 55, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Date:', 110, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(payDate, 145, currentY);

    currentY += 14;

    doc.setFont('helvetica', 'bold');
    doc.text('Chit Group:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(groupName, 55, currentY);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Mode:', 110, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(payMode, 145, currentY);

    currentY += 18;

    doc.setFillColor(243, 244, 246);
    doc.rect(20, currentY, 170, 20, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`Amount Received: RS ${paidAmt}/-`, 30, currentY + 13);
    doc.setTextColor(55, 65, 81);
    doc.text(`Status: PAID`, 140, currentY + 13);

    doc.save(`Receipt_${memberName.replace(/\s+/g, '_')}_${receiptNo}.pdf`);
  };

  // CSV Export Trigger
  const handleExportCSV = () => {
    const headers = ['Collection ID', 'Member Name', 'Chit Group', 'Paid Amount', 'Payment Mode', 'Payment Date', 'Status'];
    const rows = filteredCollections.map((col) => [
      col.id,
      col.member?.name || 'N/A',
      col.chitGroup?.groupName || col.group?.groupName || 'N/A',
      col.amount ?? col.installmentAmount ?? 0,
      col.paymentMode || 'CASH',
      col.paymentDate || 'N/A',
      col.status || col.paymentStatus || 'PAID',
    ]);
    exportToCSV('Collections_Report', headers, rows);
  };

  // Filter & Pagination Calculations
  const filteredCollections = collections.filter((col) => {
    const memberName = col.member?.name?.toLowerCase() || '';
    const groupName = col.chitGroup?.groupName?.toLowerCase() || col.group?.groupName?.toLowerCase() || '';
    const term = search.toLowerCase();
    return memberName.includes(term) || groupName.includes(term);
  });

  const totalPages = Math.ceil(filteredCollections.length / pageSize) || 1;
  const paginatedCollections = filteredCollections.slice(
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
                <option key={m.id} value={m.id}>{m.name}</option>
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
                <option key={g.id} value={g.id}>{g.groupName}</option>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3>Recent Collection History</h3>
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

        {/* Search & Page Size Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', marginBottom: '14px', gap: '12px' }}>
          <input
            type="text"
            placeholder="Search Collections by Member..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{ ...fieldStyle, maxWidth: '320px' }}
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

        {/* Table */}
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
              {paginatedCollections.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#9ca3af' }}>
                    No collection records found.
                  </td>
                </tr>
              ) : (
                paginatedCollections.map((col) => {
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
                          }}
                        >
                          {displayStatus}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => downloadReceipt(col)}
                          style={{
                            backgroundColor: '#6366f1',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Receipt PDF
                        </button>
                        <button onClick={() => handleDeleteCollection(col.id)} className="btn-delete">
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

        {/* Pagination Control Bar */}
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
            Page {currentPage} of {totalPages} ({filteredCollections.length} total records)
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