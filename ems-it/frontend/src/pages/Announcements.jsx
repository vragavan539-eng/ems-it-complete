import { useState, useEffect } from 'react';
import { PageHeader, Btn, Modal, Input, Select, Loader, Badge } from '../components/UI';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const TYPE_COLORS = { general:'#6366f1', holiday:'#22c55e', policy:'#3b82f6', event:'#f59e0b', alert:'#ef4444' };

export default function Announcements() {
  const { isAdmin, isHR } = useAuth();
  const canManage = isAdmin || isHR; // ✅ Admin/HR மட்டும் manage செய்யலாம்

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ title:'', content:'', type:'general', priority:'medium', isPinned:false });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    const d = await api.get('/announcements');
    setList(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.content) return alert('Title and content required');
    if (editId) await api.put(`/announcements/${editId}`, form);
    else await api.post('/announcements', form);
    setShow(false);
    setEditId(null);
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        title="📢 Announcements"
        subtitle="Company-wide communications"
        action={
          // ✅ "New Announcement" button: Admin/HR மட்டும்
          canManage ? (
            <Btn onClick={() => {
              setShow(true);
              setEditId(null);
              setForm({ title:'', content:'', type:'general', priority:'medium', isPinned:false });
            }}>
              + New Announcement
            </Btn>
          ) : null
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No announcements yet
          </div>
        )}
        {list.map(a => (
          <div key={a._id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${TYPE_COLORS[a.type] || '#6366f1'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {a.isPinned && <span title="Pinned">📌</span>}
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{a.title}</h3>
                <Badge label={a.type} color={TYPE_COLORS[a.type]} />
                <Badge label={a.priority} color={{ low:'#22c55e', medium:'#f59e0b', high:'#ef4444' }[a.priority]} />
              </div>

              {/* ✅ Edit/Delete buttons: Admin/HR மட்டும் */}
              {canManage && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <Btn size="sm" variant="outline" onClick={() => {
                    setForm({ title:a.title, content:a.content, type:a.type, priority:a.priority, isPinned:a.isPinned });
                    setEditId(a._id);
                    setShow(true);
                  }}>Edit</Btn>
                  <Btn size="sm" variant="danger" onClick={() => del(a._id)}>Del</Btn>
                </div>
              )}
            </div>
            <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>{a.content}</p>
            <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>
              Posted by {a.postedBy?.name || 'Admin'} · {new Date(a.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ New/Edit Modal: Admin/HR மட்டும் */}
      {canManage && (
        <Modal show={show} onClose={() => setShow(false)} title={editId ? 'Edit Announcement' : 'New Announcement'} width={560}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Announcement title" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                options={['general','holiday','policy','event','alert'].map(t => ({ value:t, label: t.charAt(0).toUpperCase()+t.slice(1) }))} />
              <Select label="Priority" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                options={['low','medium','high'].map(p => ({ value:p, label: p.charAt(0).toUpperCase()+p.slice(1) }))} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Content *</label>
              <textarea rows={4} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }}
                value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Announcement content..." />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="pin" checked={form.isPinned} onChange={e => setForm({...form, isPinned: e.target.checked})} />
              <label htmlFor="pin" style={{ fontSize: 13, fontWeight: 500 }}>📌 Pin this announcement</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={() => setShow(false)}>Cancel</Btn>
            <Btn onClick={save}>{editId ? 'Update' : 'Post'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}