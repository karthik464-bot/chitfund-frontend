import React, { useState, useEffect } from 'react';
import API from '../api';

export default function ChitGroupManagement() {
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    templateName: '',
    schemeAmount: '',
    numberOfInstallment: '',
    totalMembers: '',
    commission: '5',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  // Dynamic schedule breakdown state
  const [templateRows, setTemplateRows] = useState([]);
  const [showTemplateTable, setShowTemplateTable] = useState(false);

  // Helper to calculate End Date dynamically from Start Date + Months
  const calculateEndDate = (startDateStr, monthsCount) => {
    if (!startDateStr || !monthsCount) return '-';
    const date = new Date(startDateStr);
    const months = parseInt(monthsCount, 10);
    if (isNaN(date.getTime()) || isNaN(months) || months <= 0) return '-';
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  // Helper to format dates as DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '-') return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Auto-calculate End Date in the form
  useEffect(() => {
    if (formData.startDate && formData.numberOfInstallment) {
      const calculated = calculateEndDate(formData.startDate, formData.numberOfInstallment);
      if (calculated !== '-') {
        setFormData(prev => ({ ...prev, endDate: calculated }));
      }
    }
  }, [formData.startDate, formData.numberOfInstallment]);

  const fetchGroups = async (query = '') => {
    try {
      const res = await API.get(`/groups?search=${query}`);
      setGroups(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch groups.' });
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchGroups(e.target.value);
  };

  // Generate dynamic template schedule from top form
  const handleViewTemplate = () => {
    if (!formData.templateName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Template Name.' });
      return;
    }
    if (!formData.schemeAmount || Number(formData.schemeAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid Scheme Amount.' });
      return;
    }
    const count = parseInt(formData.numberOfInstallment, 10);
    if (!count || count <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid Number of Installments.' });
      return;
    }

    setMessage({ type: '', text: '' });

    const rows = [];
    const baseInstallment = (Number(formData.schemeAmount) / count).toFixed(2);

    for (let i = 1; i <= count; i++) {
      rows.push({
        sno: i,
        monthlyInstallment: baseInstallment,
        auctionAmount: formData.schemeAmount
      });
    }

    setTemplateRows(rows);
    setShowTemplateTable(true);
  };

  // View schedule breakdown directly from table row & sync form state
  const handleViewRowTemplate = (group) => {
    setEditingId(group.id);
    const computedEnd = group.endDate || calculateEndDate(group.startDate, group.durationMonths);

    setFormData({
      templateName: group.groupName,
      schemeAmount: group.chitAmount,
      numberOfInstallment: group.durationMonths,
      totalMembers: group.numberOfMembers,
      commission: '5',
      startDate: group.startDate || new Date().toISOString().split('T')[0],
      endDate: computedEnd !== '-' ? computedEnd : ''
    });

    const count = parseInt(group.durationMonths, 10);
    if (!count || count <= 0) return;

    const rows = [];
    const baseInstallment = (group.chitAmount / count).toFixed(2);

    for (let i = 1; i <= count; i++) {
      rows.push({
        sno: i,
        monthlyInstallment: baseInstallment,
        auctionAmount: group.chitAmount
      });
    }

    setTemplateRows(rows);
    setShowTemplateTable(true);
    setMessage({ type: '', text: '' });
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...templateRows];
    updated[index][field] = value;
    setTemplateRows(updated);
  };

  // Save or Update Chit Group
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.templateName || !formData.schemeAmount || !formData.numberOfInstallment) {
      setMessage({ type: 'error', text: 'Please fill out Template Name, Scheme Amount, and Number of Installments.' });
      return;
    }

    const calculatedInstallment = (Number(formData.schemeAmount) / Number(formData.numberOfInstallment)).toFixed(2);
    const computedEndDate = formData.endDate || calculateEndDate(formData.startDate, formData.numberOfInstallment);

    const payload = {
      groupName: String(formData.templateName).trim(),
      chitAmount: formData.schemeAmount,
      monthlyInstallment: calculatedInstallment,
      numberOfMembers: formData.totalMembers || formData.numberOfInstallment,
      durationMonths: formData.numberOfInstallment,
      startDate: formData.startDate,
      endDate: computedEndDate !== '-' ? computedEndDate : null,
      status: 'ACTIVE'
    };

    try {
      if (editingId) {
        await API.put(`/groups/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Chit Group updated successfully!' });
      } else {
        await API.post('/groups', payload);
        setMessage({ type: 'success', text: 'Template Created and Chit Group Saved!' });
      }
      fetchGroups();
      resetForm();
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving chit group template.' });
    }
  };

  const handleEdit = (group) => {
    setEditingId(group.id);
    const computedEnd = group.endDate || calculateEndDate(group.startDate, group.durationMonths);

    setFormData({
      templateName: group.groupName,
      schemeAmount: group.chitAmount,
      numberOfInstallment: group.durationMonths,
      totalMembers: group.numberOfMembers,
      commission: '5',
      startDate: group.startDate || new Date().toISOString().split('T')[0],
      endDate: computedEnd !== '-' ? computedEnd : ''
    });
    setShowTemplateTable(false);
    setMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this Chit Group?')) {
      await API.delete(`/groups/${id}`);
      setMessage({ type: 'success', text: 'Group deleted.' });
      fetchGroups();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      templateName: '',
      schemeAmount: '',
      numberOfInstallment: '',
      totalMembers: '',
      commission: '5',
      startDate: new Date().toISOString().split('T')[0],
      endDate: ''
    });
    setTemplateRows([]);
    setShowTemplateTable(false);
  };

  return (
    <div className="module-container">
      <h2>Module 1: Chit Group Management</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      {/* Template Creation / Edit Form */}
      <form onSubmit={handleSubmit} className="form-card">
        <h3>{editingId ? 'Edit Chit Group' : 'Create New Template'}</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Template Name *</label>
            <input
              placeholder="e.g. 2 lakh chit"
              value={formData.templateName}
              onChange={e => setFormData({ ...formData, templateName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Scheme Amount (₹) *</label>
            <input
              type="number"
              placeholder="e.g. 200000"
              value={formData.schemeAmount}
              onChange={e => setFormData({ ...formData, schemeAmount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Number Of Installments *</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={formData.numberOfInstallment}
              onChange={e => setFormData({ ...formData, numberOfInstallment: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Total Members *</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={formData.totalMembers}
              onChange={e => setFormData({ ...formData, totalMembers: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Commission (%)</label>
            <input
              type="number"
              placeholder="5"
              value={formData.commission}
              onChange={e => setFormData({ ...formData, commission: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="btn-group">
          <button type="button" onClick={handleViewTemplate} className="btn-secondary">
            View Template
          </button>
          <button type="submit" className="btn-primary">
            {editingId ? 'Update Group' : 'Save Chit Group'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Dynamic Schedule Table */}
      {showTemplateTable && (
        <div className="form-card schedule-table-card" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Template Schedule Breakdown</h3>
            <button type="button" onClick={handleSubmit} className="btn-primary">
              Confirm & Save Group
            </button>
          </div>

          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Monthly Installment (₹)</th>
                  <th>Auction Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {templateRows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.sno}</td>
                    <td>
                      <input
                        type="number"
                        value={row.monthlyInstallment}
                        onChange={e => handleRowChange(index, 'monthlyInstallment', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.auctionAmount}
                        onChange={e => handleRowChange(index, 'auctionAmount', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Schemes List */}
      <div style={{ marginTop: '30px' }}>
        <h3>Active Chit Schemes</h3>
        <div className="search-bar" style={{ marginTop: '10px' }}>
          <input
            type="text"
            placeholder="Search Group by Name..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Group Name</th>
                <th>Scheme Amount</th>
                <th>Installment</th>
                <th>Members</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => {
                const displayEndDate = g.endDate || calculateEndDate(g.startDate, g.durationMonths);
                return (
                  <tr key={g.id}>
                    <td>{g.groupName}</td>
                    <td>₹{g.chitAmount}</td>
                    <td>₹{g.monthlyInstallment}</td>
                    <td>{g.numberOfMembers}</td>
                    <td>{g.durationMonths} months</td>
                    <td>{formatDate(g.startDate)}</td>
                    <td>{formatDate(displayEndDate)}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleViewRowTemplate(g)} 
                          className="btn-assign"
                        >
                          View Template
                        </button>
                        <button 
                          onClick={() => handleEdit(g)} 
                          className="btn-edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(g.id)} 
                          className="btn-delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}