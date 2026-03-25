import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Hospital, User, Droplet, Shield, Activity, Radio, Phone, MapPin } from 'lucide-react';

// ── CONFIG ──────────────────────────────────────────────────
const ROLE_REDIRECTS: Record<string, string> = {
  HOSPITAL_ADMIN: '/hospital/dashboard',
  DONOR: '/donor/dashboard',
};

const PANEL_STATS = [
  { label: 'City Units', value: '12,161', color: '#10B981' },
  { label: 'Active Requests', value: '84', color: '#DC2626' },
  { label: 'Lives Impacted', value: '3,210', color: '#06B6D4' },
];

/* ─── LEFT PANEL COMPONENT ────────────────────────────────── */
function LeftPanel() {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ background: '#060912', padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC2626' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#F0F4FF', letterSpacing: '0.02em' }}>
            Hemo<span style={{ color: '#DC2626' }}>Globe</span>
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D3748', letterSpacing: '0.3em', marginBottom: 56 }}>AI-DRIVEN LOGISTICS</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 600, color: '#F0F4FF', letterSpacing: '0.1em', marginBottom: 4 }}>{time}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D3748', letterSpacing: '0.25em', marginBottom: 48 }}>NETWORK TIME</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {PANEL_STATS.map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4B5568' }}>{s.label}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gridTemplateColumns: '1fr 1fr', gap: 12, flexWrap: 'wrap' }}>
          {[{ icon: <Shield size={12} color="#4B5568" />, label: 'JWT Secured' }, { icon: <Activity size={12} color="#4B5568" />, label: 'Audit Logged' }].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>{b.icon}<span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D3748' }}>{b.label}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN LOGIN PAGE ────────────────────────────────────── */
export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States matching your Database Schema
  const [hfid, setHfid] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/register';
    const payload = isLogin 
      ? { hfid, password } 
      : { name, hfid, password, address, contact };

    try {
const BASE_URL = "https://tricity-blood-network.onrender.com/"; 

const response = await fetch(`${BASE_URL}${endpoint}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

      const data = await response.json();

      if (response.ok) {
        // 🔥 SAVE THE ID TO PERSIST SESSION
        localStorage.setItem('loggedInHospitalId', data.hospitalId);
        navigate('/hospital/dashboard');
      } else {
        setError(data.message || 'Authentication failed. Check your ID/Password.');
      }
    } catch (err) {
      setError('Cannot reach server. Ensure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: '100vh', background: '#FAFAFA' }}>
      <LeftPanel />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 24, right: 40 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', letterSpacing: '0.15em' }}>
            <ArrowLeft size={14} /> BACK
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, color: '#0A0F1E', marginBottom: 8 }}>
              {isLogin ? 'Network Sign-In' : 'Emergency Registration'}
            </h2>
            <p style={{ fontSize: 14, color: '#64748B' }}>
              {isLogin ? 'Access your personalized dashboard.' : 'Enter facility details to broadcast SOS immediately.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence>
              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                  <FormField label="Hospital / Facility Name">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. GMCH-32" style={inputStyle} required />
                  </FormField>
                  <FormField label="Physical Address">
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Sector, City" style={inputStyle} required />
                  </FormField>
                  <FormField label="Emergency Contact">
                    <input type="tel" value={contact} onChange={e => setContact(e.target.value)} placeholder="+91 XXXXX XXXXX" style={inputStyle} required />
                  </FormField>
                </motion.div>
              )}
            </AnimatePresence>

            <FormField label="Healthcare ID (HFID)">
              <input type="text" value={hfid} onChange={e => setHfid(e.target.value)} placeholder="CH-1200-XXXX" required style={inputStyle} />
            </FormField>

            <FormField label="Access Password">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••" required style={inputStyle} />
            </FormField>

            {error && <div style={{ fontSize: 10, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', border: '1px solid #FECACA', marginBottom: 12 }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px 0', background: '#0A0F1E', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'SYNCING...' : isLogin ? 'ENTER DASHBOARD' : 'REGISTER & START SOS'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#64748B' }}>
              {isLogin ? "New Emergency? " : "Existing Node? "}
              <span style={{ color: '#DC2626', fontWeight: 600, textDecoration: 'underline' }}>
                {isLogin ? 'Register Facility' : 'Sign In'}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', background: '#fff', border: '1px solid #E2E8F0', fontSize: 13, color: '#0A0F1E', outline: 'none'
};