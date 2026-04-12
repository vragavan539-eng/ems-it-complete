import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceCapture from '../components/face-recognition/FaceCapture';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://ems-it-complete-2.onrender.com';

/* ─── Particle Canvas ─────────────────────────────────── */
const ParticleCanvas = () => {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    const N = 80;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.4,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(100,80,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(130,100,255,${0.18 * (1 - d / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
        g.addColorStop(0, 'rgba(180,150,255,0.9)');
        g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

/* ─── Main Component ──────────────────────────────────── */
const FaceLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      if (res.data.token) {
        login(res.data.user, res.data.token);
        setSuccess(`Welcome, ${res.data.user.name}!`);
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const handleFaceDetected = async (faceData) => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      fd.append('faceImage', faceData.faceImage);
      fd.append('faceDescriptor', JSON.stringify(faceData.faceDescriptor));
      const res = await axios.post(`${API_URL}/api/face/verify-login`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data.success && res.data.token) {
        login(res.data.user, res.data.token);
        setSuccess(`Welcome, ${res.data.user.name}!`);
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setError(res.data.message || 'Face not recognized. Try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Face not recognized. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#07071a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1rem' : '1.5rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <style>{css}</style>
      <ParticleCanvas />

      {/* Blobs */}
      <div style={{ position:'fixed', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(109,40,217,0.25),transparent 65%)', top:-200, left:-200, pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(6,182,212,0.12),transparent 65%)', bottom:-180, right:-180, pointerEvents:'none', zIndex:0 }} />

      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', color: '#a78bfa', fontSize: '0.78rem', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        Back
      </button>

      {/* Main card */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        maxWidth: isMobile ? 420 : 860,
        minHeight: isMobile ? 'auto' : 560,
        borderRadius: 24,
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(130,80,255,0.2)',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)',
        marginTop: isMobile ? '3.5rem' : '0',
      }}>

        {/* LEFT PANEL — mobile-ல் compact */}
        {!isMobile && (
          <div style={{ width: 280, flexShrink: 0, padding: '2rem 1.75rem', background: 'linear-gradient(160deg,#1a0a3a 0%,#0f0525 50%,#0a0218 100%)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', borderRight: '1px solid rgba(130,80,255,0.15)' }}>
            <div style={{ position: 'absolute', top: -60, left: -60, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle,rgba(120,60,255,0.35),transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <span style={{ color: '#e2d9f3', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.12em' }}>EMS</span>
                <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: '#7c3aed', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>SECURE</span>
              </div>
              <div style={{ margin: '2.5rem 0 1rem' }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#6d28d9', fontWeight: 600, marginBottom: '0.5rem' }}>PLATFORM v2.0</div>
                <h1 style={{ color: 'white', fontSize: '1.65rem', fontWeight: 800, lineHeight: 1.15 }}>Employee<br/><span style={{ background: 'linear-gradient(135deg,#a78bfa,#38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Management</span><br/>System</h1>
                <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg,#7c3aed,#38bdf8)', borderRadius: 2, marginTop: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[{ icon: '⚡', label: 'Instant Face Login', desc: 'Sub-second recognition' }, { icon: '📊', label: 'Real-time Analytics', desc: 'Live workforce insights' }, { icon: '🔒', label: 'Bank-grade Security', desc: 'AES-256 encryption' }].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.9rem' }}>{f.icon}</span>
                    </div>
                    <div>
                      <div style={{ color: 'rgba(226,217,243,0.9)', fontSize: '0.8rem', fontWeight: 600 }}>{f.label}</div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', borderTop: '1px solid rgba(124,58,237,0.15)', paddingTop: '1rem' }}>
                {[['99.9%', 'Uptime'], ['0.4s', 'Face Auth'], ['256bit', 'Encryption']].map(([v, l]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 700 }}>{v}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.62rem', marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', marginTop: 'auto', paddingTop: '1rem' }}>© 2025 EMS Platform · All rights reserved</p>
          </div>
        )}

        {/* Mobile top header */}
        {isMobile && (
          <div style={{ background: 'linear-gradient(135deg,#1a0a3a,#0f0525)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(130,80,255,0.15)' }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </div>
            <span style={{ color: '#e2d9f3', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.1em' }}>EMS</span>
            <span style={{ fontSize: '0.55rem', letterSpacing: '0.15em', color: '#7c3aed', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>SECURE</span>
          </div>
        )}

        {/* RIGHT PANEL */}
        <div style={{ flex: 1, background: '#0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1.5rem' : '2.5rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: 320 }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.58rem', letterSpacing: '0.2em', color: '#7c3aed', fontWeight: 600, marginBottom: '0.6rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px #7c3aed', display: 'inline-block', animation: 'tagBlink 1.5s ease-in-out infinite' }} />
                SECURE ACCESS PORTAL
              </div>
              <h2 style={{ color: '#f0eeff', fontSize: isMobile ? '1.3rem' : '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Welcome back 👋</h2>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Authenticate to enter your workspace</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 4, gap: 4, marginBottom: '1.2rem' }}>
              {['email', 'face'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  style={{ flex: 1, padding: '0.5rem', border: mode === m ? '1px solid rgba(124,58,237,0.4)' : '1px solid transparent', borderRadius: 9, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: mode === m ? 'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(109,40,217,0.4))' : 'transparent', color: mode === m ? '#e2d9f3' : 'rgba(255,255,255,0.35)' }}>
                  {m === 'email' ? <><EmailIcon /><span>Email</span></> : <><FaceIcon /><span>Face ID</span></>}
                </button>
              ))}
            </div>

            {error && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 10, padding: '0.65rem 0.85rem', marginBottom: '0.9rem', fontSize: '0.78rem', fontWeight: 500, background: 'rgba(239,68,68,0.07)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>⚠ {error}</div>}
            {success && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: 10, padding: '0.65rem 0.85rem', marginBottom: '0.9rem', fontSize: '0.78rem', fontWeight: 500, background: 'rgba(16,185,129,0.07)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>✓ {success}</div>}

            {mode === 'email' && (
              <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Email Address" type="email" icon={<EmailIcon />} value={formData.email} placeholder="you@company.com" name="email" autoComplete="email" focused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')} onChange={v => setFormData({ ...formData, email: v })} />
                <div style={{ position: 'relative' }}>
                  <Field label="Password" type={showPassword ? 'text' : 'password'} icon={<LockIcon />} value={formData.password} placeholder="••••••••••" name="password" autoComplete="current-password" focused={focusedField === 'pass'} onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField('')} onChange={v => setFormData({ ...formData, password: v })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.8rem', top: '65%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', color: 'white', border: 'none', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 6px 24px rgba(124,58,237,0.45)', marginTop: '0.4rem' }}>
                  {loading ? <><Spinner /> Authenticating...</> : <><span>Sign In</span><ArrowIcon /></>}
                </button>
              </form>
            )}

            {mode === 'face' && (
              <div>{loading ? <VerifyingState /> : <FaceCapture onFaceDetected={handleFaceDetected} mode="login" />}</div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.3rem' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <button onClick={() => { setMode(mode === 'face' ? 'email' : 'face'); setError(''); setSuccess(''); }} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap', padding: 0 }}>
                {mode === 'face' ? '← Use Email & Password' : 'Try Face ID Login →'}
              </button>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, type, icon, value, placeholder, focused, onFocus, onBlur, onChange, name, autoComplete }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.05em' }}>{label}</label>
    <div style={{ position: 'relative', borderRadius: 11, border: focused ? '1.5px solid rgba(124,58,237,0.6)' : '1.5px solid rgba(255,255,255,0.07)', background: focused ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.03)', transition: 'all 0.25s', overflow: 'hidden' }}>
      <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none', display: 'flex' }}>{icon}</span>
      <input type={type} value={value} placeholder={placeholder} name={name} autoComplete={autoComplete} onFocus={onFocus} onBlur={onBlur} onChange={e => onChange(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '0.72rem 0.85rem 0.72rem 2.5rem', background: 'transparent', border: 'none', outline: 'none', color: '#f0eeff', fontSize: '0.88rem', fontFamily: 'inherit' }} required />
    </div>
  </div>
);

const VerifyingState = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0' }}>
    <div style={{ position: 'relative', width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid rgba(167,139,250,0.4)', animation: 'verifyPulse 1.5s ease-out infinite' }} />
      <div style={{ position: 'absolute', inset: -15, borderRadius: '50%', border: '1px solid rgba(167,139,250,0.2)', animation: 'verifyPulse 1.5s ease-out infinite 0.5s' }} />
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FaceIcon size={28} color="#a78bfa" />
      </div>
    </div>
    <p style={{ color: '#a78bfa', fontSize: '0.85rem', marginTop: '0.8rem', letterSpacing: '0.1em' }}>SCANNING IDENTITY…</p>
  </div>
);

const EmailIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const FaceIcon = ({ size = 13, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M21 3h-4"/><path d="M21 9V5a2 2 0 0 0-2-2"/><path d="M3 15v4a2 2 0 0 0 2 2h4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/><circle cx="12" cy="12" r="3"/></svg>;
const LockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const EyeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const ArrowIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const Spinner = () => <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTop: '2px solid #fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes tagBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes verifyPulse { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(1.6);opacity:0} }
  input::placeholder { color: rgba(255,255,255,0.2); }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0d0d1f inset !important; -webkit-text-fill-color: #f0eeff !important; }
`;

export default FaceLogin;