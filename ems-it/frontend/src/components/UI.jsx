// Shared reusable UI components

export function Card({ children, style }) {
  return <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', ...style }}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{title}</h2>
        {subtitle && <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style }) {
  const colors = {
    primary:  { bg: '#6366f1', color: '#fff', border: 'none' },
    success:  { bg: '#22c55e', color: '#fff', border: 'none' },
    danger:   { bg: '#ef4444', color: '#fff', border: 'none' },
    warning:  { bg: '#f59e0b', color: '#fff', border: 'none' },
    outline:  { bg: 'transparent', color: '#6366f1', border: '1px solid #6366f1' },
    ghost:    { bg: '#f1f5f9', color: '#334155', border: 'none' },
  };
  const sizes = { sm: '5px 10px', md: '8px 16px', lg: '11px 22px' };
  const c = colors[variant] || colors.primary;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: c.bg, color: c.color, border: c.border,
      padding: sizes[size], borderRadius: 8, fontWeight: 600,
      fontSize: size === 'sm' ? 12 : 13, opacity: disabled ? 0.6 : 1, ...style
    }}>{children}</button>
  );
}

export function Badge({ label, color = '#6366f1', bg }) {
  return (
    <span style={{
      background: bg || color + '18', color, padding: '3px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap'
    }}>{label}</span>
  );
}

export function Input({ label, value, onChange, type = 'text', placeholder, required, name, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}{required && ' *'}</label>}
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, ...style }}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options = [], name, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>{label}{required && ' *'}</label>}
      <select name={name} value={value} onChange={onChange} required={required}
        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff' }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Modal({ show, onClose, title, children, width = 520 }) {
  if (!show) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 16 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

export function Table({ columns, data, emptyMsg = 'No data found' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {columns.map(c => (
              <th key={c.key} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0
            ? <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>{emptyMsg}</td></tr>
            : data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                {columns.map(c => (
                  <td key={c.key} style={{ padding: '10px 14px', color: '#334155', ...c.style }}>
                    {c.render ? c.render(row) : row[c.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({ icon, label, value, color = '#6366f1', sub }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
        </div>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
    </div>
  );
}

export function Loader() {
  return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: 14 }}>⏳ Loading...</div>;
}

export function statusColor(status) {
  const map = {
    active: '#22c55e', inactive: '#94a3b8', resigned: '#ef4444',
    pending: '#f59e0b', approved: '#22c55e', rejected: '#ef4444',
    paid: '#22c55e', failed: '#ef4444',
    open: '#3b82f6', 'in-progress': '#f59e0b', resolved: '#22c55e', closed: '#94a3b8',
    planning: '#94a3b8', completed: '#22c55e', 'on-hold': '#f59e0b', cancelled: '#ef4444',
    present: '#22c55e', absent: '#ef4444', 'half-day': '#f59e0b', late: '#f97316',
    upcoming: '#3b82f6', ongoing: '#6366f1',
    available: '#22c55e', assigned: '#6366f1', maintenance: '#f59e0b', retired: '#94a3b8',
    draft: '#94a3b8', submitted: '#3b82f6', acknowledged: '#22c55e',
  };
  return map[status] || '#64748b';
}
