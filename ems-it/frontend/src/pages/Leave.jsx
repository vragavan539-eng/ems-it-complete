import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge, statusColor } from '../components/UI';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Leave() {
  const { user, isAdmin, isHR } = useAuth();
  const isEmployee = !isAdmin && !isHR;

  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ employee:'', leaveType:'casual', fromDate:'', toDate:'', reason:'' });
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    const [l, e] = await Promise.all([
      api.get('/leave' + (filter ? `?status=${filter}` : '')),
      api.get('/employees')
    ]);
    const allList = Array.isArray(l) ? l : [];
    const allEmps = Array.isArray(e) ? e : [];

    if (isEmployee) {
      const userId = user?.id || user?._id;
      const userName = user?.name?.toLowerCase().trim();

      const filtered = allList.filter(record => {
        const emp = record.employee;
        if (!emp) return false;
        // 1st: match by employee.user (linked user _id)
        const empUserId = emp.user?._id || emp.user;
        if (empUserId && empUserId === userId) return true;
        // 2nd fallback: match by name
        if (userName && emp.name?.toLowerCase().trim() === userName) return true;
        return false;
      });
      setList(filtered);
    } else {
      setList(allList);
    }

    setEmps(allEmps);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  // Find the employee record for this logged-in user
  const myEmployee = emps.find(e => {
    const userId = user?.id || user?._id;
    const userName = user?.name?.toLowerCase().trim();
    const empUserId = e.user?._id || e.user;
    if (empUserId && empUserId === userId) return true;
    if (userName && e.name?.toLowerCase().trim() === userName) return true;
    return false;
  });

  const openApplyLeave = () => {
    setForm({
      employee: isEmployee ? (myEmployee?._id || '') : '',
      leaveType: 'casual',
      fromDate: '',
      toDate: '',
      reason: ''
    });
    setShow(true);
  };

  const save = async () => {
    if (!form.employee || !form.fromDate || !form.toDate || !form.reason) return alert('Fill all fields');
    await api.post('/leave', form);
    setShow(false);
    setForm({ employee:'', leaveType:'casual', fromDate:'', toDate:'', reason:'' });
    load();
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/leave/${id}/status`, { status });
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/leave/${id}`);
    load();
  };

  const cols = [
    { key: 'employee', label: 'Employee', render: r => <strong>{r.employee?.name || '—'}</strong> },
    { key: 'leaveType', label: 'Type', render: r => <Badge label={r.leaveType} color="#6366f1" /> },
    { key: 'fromDate', label: 'From', render: r => new Date(r.fromDate).toLocaleDateString() },
    { key: 'toDate', label: 'To', render: r => new Date(r.toDate).toLocaleDateString() },
    { key: 'days', label: 'Days' },
    { key: 'reason', label: 'Reason' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {!isEmployee && r.status === 'pending' && <>
            <Btn size="sm" variant="success" onClick={() => updateStatus(r._id, 'approved')}>✓ Approve</Btn>
            <Btn size="sm" variant="danger" onClick={() => updateStatus(r._id, 'rejected')}>✗ Reject</Btn>
          </>}
          <Btn size="sm" variant="ghost" onClick={() => del(r._id)}>Del</Btn>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="📅 Leave Management" subtitle="Track and manage employee leaves"
        action={<Btn onClick={openApplyLeave}>+ Apply Leave</Btn>}
      />
      <div style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 14, display: 'flex', gap: 8 }}>
        {['','pending','approved','rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: filter===s ? '#6366f1' : '#fff', color: filter===s ? '#fff' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {s || 'All'}
          </button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No leave records" />}
      </div>

      <Modal show={show} onClose={() => setShow(false)} title="Apply Leave">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Employee *</label>
            {isEmployee ? (
              // ✅ Employee: auto-select, dropdown காட்டாதே
              <div style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#f8fafc', color: '#475569' }}>
                {user?.name || 'You'}
              </div>
            ) : (
              <select
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                value={form.employee}
                onChange={e => setForm({...form, employee: e.target.value})}
              >
                <option value="">Select Employee</option>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            )}
          </div>
          <Select label="Leave Type" value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value})}
            options={['casual','sick','earned','maternity','paternity','unpaid'].map(t => ({ value: t, label: t.charAt(0).toUpperCase()+t.slice(1) }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="From Date" type="date" value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})} />
            <Input label="To Date" type="date" value={form.toDate} onChange={e => setForm({...form, toDate: e.target.value})} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Reason *</label>
            <textarea
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
              rows={3}
              value={form.reason}
              onChange={e => setForm({...form, reason: e.target.value})}
              placeholder="Reason for leave..."
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
          <Btn onClick={save}>Submit</Btn>
        </div>
      </Modal>
    </div>
  );
}