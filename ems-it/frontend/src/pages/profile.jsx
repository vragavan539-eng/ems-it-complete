import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const API = import.meta.env.VITE_API_URL || 'https://ems-it-complete-2.onrender.com';

export default function Profile() {
  const { user, logout } = useAuth();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/employees').then(list => {
      const me = Array.isArray(list) ? list.find(e => e.email === user?.email) : null;
      if (me) { setEmp(me); setForm({ name: me.name, phone: me.phone||'', designation: me.designation||'', address: me.address||'', bloodGroup: me.bloodGroup||'', skills: (me.skills||[]).join(', '), emergencyName: me.emergencyContact?.name||'', emergencyPhone: me.emergencyContact?.phone||'' }); }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const fd = new FormData();
      Object.keys(form).forEach(k => { if(form[k]) fd.append(k, form[k]); });
      if (photo) fd.append('photo', photo);
      if (emp?._id) {
        const res = await api.putForm(`/employees/${emp._id}`, fd);
        if (res._id) { setEmp(res); setMsg('Profile updated!'); setEditing(false); }
        else setMsg('Update failed: ' + (res.message || 'Error'));
      } else {
        fd.append('name', user.name);
        fd.append('email', user.email);
        fd.append('role', user.role);
        const res = await api.postForm('/employees', fd);
        if (res._id) { setEmp(res); setMsg('Profile created!'); setEditing(false); }
        else setMsg('Create failed: ' + (res.message || 'Error'));
      }
    } catch(e) { setMsg('Error: ' + e.message); }
    setSaving(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const TABS = [
    { id: 'overview', label: '👤 Overview' },
    { id: 'personal', label: '📋 Personal' },
    { id: 'bank', label: '🏦 Bank Details' },
    { id: 'emergency', label: '🚨 Emergency' },
  ];

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', color:'#94a3b8', fontSize:14 }}>⏳ Loading profile...</div>;

  const photoUrl = emp?.photo ? `${API}${emp.photo}?t=${Date.now()}` : null;
  const initials = (emp?.name || user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ptab:hover { background: rgba(99,102,241,0.08) !important; color: #6366f1 !important; }
        .edit-inp:focus { border-color: #6366f1 !important; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81, #4338ca)', borderRadius: 20, padding: '36px 36px 80px', marginBottom: -60, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize:'32px 32px' }} />
        <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <h1 style={{ color:'#fff', fontSize:24, fontWeight:800, marginBottom:4 }}>My Profile</h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>Manage your personal information</p>
          </div>
          <span style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'#c7d2fe', padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:600, textTransform:'uppercase' }}>
            {user?.role}
          </span>
        </div>
      </div>

      <div style={{ background:'#fff', borderRadius:20, margin:'0 24px', padding:'24px 28px', boxShadow:'0 4px 24px rgba(0,0,0,0.08)', position:'relative', zIndex:1, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:20 }}>
          <div style={{ position:'relative', flexShrink:0 }}>
            <div style={{ width:90, height:90, borderRadius:'50%', border:'4px solid #fff', boxShadow:'0 4px 16px rgba(0,0,0,0.12)', overflow:'hidden', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {photoUrl
                ? <img src={photoUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="profile" />
                : <span style={{ fontSize:28, fontWeight:800, color:'#fff' }}>{initials}</span>
              }
            </div>
            {editing && (
              <label style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'#6366f1', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13, boxShadow:'0 2px 8px rgba(99,102,241,0.4)' }}>
                📷
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} style={{ display:'none' }} />
              </label>
            )}
          </div>

          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:22, fontWeight:800, color:'#0f172a', marginBottom:4 }}>{emp?.name || user?.name}</h2>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:8 }}>{emp?.designation || emp?.role || user?.role || 'Employee'}</p>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {emp?.employeeCode && emp?.role !== 'admin' && <span style={badge('#ede9fe','#6366f1')}>{emp.employeeCode}</span>}
              <span style={badge(emp?.status==='active'?'#dcfce7':'#fee2e2', emp?.status==='active'?'#16a34a':'#dc2626')}>● {emp?.status || 'Active'}</span>
              {emp?.joiningDate && <span style={badge('#f1f5f9','#64748b')}>Joined {new Date(emp.joiningDate).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</span>}
            </div>
          </div>

          <div style={{ display:'flex', gap:10 }}>
            {msg && <span style={{ fontSize:12, color:'#16a34a', background:'#dcfce7', padding:'6px 12px', borderRadius:8, fontWeight:600 }}>✓ {msg}</span>}
            {editing
              ? <>
                  <button onClick={() => setEditing(false)} style={ghostBtn}>Cancel</button>
                  <button onClick={save} disabled={saving} style={primaryBtn}>{saving ? 'Saving...' : '💾 Save'}</button>
                </>
              : <button onClick={() => setEditing(true)} style={primaryBtn}>✏️ Edit Profile</button>
            }
          </div>
        </div>
      </div>

      {emp && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { icon:'💰', label:'Monthly Salary', value: emp.salary ? `₹${Number(emp.salary).toLocaleString()}` : '—', color:'#6366f1' },
            { icon:'📧', label:'Email', value: emp.email, color:'#3b82f6' },
            { icon:'📱', label:'Phone', value: emp.phone || '—', color:'#10b981' },
            { icon:'🩸', label:'Blood Group', value: emp.bloodGroup || '—', color:'#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.07)', borderLeft:`4px solid ${s.color}` }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:11, color:'#94a3b8', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background:'#fff', borderRadius:20, boxShadow:'0 1px 4px rgba(0,0,0,0.07)', overflow:'hidden' }}>
        <div style={{ display:'flex', borderBottom:'1px solid #f1f5f9', padding:'0 8px' }}>
          {TABS.map(t => (
            <button key={t.id} className="ptab" onClick={() => setTab(t.id)}
              style={{ padding:'14px 18px', border:'none', background:'transparent', fontSize:13, fontWeight:600, cursor:'pointer', borderBottom: tab===t.id ? '2px solid #6366f1' : '2px solid transparent', color: tab===t.id ? '#6366f1' : '#94a3b8', transition:'all 0.15s', whiteSpace:'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding:28, animation:'fadeIn 0.3s ease' }}>
          {tab === 'overview' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <Section title="Work Information">
                <Row label="Employee Code" value={emp?.employeeCode} />
                <Row label="Designation" value={emp?.designation} edit={editing} field="designation" form={form} setForm={setForm} />
                <Row label="Department" value={emp?.department?.name} />
                <Row label="Role" value={emp?.role} />
                <Row label="Status" value={emp?.status} />
                <Row label="Joining Date" value={emp?.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN') : '—'} />
              </Section>
              <Section title="Skills & Expertise">
                {editing
                  ? <div>
                      <label style={lbl}>Skills (comma separated)</label>
                      <input className="edit-inp" style={inp} value={form.skills} onChange={e => setForm({...form, skills:e.target.value})} placeholder="React, Node.js, MongoDB" />
                    </div>
                  : <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:8 }}>
                      {(emp?.skills||[]).length > 0
                        ? emp.skills.map(s => <span key={s} style={badge('#ede9fe','#6366f1')}>{s}</span>)
                        : <span style={{ color:'#94a3b8', fontSize:13 }}>No skills added yet</span>
                      }
                    </div>
                }
              </Section>
            </div>
          )}

          {tab === 'personal' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              <Section title="Contact Details">
                <Row label="Email" value={emp?.email} />
                <Row label="Phone" value={emp?.phone} edit={editing} field="phone" form={form} setForm={setForm} placeholder="+91 98765 43210" />
                <Row label="Address" value={emp?.address} edit={editing} field="address" form={form} setForm={setForm} placeholder="Your address" />
              </Section>
              <Section title="Physical Details">
                <Row label="Blood Group" value={emp?.bloodGroup} edit={editing} field="bloodGroup" form={form} setForm={setForm} placeholder="O+" />
                {editing && (
                  <div style={{ marginTop:16 }}>
                    <label style={lbl}>Profile Photo</label>
                    <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])}
                      style={{ width:'100%', fontSize:13, border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 10px' }} />
                  </div>
                )}
              </Section>
            </div>
          )}

          {tab === 'bank' && (
            <div style={{ maxWidth:500 }}>
              <div style={{ background:'#f8fafc', borderRadius:12, padding:20, border:'1px solid #e2e8f0' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#0f172a', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>🏦 Bank Account Details</div>
                <Row label="Account Number" value={emp?.bankDetails?.accountNo || '—'} />
                <Row label="IFSC Code" value={emp?.bankDetails?.ifsc || '—'} />
                <Row label="Bank Name" value={emp?.bankDetails?.bankName || '—'} />
                {!emp?.bankDetails?.accountNo && <p style={{ color:'#94a3b8', fontSize:13, marginTop:12 }}>Bank details not added. Contact HR to update.</p>}
              </div>
            </div>
          )}

          {tab === 'emergency' && (
            <div style={{ maxWidth:500 }}>
              <Section title="Emergency Contact">
                <Row label="Contact Name" value={emp?.emergencyContact?.name} edit={editing} field="emergencyName" form={form} setForm={setForm} placeholder="Parent / Spouse name" />
                <Row label="Contact Phone" value={emp?.emergencyContact?.phone} edit={editing} field="emergencyPhone" form={form} setForm={setForm} placeholder="+91 98765 43210" />
              </Section>
            </div>
          )}

          {editing && (
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:20, paddingTop:20, borderTop:'1px solid #f1f5f9' }}>
              <button onClick={() => setEditing(false)} style={ghostBtn}>Cancel</button>
              <button onClick={save} disabled={saving} style={primaryBtn}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background:'#f8fafc', borderRadius:12, padding:18, border:'1px solid #e2e8f0' }}>
      <div style={{ fontSize:13, fontWeight:700, color:'#0f172a', marginBottom:14, paddingBottom:10, borderBottom:'1px solid #e2e8f0' }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value, edit, field, form, setForm, placeholder }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ fontSize:11, color:'#94a3b8', fontWeight:500, marginBottom:4 }}>{label}</div>
      {edit && field
        ? <input className="edit-inp" style={inp} value={form[field]||''} onChange={e => setForm({...form, [field]:e.target.value})} placeholder={placeholder||''} />
        : <div style={{ fontSize:13, fontWeight:500, color: value ? '#0f172a' : '#94a3b8' }}>{value || '—'}</div>
      }
    </div>
  );
}

const badge = (bg, color) => ({ background:bg, color, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600 });
const primaryBtn = { padding:'8px 18px', background:'#6366f1', color:'#fff', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' };
const ghostBtn = { padding:'8px 18px', background:'#f1f5f9', color:'#334155', border:'none', borderRadius:9, fontSize:13, fontWeight:600, cursor:'pointer' };
const lbl = { display:'block', fontSize:12, fontWeight:600, color:'#475569', marginBottom:5 };
const inp = { width:'100%', padding:'8px 12px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, fontFamily:'inherit' };