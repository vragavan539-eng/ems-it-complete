import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { PageHeader, Btn, Badge, Modal, Input, Select, Table, Loader, statusColor } from '../components/UI';
import api from '../api';
import FaceScanner from '../components/facescanner';

const EMPTY = { name:'', email:'', password:'', phone:'', designation:'', salary:'', department:'', role:'employee', status:'active', skills:'', address:'', bloodGroup:'', joiningDate:'' };

export default function Employees() {
  const [list, setList] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [search, setSearch] = useState('');
  const [err, setErr] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [showFace, setShowFace] = useState(false);
  const [faceEmp, setFaceEmp] = useState(null);
  const [faceMsg, setFaceMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const [emps, deps] = await Promise.all([api.get('/employees'), api.get('/departments')]);
    setList(Array.isArray(emps) ? emps : []);
    setDepts(Array.isArray(deps) ? deps : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setErr('');
    if (!form.name || !form.email) return setErr('Name and Email required');
    if (!editId && !form.password) return setErr('Password is required for new employee');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => {
        if (form[k]) fd.append(k, form[k]);
      });
      if (photo) fd.append('photo', photo);
      const result = editId
        ? await api.putForm(`/employees/${editId}`, fd)
        : await api.postForm('/employees', fd);
      if (result.message && !result._id) return setErr(result.message);
      setShow(false); setForm(EMPTY); setEditId(null); setPhoto(null);
      load();
    } catch (e) { setErr(e.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this employee?')) return;
    await api.delete(`/employees/${id}`); load();
  };

  const openEdit = (emp) => {
    setForm({
      name: emp.name || '', email: emp.email || '', password: '',
      phone: emp.phone || '', designation: emp.designation || '',
      salary: emp.salary || '', department: emp.department?._id || '',
      role: emp.role || 'employee', status: emp.status || 'active',
      skills: (emp.skills || []).join(', '), address: emp.address || '',
      bloodGroup: emp.bloodGroup || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
    });
    setEditId(emp._id); setShow(true); setErr(''); setShowPass(false);
  };

  const openFaceRegister = (emp) => {
    setFaceEmp(emp); setFaceMsg(''); setShowFace(true);
  };

  const handleFaceRegister = async (descriptor) => {
    try {
      const res = await api.post('/face/register', { employeeId: faceEmp._id, descriptor });
      setFaceMsg('✅ ' + res.message);
      load();
    } catch (err) {
      setFaceMsg('❌ Error registering face');
    }
  };

  const filtered = list.filter(e =>
    e.role !== 'admin' &&
    (e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeCode?.toLowerCase().includes(search.toLowerCase()))
  );

  const cols = [
    { key: 'photo', label: '', render: r => (
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ede9fe', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#6366f1' }}>
        {r.photo
          ? <img src={`https://ems-it-complete-2.onrender.com${r.photo}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : r.name?.[0]}
      </div>
    )},
    { key: 'employeeCode', label: 'Code' },
    { key: 'name', label: 'Name', render: r => <strong>{r.name}</strong> },
    { key: 'email', label: 'Email' },
    { key: 'designation', label: 'Designation' },
    { key: 'department', label: 'Department', render: r => r.department?.name || '—' },
    { key: 'salary', label: 'Salary', render: r => r.salary ? '₹' + Number(r.salary).toLocaleString() : '—' },
    { key: 'status', label: 'Status', render: r => <Badge label={r.status} color={statusColor(r.status)} /> },
    { key: 'face', label: 'Face', render: r => (
      <Badge label={r.faceDescriptor ? '✅ Registered' : '❌ Not Set'} color={r.faceDescriptor ? 'green' : 'gray'} />
    )},
    { key: 'actions', label: 'Actions', render: r => (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {isAdmin && <Btn size="sm" variant="outline" onClick={() => openEdit(r)}>Edit</Btn>}
        {isAdmin && <Btn size="sm" variant="danger" onClick={() => del(r._id)}>Delete</Btn>}
        {isAdmin && (
          <Btn size="sm" variant="outline" onClick={() => openFaceRegister(r)}>
            📷 {r.faceDescriptor ? 'Re-Register' : 'Register Face'}
          </Btn>
        )}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="👥 Employees" subtitle={`${filtered.length} employees`}
        action={isAdmin && <Btn onClick={() => { setShow(true); setForm(EMPTY); setEditId(null); setErr(''); setShowPass(false); }}>+ Add Employee</Btn>} />

      <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 16 }}>
        <input style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, width: 300 }}
          placeholder="🔍 Search by name, email, code..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {loading ? <Loader /> : <Table columns={cols} data={filtered} emptyMsg="No employees found" />}
      </div>

      {/* Add/Edit Modal */}
      <Modal show={show} onClose={() => { setShow(false); setShowPass(false); }} title={editId ? 'Edit Employee' : 'Add Employee'} width={620}>
        {err && (
          <div style={{ background: '#fef2f2', color: '#dc2626', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
            ⚠️ {err}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Name */}
          <Input label="Full Name *" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />

          {/* Email */}
          <Input label="Email *" required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" />

          {/* Password - Full Width */}
          <div style={{ gridColumn: 'span 2', background: '#f0fdf4', border: '2px solid #86efac', borderRadius: 10, padding: '12px 14px' }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: '#166534', display: 'block', marginBottom: 8 }}>
              🔑 {editId ? 'New Password (மாத்தணும்னா மட்டும் type பண்ணுங்க)' : 'Password *'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                placeholder={editId ? 'புதிய password type பண்ணுங்க (optional)' : 'Employee login password *'}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 44px 10px 12px',
                  border: '1px solid #86efac',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  background: '#fff',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 18, lineHeight: 1,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#16a34a', marginTop: 6, marginBottom: 0 }}>
              {editId
                ? '💡 விட்டால் password மாறாது — மாத்தணும்னா மட்டும் type பண்ணுங்க'
                : '💡 Employee இந்த email + password-லயே login பண்ணலாம்'}
            </p>
          </div>

          {/* Phone + Designation */}
          <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
          <Input label="Designation" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} placeholder="Software Engineer" />

          {/* Department + Role */}
          <Select label="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})}
            options={depts.map(d => ({ value: d._id, label: d.name }))} />
          <Select label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}
            options={[{value:'employee',label:'Employee'},{value:'manager',label:'Manager'},{value:'hr',label:'HR'},{value:'admin',label:'Admin'}]} />

          {/* Salary + Status */}
          <Input label="Salary (₹)" type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="50000" />
          <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})}
            options={[{value:'active',label:'Active'},{value:'inactive',label:'Inactive'},{value:'resigned',label:'Resigned'}]} />

          {/* Joining Date + Blood Group */}
          <Input label="Joining Date" type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} />
          <Input label="Blood Group" value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})} placeholder="O+" />

          {/* Skills */}
          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Skills (comma separated)" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="React, Node.js, MongoDB" />
          </div>

          {/* Address */}
          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Main St, Chennai" />
          </div>

          {/* Profile Photo */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Profile Photo</label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])}
              style={{ fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', width: '100%' }} />
          </div>

        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => { setShow(false); setShowPass(false); }}>Cancel</Btn>
          <Btn onClick={save}>{editId ? 'Update Employee' : 'Save Employee'}</Btn>
        </div>
      </Modal>

      {/* Face Register Modal */}
      <Modal show={showFace} onClose={() => setShowFace(false)} title={`📷 Register Face — ${faceEmp?.name}`} width={420}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Camera-ல முகம் வச்சு <strong>Scan</strong> பண்ணுங்க
          </p>
          <FaceScanner onDetect={handleFaceRegister} buttonLabel="Capture & Register" />
          {faceMsg && (
            <div style={{
              marginTop: 12, padding: '8px 12px',
              background: faceMsg.includes('✅') ? '#f0fdf4' : '#fef2f2',
              color: faceMsg.includes('✅') ? '#16a34a' : '#dc2626',
              borderRadius: 8, fontSize: 13
            }}>
              {faceMsg}
            </div>
          )}
          {faceMsg.includes('✅') && (
            <Btn style={{ marginTop: 12 }} onClick={() => setShowFace(false)}>Close</Btn>
          )}
        </div>
      </Modal>
    </div>
  );
}