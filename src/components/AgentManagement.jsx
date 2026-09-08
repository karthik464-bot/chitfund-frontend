import React, { useState, useEffect } from 'react';
import API from '../api';

export default function AgentManagement() {
  const [agents, setAgents] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agentRes, memberRes] = await Promise.all([
        API.get('/admin/agents'),
        API.get('/members')
      ]);
      setAgents(agentRes.data || []);
      setMembers(memberRes.data || []);
    } catch (err) {
      console.error('Fetch agent data error:', err);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedAgent || !selectedMember) {
      setMessage({ type: 'error', text: 'Please select both an Agent and a Member.' });
      return;
    }

    try {
      await API.post('/admin/agents/assign', {
        agentId: Number(selectedAgent),
        memberId: Number(selectedMember)
      });
      setMessage({ type: 'success', text: 'Member successfully assigned to Agent!' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to assign member to agent.' });
    }
  };

  const fieldStyle = {
    backgroundColor: '#0f1120',
    border: '1px solid #282c45',
    borderRadius: '8px',
    padding: '0 14px',
    height: '42px',
    color: '#ffffff',
    fontSize: '14px',
    width: '100%'
  };

  return (
    <div className="module-container" style={{ color: '#ffffff', paddingBottom: '40px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Agent Management Portal</h2>
      {message.text && <div className={`alert ${message.type}`}>{message.text}</div>}

      {/* Assignment Card */}
      <form onSubmit={handleAssign} style={{ backgroundColor: '#131629', padding: '24px', borderRadius: '12px', border: '1px solid #1e2238', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Assign Agent to Member</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Select Agent</label>
            <select style={fieldStyle} value={selectedAgent} onChange={e => setSelectedAgent(e.target.value)}>
              <option value="">-- Choose Agent --</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.fullName} ({a.username})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Select Member</label>
            <select style={fieldStyle} value={selectedMember} onChange={e => setSelectedMember(e.target.value)}>
              <option value="">-- Choose Member --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.memberName || m.name}</option>)}
            </select>
          </div>

          <button type="submit" style={{ height: '42px', padding: '0 24px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
            Assign Member
          </button>
        </div>
      </form>

      {/* Assigned Directory */}
      <div style={{ backgroundColor: '#131629', padding: '24px', borderRadius: '12px', border: '1px solid #1e2238' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Agent Assignment Directory</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #282c45', color: '#9ca3af', fontSize: '12px', height: '40px' }}>
              <th style={{ padding: '12px' }}>Member Name</th>
              <th style={{ padding: '12px' }}>Mobile</th>
              <th style={{ padding: '12px' }}>Assigned Agent</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #1e2238', fontSize: '14px', height: '48px' }}>
                <td style={{ padding: '12px', fontWeight: '600' }}>{m.memberName || m.name}</td>
                <td style={{ padding: '12px' }}>{m.mobileNumber || m.phone || 'N/A'}</td>
                <td style={{ padding: '12px' }}>
                  {m.assignedAgent ? (
                    <span style={{ background: '#10b98122', color: '#34d399', border: '1px solid #10b98166', padding: '4px 10px', borderRadius: '6px', fontSize: '12px' }}>
                      {m.assignedAgent.fullName}
                    </span>
                  ) : (
                    <span style={{ color: '#6b7280', fontSize: '12px' }}>Unassigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}