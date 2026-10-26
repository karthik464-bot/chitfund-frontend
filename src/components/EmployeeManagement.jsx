import React, { useState, useEffect } from 'react';
import API from '../api';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for creating a new employee
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Check user role from localStorage
  const userRole = (localStorage.getItem('userRole') || localStorage.getItem('role') || '').toUpperCase();
  const isAdmin = userRole.includes('ADMIN');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees');
      setEmployees(res.data);
      setError('');
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employee records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await API.post('/employees', { name, email, department, phoneNumber });
      setName('');
      setEmail('');
      setDepartment('');
      setPhoneNumber('');
      fetchEmployees();
    } catch (err) {
      console.error('Error creating employee:', err);
      alert(err.response?.data?.message || 'Failed to create employee. Make sure you have Admin rights.');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await API.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee. Access denied or invalid ID.');
    }
  };

  return (
    <div style={{ color: '#ffffff', padding: '20px' }}>
      <h2>Employee Management</h2>
      <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
        {isAdmin ? 'Manage organization employees (Admin Access)' : 'View organization employees (Read-Only)'}
      </p>

      {error && <div style={{ color: '#f87171', marginBottom: '16px' }}>{error}</div>}

      {/* Admin-only Create Form */}
      {isAdmin && (
        <form onSubmit={handleCreateEmployee} style={{ backgroundColor: '#131629', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #1e2238' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Add New Employee</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <input type="text" placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            <input type="email" placeholder="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
            <input type="text" placeholder="Department" value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={inputStyle} />
          </div>
          <button type="submit" style={btnStyle}>Create Employee</button>
        </form>
      )}

      {/* Employee List Table */}
      <div style={{ backgroundColor: '#131629', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1e2238' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1e36', color: '#9ca3af', borderBottom: '1px solid #282c45' }}>
              <th style={{ padding: '12px 16px' }}>ID</th>
              <th style={{ padding: '12px 16px' }}>Name</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Department</th>
              <th style={{ padding: '12px 16px' }}>Phone</th>
              {isAdmin && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
            ) : employees.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>No employee records found.</td></tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #1e2238' }}>
                  <td style={{ padding: '12px 16px' }}>{emp.id}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.name}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.email}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.department || 'N/A'}</td>
                  <td style={{ padding: '12px 16px' }}>{emp.phoneNumber || 'N/A'}</td>
                  {isAdmin && (
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button onClick={() => handleDeleteEmployee(emp.id)} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputStyle = {
  backgroundColor: '#0f1120',
  border: '1px solid #282c45',
  borderRadius: '6px',
  padding: '10px 14px',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const btnStyle = {
  backgroundColor: '#6366f1',
  color: '#ffffff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '6px',
  fontWeight: '600',
  cursor: 'pointer',
  fontSize: '14px'
};