import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const NAV_ALL = [
  { to: '/dashboard',               icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>, label: 'Dashboard' },
  { to: '/dashboard/employees',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>, label: 'Employees', adminOnly: true },
  { to: '/dashboard/departments',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Departments', adminOnly: true },
  { to: '/dashboard/roles',         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'Roles & Access', adminOnly: true },
  { to: '/dashboard/payroll',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, label: 'Payroll', adminOnly: true },
  { to: '/dashboard/leave',         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>, label: 'Leave' },
  { to: '/dashboard/attendance',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Attendance' },
  { to: '/dashboard/performance',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, label: 'Performance' },
  { to: '/dashboard/projects',      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label: 'Projects' },
  { to: '/dashboard/assets',        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, label: 'Assets' },
  { to: '/dashboard/training',      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, label: 'Training' },
  { to: '/dashboard/documents',     icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, label: 'Documents' },
  { to: '/dashboard/announcements', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, label: 'Announcements' },
  { to: '/dashboard/tickets',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/></svg>, label: 'IT Helpdesk' },
  { to: '/dashboard/reports',       icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, label: 'Reports', adminOnly: true },
  { to: '/dashboard/feedback',      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label: 'Feedback', adminOnly: true },
];

const IcoBolt = ({ c = 'currentColor', s = 18 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IcoLogout = ({ c = 'currentColor', s = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IcoWave = ({ c = 'currentColor', s = 16 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" width={s} height={s}>
    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
    <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </svg>
);

const HamburgerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const NAV = NAV_ALL.filter(n => {
    if (n.adminOnly) return isAdmin;
    if (n.employeeOnly) return !isAdmin;
    return true;
  });

  const handleLogout = () => { logout(); navigate('/'); };
  const closeMobile = () => setMobileOpen(false);

  const SidebarContent = () => (
    <>
      <div style={s.logo}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <IcoBolt c="#fff" s={15} />
        </div>
        {(!collapsed || isMobile) && <span style={s.logoText}>TechEMS</span>}
        {!isMobile && (
          <button style={s.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
            }
          </button>
        )}
        {isMobile && (
          <button style={{ ...s.collapseBtn, marginLeft: 'auto' }} onClick={closeMobile}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      <nav style={s.nav}>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/dashboard'}
            onClick={isMobile ? closeMobile : undefined}
            style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}
          >
            <span style={{ display: 'flex', alignItems: 'center', minWidth: 22, justifyContent: 'center' }}>{icon}</span>
            {(!collapsed || isMobile) && <span style={s.navLabel}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid #1e293b' }}>
        <NavLink
          to="/dashboard/profile"
          onClick={isMobile ? closeMobile : undefined}
          style={({ isActive }) => ({ ...s.navItem, margin: '4px 8px', ...(isActive ? s.navActive : {}) })}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          {(!collapsed || isMobile) && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#f1f5f9', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: '#64748b', fontSize: 10, textTransform: 'capitalize' }}>{user?.role} · View Profile</div>
            </div>
          )}
        </NavLink>

        <button onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: 'none', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer', width: '100%', marginBottom: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', minWidth: 22, justifyContent: 'center' }}>
            <IcoLogout c="#64748b" s={16} />
          </span>
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          onClick={closeMobile}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
        />
      )}

      {/* Sidebar — desktop */}
      {!isMobile && (
        <aside style={{ ...s.sidebar, width: collapsed ? 64 : 240 }}>
          <SidebarContent />
        </aside>
      )}

      {/* Sidebar — mobile drawer */}
      {isMobile && (
        <aside style={{
          ...s.sidebar,
          width: 260,
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 999,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        }}>
          <SidebarContent />
        </aside>
      )}

      {/* Main content */}
      <main style={{ ...s.main, width: isMobile ? '100%' : undefined }}>
        <div style={s.topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1e293b', padding: 4 }}
              >
                <HamburgerIcon />
              </button>
            )}
            <div style={{ color: '#1e293b', fontWeight: 600, fontSize: isMobile ? 13 : 15, display: 'flex', alignItems: 'center', gap: 6 }}>
              {isMobile ? user?.name : `Welcome back, ${user?.name}`}
              <IcoWave c="#f59e0b" s={16} />
            </div>
          </div>
          <div style={s.topbarRight}>
            <span style={s.roleBadge}>{user?.role?.toUpperCase()}</span>
            <NavLink to="/dashboard/profile" style={{ textDecoration: 'none' }} onClick={isMobile ? closeMobile : undefined}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </NavLink>
          </div>
        </div>
        <div style={{ ...s.content, padding: isMobile ? '16px' : '24px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const s = {
  sidebar:     { background: '#0f172a', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },
  logo:        { display: 'flex', alignItems: 'center', gap: 10, padding: '18px 14px', borderBottom: '1px solid #1e293b' },
  logoText:    { color: '#f1f5f9', fontWeight: 800, fontSize: 18, flex: 1 },
  collapseBtn: { background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', marginLeft: 'auto', cursor: 'pointer', padding: 4 },
  nav:         { flex: 1, overflowY: 'auto', padding: '8px 0' },
  navItem:     { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', color: '#94a3b8', fontSize: 13, fontWeight: 500, borderRadius: 8, margin: '1px 8px', transition: 'all 0.15s', textDecoration: 'none' },
  navActive:   { background: '#6366f1', color: '#fff' },
  navLabel:    { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  main:        { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topbar:      { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 },
  topbarRight: { display: 'flex', gap: 10, alignItems: 'center' },
  roleBadge:   { background: '#ede9fe', color: '#6366f1', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  content:     { flex: 1, overflowY: 'auto' },
};