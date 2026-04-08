import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Table, Loader, Badge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Documents() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  const [list, setList] = useState([]);
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ employee:'', title:'', type:'other', expiryDate:'' });
  const [file, setFile] = useState(null);

  const load = async () => { setLoading(true); const [d, e] = await Promise.all([api.get('/documents'), api.get('/employees')]); setList(Array.isArray(d)?d:[]); setEmps(Array.isArray(e)?e:[]); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.employee || !form.title) return alert('Employee and title required');
    const fd = new FormData();
    Object.keys(form).forEach(k => form[k] && fd.append(k, form[k]));
    if (file) fd.append('file', file);
    await api.postForm('/documents', fd);
    setShow(false); setForm({ employee:'', title:'', type:'other', expiryDate:'' }); setFile(null); load();
  };

  const verify = async (id) => { await api.patch(`/documents/${id}/verify`, {}); load(); };

  const cols = [
    { key: 'employee', label: 'Employee', render: r => <strong>{r.employee?.name || '—'}</strong> },
    { key: 'title', label: 'Document' },
    { key: 'type', label: 'Type', render: r => <Badge label={r.type} color="#6366f1" /> },
    { key: 'fileName', label: 'File', render: r => r.filePath ? <a href={`http://localhost:5000${r.filePath}`} target="_blank" rel="noreferrer" style={{ color: '#6366f1', fontSize: 12 }}>📎 View</a> : '—' },
    { key: 'isVerified', label: 'Verified', render: r => r.isVerified ? <span style={{ color: '#22c55e' }}>✅ Yes</span> : <span style={{ color: '#f59e0b' }}>⏳ No</span> },
    { key: 'expiryDate', label: 'Expiry', render: r => r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : '—' },
    {
      key: 'actions', label: 'Actions', render: r => (
        <div style={{ display: 'flex', gap: 5 }}>
          {/* Verify — admin/hr ku mattum */}
          {isAdmin && !r.isVerified && <Btn size="sm" variant="success" onClick={() => verify(r._id)}>Verify</Btn>}
          {/* Delete — everyone ku */}
          <Btn size="sm" variant="danger" onClick={async () => { if(!confirm('Delete?'))return; await api.delete(`/documents/${r._id}`); load(); }}>Del</Btn>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader title="📄 Documents" subtitle="Employee document management"
        action={isAdmin ? <Btn onClick={() => setShow(true)}>+ Upload Document</Btn> : null} />
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={list} emptyMsg="No documents" />}
      </div>
      {isAdmin && (
        <Modal show={show} onClose={() => setShow(false)} title="Upload Document">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Employee *</label>
              <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} value={form.employee} onChange={e => setForm({...form, employee: e.target.value})}>
                <option value="">Select Employee</option>
                {emps.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
              </select>
            </div>
            <Input label="Document Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Aadhar Card" />
            <Select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              options={['offer-letter','appointment','experience','payslip','id-proof','address-proof','other'].map(t => ({ value:t, label:t }))} />
            <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} />
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>File</label>
              <input type="file" onChange={e => setFile(e.target.files[0])} style={{ fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
            <Btn onClick={save}>Upload</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}