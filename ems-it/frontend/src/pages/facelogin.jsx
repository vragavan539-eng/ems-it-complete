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
    const N = 120;
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

/* ─── Floating 3D Cubes ───────────────────────────────── */
const Cube = ({ style, size = 60, color }) => (
  <div style={{
    position: 'fixed', width: size, height: size,
    transformStyle: 'preserve-3d',
    animation: `floatCube 8s ease-in-out infinite`,
    pointerEvents: 'none', zIndex: 0, ...style,
  }}>
    {['rotateY(0deg) translateZ('+size/2+'px)', 'rotateY(90deg) translateZ('+size/2+'px)',
      'rotateY(180deg) translateZ('+size/2+'px)', 'rotateY(-90deg) translateZ('+size/2+'px)',
      'rotateX(90deg) translateZ('+size/2+'px)', 'rotateX(-90deg) translateZ('+size/2+'px)',
    ].map((t, i) => (
      <div key={i} style={{
        position: 'absolute', inset: 0,
        border: `1px solid ${color}`,
        background: `${color.replace(')', ',0.03)').replace('rgb', 'rgba')}`,
        transform: t,
      }} />
    ))}
  </div>
);

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
  const [backHovered, setBackHovered] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  /* ─── Back Button Handler ─── */
  const handleBack = () => {
    navigate(-1);
  };

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
    <div style={s.page}>
      <style>{css}</style>
      <ParticleCanvas />

      {/* Ambient glow blobs */}
      <div style={s.blob1} /><div style={s.blob2} /><div style={s.blob3} />

      {/* 3D floating cubes */}
      <Cube style={{ top: '8%', left: '5%', animationDelay: '0s', transform: 'rotateX(20deg) rotateY(30deg)' }} size={50} color="rgb(120,80,255)" />
      <Cube style={{ top: '70%', left: '8%', animationDelay: '-3s', transform: 'rotateX(-15deg) rotateY(55deg)' }} size={36} color="rgb(80,200,255)" />
      <Cube style={{ top: '15%', right: '6%', animationDelay: '-5s', transform: 'rotateX(35deg) rotateY(-20deg)' }} size={42} color="rgb(200,80,255)" />
      <Cube style={{ top: '75%', right: '7%', animationDelay: '-1.5s', transform: 'rotateX(-25deg) rotateY(40deg)' }} size={55} color="rgb(80,255,200)" />
      <Cube style={{ top: '45%', left: '2%', animationDelay: '-2s', transform: 'rotateX(10deg) rotateY(70deg)' }} size={28} color="rgb(255,120,80)" />

      {/* Holographic rings */}
      <div style={s.ring1} /><div style={s.ring2} /><div style={s.ring3} />

      {/* ── BACK BUTTON ── */}
      <button
        onClick={handleBack}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        style={{
          ...s.backBtn,
          ...(backHovered ? s.backBtnHover : {}),
        }}
      >
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'transform 0.2s', transform: backHovered ? 'translateX(-3px)' : 'translateX(0)' }}
        >
          <path d="M19 12H5"/>
          <path d="m12 19-7-7 7-7"/>
        </svg>
        Back
      </button>

      {/* Main card */}
      <div style={{ ...s.card, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)', transition: 'all 0.7s cubic-bezier(0.22,1,0.36,1)' }}>

        {/* Holographic top shimmer */}
        <div style={s.shimmer} />

        {/* ── LEFT PANEL ── */}
        <div style={s.left}>
          <div style={s.leftGlow} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={s.logoRow}>
              <div style={s.logoHex}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
              </div>
              <span style={s.logoText}>EMS</span>
              <span style={s.logoBadge}>SECURE</span>
            </div>

            {/* Title */}
            <div style={{ margin: '2.5rem 0 1rem' }}>
              <div style={s.titleTag}>PLATFORM v2.0</div>
              <h1 style={s.heroTitle}>Employee<br/><span style={s.titleAccent}>Management</span><br/>System</h1>
              <div style={s.titleLine} />
            </div>

            {/* Features */}
            <div style={s.features}>
              {[
                { icon: '⚡', label: 'Instant Face Login', desc: 'Sub-second recognition' },
                { icon: '📊', label: 'Real-time Analytics', desc: 'Live workforce insights' },
                { icon: '🔒', label: 'Bank-grade Security', desc: 'AES-256 encryption' },
              ].map((f, i) => (
                <div key={i} style={{ ...s.featureRow, animationDelay: `${0.2 + i * 0.12}s` }}>
                  <div style={s.featureIconBox}><span style={{ fontSize: '0.9rem' }}>{f.icon}</span></div>
                  <div>
                    <div style={s.featureLabel}>{f.label}</div>
                    <div style={s.featureDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={s.stats}>
              {[['99.9%', 'Uptime'], ['0.4s', 'Face Auth'], ['256bit', 'Encryption']].map(([v, l]) => (
                <div key={l} style={s.statBox}>
                  <div style={s.statVal}>{v}</div>
                  <div style={s.statLabel}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <p style={s.leftFooter}>© 2025 EMS Platform · All rights reserved</p>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={s.right}>
          <div style={s.rightInner}>

            {/* Header */}
            <div style={{ marginBottom: '1.8rem' }}>
              <div style={s.welcomeTag}>
                <span style={s.tagDot} />
                SECURE ACCESS PORTAL
              </div>
              <h2 style={s.welcomeTitle}>Welcome back <span style={{ fontSize: '1.2rem' }}>👋</span></h2>
              <p style={s.welcomeSub}>Authenticate to enter your workspace</p>
            </div>

            {/* Mode Tabs */}
            <div style={s.tabs}>
              {['email', 'face'].map(m => (
                <button key={m} style={{ ...s.tab, ...(mode === m ? s.tabOn : s.tabOff) }}
                  onClick={() => { setMode(m); setError(''); setSuccess(''); }}>
                  {m === 'email'
                    ? <><EmailIcon /><span>Email</span></>
                    : <><FaceIcon /><span>Face ID</span></>}
                  {mode === m && <div style={s.tabIndicator} />}
                </button>
              ))}
            </div>

            {/* Alerts */}
            {error && <Alert type="error" msg={error} />}
            {success && <Alert type="success" msg={success} />}

            {/* Email Form */}
            {mode === 'email' && (
              <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Email Address" type="email" icon={<EmailIcon />}
                  value={formData.email} placeholder="you@company.com"
                  focused={focusedField === 'email'}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField('')}
                  onChange={v => setFormData({ ...formData, email: v })} />

                <div style={{ position: 'relative' }}>
                  <Field label="Password" type={showPassword ? 'text' : 'password'} icon={<LockIcon />}
                    value={formData.password} placeholder="••••••••••"
                    focused={focusedField === 'pass'}
                    onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField('')}
                    onChange={v => setFormData({ ...formData, password: v })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                <button type="submit" style={{ ...s.submitBtn, marginTop: '0.4rem' }} disabled={loading}>
                  {loading
                    ? <><Spinner /> Authenticating...</>
                    : <><span>Sign In</span><ArrowIcon /></>}
                  <div style={s.btnGlow} />
                </button>
              </form>
            )}

            {/* Face Mode */}
            {mode === 'face' && (
              <div>
                {loading
                  ? <VerifyingState />
                  : <FaceCapture onFaceDetected={handleFaceDetected} mode="login" />}
              </div>
            )}

            {/* Switch link */}
            <div style={s.switchRow}>
              <div style={s.switchLine} />
              <button onClick={() => { setMode(mode === 'face' ? 'email' : 'face'); setError(''); setSuccess(''); }} style={s.switchBtn}>
                {mode === 'face' ? '← Use Email & Password' : 'Try Face ID Login →'}
              </button>
              <div style={s.switchLine} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ─── Sub-components ──────────────────────────────────── */
const Field = ({ label, type, icon, value, placeholder, focused, onFocus, onBlur, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={s.fieldLabel}>{label}</label>
    <div style={{ ...s.inputWrap, ...(focused ? s.inputWrapFocused : {}) }}>
      <span style={s.inputIcon}>{icon}</span>
      <input type={type} value={value} placeholder={placeholder}
        onFocus={onFocus} onBlur={onBlur}
        onChange={e => onChange(e.target.value)}
        style={s.input} required />
      {focused && <div style={s.inputBeam} />}
    </div>
  </div>
);

const Alert = ({ type, msg }) => (
  <div style={{ ...s.alert, ...(type === 'error' ? s.alertError : s.alertSuccess) }}>
    {type === 'error' ? '⚠' : '✓'} {msg}
  </div>
);

const VerifyingState = () => (
  <div style={s.verifying}>
    <div style={s.verifyOrb}>
      <div style={s.verifyRing1} /><div style={s.verifyRing2} />
      <div style={s.verifyCore}><FaceIcon size={28} color="#a78bfa" /></div>
    </div>
    <p style={{ color: '#a78bfa', fontSize: '0.85rem', marginTop: '0.8rem', letterSpacing: '0.1em' }}>SCANNING IDENTITY…</p>
    <div style={s.scanBar}><div style={s.scanFill} /></div>
  </div>
);

/* ─── Icons ───────────────────────────────────────────── */
const EmailIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
const FaceIcon = ({ size = 13, color = 'currentColor' }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M21 3h-4"/><path d="M21 9V5a2 2 0 0 0-2-2"/><path d="M3 15v4a2 2 0 0 0 2 2h4"/><path d="M15 21h4a2 2 0 0 0 2-2v-4"/><circle cx="12" cy="12" r="3"/></svg>;
const LockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const EyeIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOffIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const ArrowIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
const Spinner = () => <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTop: '2px solid #fff', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />;

/* ─── Styles ──────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh', background: '#07071a',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1.5rem', fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    position: 'relative', overflow: 'hidden', perspective: '1000px',
  },

  /* ── Back Button ── */
  backBtn: {
    position: 'fixed',
    top: '1.5rem',
    left: '1.5rem',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(124,58,237,0.12)',
    border: '1px solid rgba(124,58,237,0.3)',
    borderRadius: 10,
    padding: '8px 16px',
    cursor: 'pointer',
    color: '#a78bfa',
    fontSize: '0.78rem',
    fontWeight: 600,
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    letterSpacing: '0.04em',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
  backBtnHover: {
    background: 'rgba(124,58,237,0.25)',
    border: '1px solid rgba(167,139,250,0.5)',
    transform: 'translateX(-2px)',
    boxShadow: '0 0 16px rgba(124,58,237,0.25)',
  },

  blob1: { position:'fixed', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle,rgba(109,40,217,0.25),transparent 65%)', top:-200, left:-200, animation:'blobDrift 15s ease-in-out infinite', pointerEvents:'none', zIndex:0 },
  blob2: { position:'fixed', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(6,182,212,0.12),transparent 65%)', bottom:-180, right:-180, animation:'blobDrift 18s ease-in-out infinite reverse', pointerEvents:'none', zIndex:0 },
  blob3: { position:'fixed', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(236,72,153,0.1),transparent 65%)', top:'40%', left:'40%', animation:'blobDrift 12s ease-in-out infinite 3s', pointerEvents:'none', zIndex:0 },
  ring1: { position:'fixed', width:700, height:700, borderRadius:'50%', border:'1px solid rgba(130,80,255,0.07)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'ringPulse 6s ease-in-out infinite', pointerEvents:'none', zIndex:0 },
  ring2: { position:'fixed', width:500, height:500, borderRadius:'50%', border:'1px solid rgba(80,200,255,0.06)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'ringPulse 6s ease-in-out infinite 2s', pointerEvents:'none', zIndex:0 },
  ring3: { position:'fixed', width:300, height:300, borderRadius:'50%', border:'1px solid rgba(200,80,255,0.05)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'ringPulse 6s ease-in-out infinite 4s', pointerEvents:'none', zIndex:0 },

  card: {
    display:'flex', width:'100%', maxWidth:860, minHeight:560,
    borderRadius:24, overflow:'hidden', position:'relative', zIndex:1,
    boxShadow:'0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(130,80,255,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
    backdropFilter:'blur(2px)',
  },
  shimmer: {
    position:'absolute', top:0, left:0, right:0, height:1,
    background:'linear-gradient(90deg, transparent, rgba(180,130,255,0.6), rgba(80,220,255,0.6), transparent)',
    animation:'shimmer 3s linear infinite', zIndex:10, pointerEvents:'none',
  },

  left: {
    width:280, flexShrink:0, padding:'2rem 1.75rem',
    background:'linear-gradient(160deg,#1a0a3a 0%,#0f0525 50%,#0a0218 100%)',
    display:'flex', flexDirection:'column', position:'relative', overflow:'hidden',
    borderRight:'1px solid rgba(130,80,255,0.15)',
  },
  leftGlow: { position:'absolute', top:-60, left:-60, width:250, height:250, borderRadius:'50%', background:'radial-gradient(circle,rgba(120,60,255,0.35),transparent 70%)', pointerEvents:'none' },
  logoRow: { display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' },
  logoHex: {
    width:38, height:38, borderRadius:10,
    background:'linear-gradient(135deg,#7c3aed,#6d28d9)',
    display:'flex', alignItems:'center', justifyContent:'center',
    boxShadow:'0 0 20px rgba(124,58,237,0.5)',
  },
  logoText: { color:'#e2d9f3', fontWeight:800, fontSize:'1rem', letterSpacing:'0.12em' },
  logoBadge: { fontSize:'0.55rem', letterSpacing:'0.15em', color:'#7c3aed', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', padding:'2px 7px', borderRadius:4, fontWeight:600 },
  titleTag: { fontSize:'0.6rem', letterSpacing:'0.2em', color:'#6d28d9', fontWeight:600, marginBottom:'0.5rem' },
  heroTitle: { color:'white', fontSize:'1.65rem', fontWeight:800, lineHeight:1.15, letterSpacing:'-0.03em' },
  titleAccent: { background:'linear-gradient(135deg,#a78bfa,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' },
  titleLine: { width:40, height:2, background:'linear-gradient(90deg,#7c3aed,#38bdf8)', borderRadius:2, marginTop:'0.9rem' },
  features: { display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'0.5rem' },
  featureRow: { display:'flex', alignItems:'center', gap:'0.7rem', animation:'fadeUp 0.6s ease both' },
  featureIconBox: { width:32, height:32, borderRadius:8, background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  featureLabel: { color:'rgba(226,217,243,0.9)', fontSize:'0.8rem', fontWeight:600 },
  featureDesc: { color:'rgba(255,255,255,0.35)', fontSize:'0.68rem', marginTop:1 },
  stats: { display:'flex', gap:'0.5rem', marginTop:'1.5rem', borderTop:'1px solid rgba(124,58,237,0.15)', paddingTop:'1rem' },
  statBox: { flex:1, textAlign:'center' },
  statVal: { color:'#a78bfa', fontSize:'0.85rem', fontWeight:700 },
  statLabel: { color:'rgba(255,255,255,0.3)', fontSize:'0.62rem', marginTop:2 },
  leftFooter: { color:'rgba(255,255,255,0.2)', fontSize:'0.65rem', marginTop:'auto', paddingTop:'1rem' },

  right: { flex:1, background:'#0d0d1f', display:'flex', alignItems:'center', justifyContent:'center', padding:'2.5rem 2rem', position:'relative' },
  rightInner: { width:'100%', maxWidth:320 },
  welcomeTag: { display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.58rem', letterSpacing:'0.2em', color:'#7c3aed', fontWeight:600, marginBottom:'0.6rem' },
  tagDot: { width:6, height:6, borderRadius:'50%', background:'#7c3aed', boxShadow:'0 0 8px #7c3aed', display:'inline-block', animation:'tagBlink 1.5s ease-in-out infinite' },
  welcomeTitle: { color:'#f0eeff', fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.03em', display:'flex', alignItems:'center', gap:'0.4rem' },
  welcomeSub: { color:'rgba(255,255,255,0.35)', fontSize:'0.8rem', marginTop:'0.25rem' },

  tabs: { display:'flex', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:4, gap:4, marginBottom:'1.2rem' },
  tab: { flex:1, padding:'0.5rem', border:'none', borderRadius:9, cursor:'pointer', fontSize:'0.8rem', fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', transition:'all 0.25s', position:'relative', overflow:'hidden' },
  tabOn: { background:'linear-gradient(135deg,rgba(124,58,237,0.5),rgba(109,40,217,0.4))', color:'#e2d9f3', boxShadow:'0 2px 12px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.1)', border:'1px solid rgba(124,58,237,0.4)' },
  tabOff: { background:'transparent', color:'rgba(255,255,255,0.35)', border:'1px solid transparent' },
  tabIndicator: { position:'absolute', bottom:0, left:'20%', right:'20%', height:2, background:'linear-gradient(90deg,transparent,#a78bfa,transparent)', borderRadius:1 },

  alert: { display:'flex', alignItems:'center', gap:'0.5rem', borderRadius:10, padding:'0.65rem 0.85rem', marginBottom:'0.9rem', fontSize:'0.78rem', fontWeight:500 },
  alertError: { background:'rgba(239,68,68,0.07)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)' },
  alertSuccess: { background:'rgba(16,185,129,0.07)', color:'#34d399', border:'1px solid rgba(16,185,129,0.2)' },

  fieldLabel: { color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', fontWeight:500, letterSpacing:'0.05em' },
  inputWrap: { position:'relative', borderRadius:11, border:'1.5px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', transition:'all 0.25s', overflow:'hidden' },
  inputWrapFocused: { border:'1.5px solid rgba(124,58,237,0.6)', background:'rgba(124,58,237,0.06)', boxShadow:'0 0 0 3px rgba(124,58,237,0.12), 0 0 20px rgba(124,58,237,0.08)' },
  inputIcon: { position:'absolute', left:'0.85rem', top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.25)', pointerEvents:'none', display:'flex' },
  input: { width:'100%', boxSizing:'border-box', padding:'0.72rem 0.85rem 0.72rem 2.5rem', background:'transparent', border:'none', outline:'none', color:'#f0eeff', fontSize:'0.88rem', fontFamily:'inherit' },
  inputBeam: { position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#a78bfa,#38bdf8,transparent)', animation:'beamSlide 1.5s linear infinite' },
  eyeBtn: { position:'absolute', right:'0.8rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', alignItems:'center', color:'rgba(255,255,255,0.35)' },

  submitBtn: {
    width:'100%', padding:'0.8rem',
    background:'linear-gradient(135deg,#7c3aed 0%,#6d28d9 50%,#5b21b6 100%)',
    color:'white', border:'none', borderRadius:12, fontSize:'0.9rem', fontWeight:700,
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
    letterSpacing:'0.03em', position:'relative', overflow:'hidden',
    boxShadow:'0 6px 24px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
    transition:'transform 0.15s, box-shadow 0.15s',
  },
  btnGlow: { position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(255,255,255,0.08),transparent)', pointerEvents:'none' },

  switchRow: { display:'flex', alignItems:'center', gap:'0.75rem', marginTop:'1.3rem' },
  switchLine: { flex:1, height:1, background:'rgba(255,255,255,0.06)' },
  switchBtn: { background:'none', border:'none', color:'#7c3aed', fontSize:'0.75rem', cursor:'pointer', fontWeight:600, letterSpacing:'0.02em', whiteSpace:'nowrap', padding:0 },

  verifying: { display:'flex', flexDirection:'column', alignItems:'center', padding:'1.5rem 0' },
  verifyOrb: { position:'relative', width:80, height:80, display:'flex', alignItems:'center', justifyContent:'center' },
  verifyRing1: { position:'absolute', inset:0, borderRadius:'50%', border:'1.5px solid rgba(167,139,250,0.4)', animation:'verifyPulse 1.5s ease-out infinite' },
  verifyRing2: { position:'absolute', inset:-15, borderRadius:'50%', border:'1px solid rgba(167,139,250,0.2)', animation:'verifyPulse 1.5s ease-out infinite 0.5s' },
  verifyCore: { width:60, height:60, borderRadius:'50%', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(167,139,250,0.3)', display:'flex', alignItems:'center', justifyContent:'center' },
  scanBar: { width:120, height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, marginTop:'0.8rem', overflow:'hidden' },
  scanFill: { height:'100%', background:'linear-gradient(90deg,transparent,#a78bfa,#38bdf8,transparent)', animation:'scanMove 1.8s ease-in-out infinite', borderRadius:2 },
};

/* ─── Keyframes ───────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes blobDrift { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,-25px) scale(1.07)} }
  @keyframes ringPulse { 0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1)} 50%{opacity:0.4;transform:translate(-50%,-50%) scale(1.04)} }
  @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes floatCube { 0%,100%{transform:translateY(0) rotateX(20deg) rotateY(30deg)} 50%{transform:translateY(-20px) rotateX(40deg) rotateY(70deg)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes tagBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes beamSlide { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  @keyframes verifyPulse { 0%{transform:scale(1);opacity:0.7} 100%{transform:scale(1.6);opacity:0} }
  @keyframes scanMove { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
  input::placeholder { color: rgba(255,255,255,0.2); }
  input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0d0d1f inset !important; -webkit-text-fill-color: #f0eeff !important; }
  button { transition: transform 0.15s, opacity 0.15s; }
  button:hover:not(:disabled) { transform: translateY(-1px); }
  button:active:not(:disabled) { transform: translateY(0); }
`;

export default FaceLogin;