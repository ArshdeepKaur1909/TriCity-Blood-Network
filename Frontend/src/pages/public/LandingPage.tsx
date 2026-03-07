import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Activity, Shield, Zap, Radio, Clock, 
  ArrowRight, MapPin, TrendingDown, ChevronRight
} from 'lucide-react';

// ── LIVE NETWORK MAP PREVIEW ──────────────────────────────────────
const NODES = [
  { x: 80,  y: 60  },
  { x: 260, y: 55  },
  { x: 160, y: 160 },
  { x: 70,  y: 230 },
  { x: 250, y: 220 },
];

const CONNECTIONS = [
  [0, 2], [1, 2], [2, 3], [2, 4], [0, 3], [1, 4],
];

function NetworkMap() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setActive(a => (a + 1) % CONNECTIONS.length), 1200);
    return () => clearInterval(iv);
  }, []);

  const [a, b] = CONNECTIONS[active];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#F7F8FC' }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.06,
        backgroundImage: 'radial-gradient(#0A0F1E 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }} />

      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: 28 }} viewBox="0 0 330 280">
        {/* Static connection lines */}
        {CONNECTIONS.map(([na, nb], i) => (
          <line
            key={i}
            x1={NODES[na].x} y1={NODES[na].y}
            x2={NODES[nb].x} y2={NODES[nb].y}
            stroke={i === active ? '#DC2626' : '#E2E8F0'}
            strokeWidth={i === active ? 1.5 : 0.8}
            strokeDasharray={i === active ? '5 3' : 'none'}
            opacity={i === active ? 1 : 0.5}
          />
        ))}

        {/* Animated packet on active route */}
        {active < CONNECTIONS.length && (() => {
          const na = CONNECTIONS[active][0];
          const nb = CONNECTIONS[active][1];
          return (
            <motion.circle
              key={active}
              r={4} fill="#DC2626"
              initial={{ cx: NODES[na].x, cy: NODES[na].y, opacity: 1 }}
              animate={{ cx: NODES[nb].x, cy: NODES[nb].y, opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeInOut' }}
            />
          );
        })()}

        {/* Hospital nodes */}
        {NODES.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={5} fill="#0A0F1E" />
            <motion.circle
              cx={n.x} cy={n.y} r={10}
              fill="none" stroke="#DC2626" strokeWidth={0.8}
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
            />
          </g>
        ))}
      </svg>

      {/* Ticker */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10B981', animation: 'status-blink 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#64748B', letterSpacing: '0.2em' }}>
          LIVE — 5 NODES SYNCED
        </span>
      </div>
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────────
function StatCard({ value, label, sub, accent }: { value: string; label: string; sub: string; accent?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        padding: '28px',
        background: '#fff',
        border: '1px solid #E8ECF4',
        borderTop: accent ? '2px solid #DC2626' : '1px solid #E8ECF4',
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: accent ? '#DC2626' : '#10B981', animation: 'status-blink 2s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.25em' }}>LIVE METRIC</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 46, fontWeight: 800, color: '#0A0F1E', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, color: '#64748B', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8 }}>
        {label}
      </div>
      <div style={{ marginTop: 16, height: 2, background: '#F1F5F9', borderRadius: 1, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: sub }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ height: '100%', background: accent ? '#DC2626' : '#10B981', borderRadius: 1 }}
        />
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────
export default function LandingPage() {
  const [syncTime, setSyncTime] = useState(1);
  const [counter, setCounter] = useState(0);
  const impactRef = useRef<HTMLDivElement>(null);
  const isImpactInView = useInView(impactRef, { once: true });
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const t = setInterval(() => setSyncTime(s => (s >= 59 ? 1 : s + 1)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isImpactInView) return;
    let n = 0;
    const t = setInterval(() => {
      n++;
      setCounter(n);
      if (n >= 42) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
  }, [isImpactInView]);

  return (
    <div className="landing-bg" style={{ overflowX: 'hidden' }}>
      {/* Scroll bar */}
      <motion.div
        style={{ scaleX, transformOrigin: 'left', position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: '#DC2626', zIndex: 100 }}
      />

      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(250,250,252,0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E8ECF4',
        padding: '0 48px',
        height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#DC2626', animation: 'status-blink 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#0A0F1E', letterSpacing: '0.02em' }}>
              Hemo<span style={{ color: '#DC2626' }}>Globe</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 28, fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B', fontWeight: 500 }}>
            {['Platform', 'How It Works', 'Network'].map(item => (
              <a key={item} href="#" style={{ textDecoration: 'none', color: '#64748B', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748B')}
              >{item}</a>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.2em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={10} /> {syncTime}s ago
          </div>
          <Link to="/login" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: '#0A0F1E',
            textDecoration: 'none',
            borderBottom: '1px solid #0A0F1E',
            paddingBottom: 1,
            transition: 'color 0.2s',
          }}>
            INTERNAL LOGIN
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <main style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '80px 48px 100px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 80,
        alignItems: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Tag line */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
            padding: '5px 12px', marginBottom: 28,
          }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#DC2626', animation: 'status-blink 1.5s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#DC2626', letterSpacing: '0.25em' }}>
              AI-DRIVEN BLOOD LOGISTICS NETWORK
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 68,
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
            color: '#0A0F1E',
            marginBottom: 28,
          }}>
            The Blood<br />
            That Reaches<br />
            <span style={{ color: '#DC2626', position: 'relative', display: 'inline-block' }}>
              In Time.
              <motion.span
                style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
                  background: 'rgba(220,38,38,0.3)',
                  transformOrigin: 'left',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
              />
            </span>
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            lineHeight: 1.7,
            color: '#475569',
            maxWidth: 480,
            marginBottom: 40,
          }}>
            Eliminating the three critical delays in emergency transfusion — finding, moving,
            and confirming blood delivery with AI-driven coordination across your city's network.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/register?mode=org" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px',
              background: '#0A0F1E', color: '#fff',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(10,15,30,0.2)',
              transition: 'background 0.2s',
            }}>
              Register Your Center
              <ChevronRight size={16} />
            </Link>
            <Link to="/register?mode=donor" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '14px 28px',
              border: '1px solid #CBD5E1', color: '#0A0F1E',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
              textDecoration: 'none',
              transition: 'border-color 0.2s',
            }}>
              Become a Donor
            </Link>
          </div>

          {/* Trust strip */}
          <div style={{
            display: 'flex', gap: 24, marginTop: 40,
            paddingTop: 32, borderTop: '1px solid #E8ECF4',
          }}>
            {[
              { n: '12K+', label: 'Units Available' },
              { n: '84',   label: 'Active Requests' },
              { n: '3.2K', label: 'Lives Impacted'  },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: '#0A0F1E', letterSpacing: '-0.02em' }}>{s.n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#94A3B8', letterSpacing: '0.2em', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Network map */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          style={{
            aspectRatio: '1',
            border: '1px solid #E8ECF4',
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '20px 20px 0 0 #F1F5F9',
          }}
        >
          <NetworkMap />
        </motion.div>
      </main>

      {/* ── IMPACT COUNTER ────────────────────────────────────── */}
      <section
        ref={impactRef}
        style={{
          background: '#0A0F1E',
          padding: '100px 48px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#DC2626', letterSpacing: '0.4em', marginBottom: 24 }}>
            PERFORMANCE BENCHMARK
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: '#475569', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8 }}>
            Time to Transfusion Reduction
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 140,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: '#DC2626',
            textShadow: '0 0 80px rgba(220,38,38,0.2)',
          }}>
            -{counter}%
          </div>
          <div style={{ width: 180, height: 2, background: 'rgba(255,255,255,0.06)', margin: '32px auto 0', borderRadius: 1, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={isImpactInView ? { width: '42%' } : {}}
              transition={{ duration: 1.8, ease: 'easeOut', delay: 0.5 }}
              style={{ height: '100%', background: '#DC2626', borderRadius: 1 }}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2D3748', letterSpacing: '0.3em', marginTop: 16 }}>
            VALIDATED VIA SIMULATED MASS CASUALTY RESPONSE DRILLS
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <StatCard value="12,161" label="Available Units"      sub="72%" />
          <StatCard value="84"     label="Open Requests"        sub="30%" accent />
          <StatCard value="3,210"  label="Successful Transfers" sub="88%" />
        </div>
      </section>

      {/* ── PIPELINE ──────────────────────────────────────────── */}
      <section style={{ background: '#F7F8FC', borderTop: '1px solid #E8ECF4', borderBottom: '1px solid #E8ECF4', padding: '80px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#DC2626', letterSpacing: '0.35em', marginBottom: 56 }}>
            RESPONSE PIPELINE
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, position: 'relative' }}>
            {/* Connector */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: 22, left: '12%', right: '12%',
                height: 1, background: 'linear-gradient(90deg, #DC2626, rgba(220,38,38,0.1))',
                transformOrigin: 'left', zIndex: 0,
              }}
            />
            {[
              { step: '01', title: 'Request',  desc: 'Hospital triggers Code Red to the city network.',   icon: <Activity size={18} /> },
              { step: '02', title: 'AI Match', desc: 'System identifies optimal blood source by type and proximity.', icon: <Zap size={18} /> },
              { step: '03', title: 'Dispatch', desc: 'Courier assigned, GPS tracked live across city.',   icon: <MapPin size={18} /> },
              { step: '04', title: 'Verify',   desc: 'Bedside QR scan confirms compatibility before transfusion.', icon: <Shield size={18} /> },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                style={{ position: 'relative', zIndex: 1, background: '#F7F8FC' }}
              >
                <div style={{
                  width: 44, height: 44, marginBottom: 20,
                  background: '#fff', border: '1px solid #E8ECF4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0A0F1E',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}>
                  {item.icon}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: '#E8ECF4', lineHeight: 1, marginBottom: 8 }}>
                  {item.step}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#0A0F1E', marginBottom: 8, borderLeft: '2px solid #DC2626', paddingLeft: 10 }}>
                  {item.title}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY STRIP ────────────────────────────────────── */}
      <section style={{ background: '#0A0F1E', padding: '48px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {[
            { label: 'JWT Role Auth',      sub: 'Spring Security' },
            { label: 'Zero-Latency Sync',  sub: 'Socket.io / Redis' },
            { label: 'Audit Logged',        sub: 'Every action traced' },
            { label: 'Compatibility Guard', sub: 'Bedside cross-match' },
          ].map((item, i) => (
            <div key={i} style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#F0F4FF', marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#2D3748', letterSpacing: '0.1em' }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{
        padding: '120px 48px',
        textAlign: 'center',
        background: '#FAFAFA',
        borderTop: '1px solid #E8ECF4',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 72,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: '#0A0F1E',
            marginBottom: 48,
          }}>
            Blood should never be<br />
            the reason a patient{' '}
            <span style={{ color: '#DC2626', fontStyle: 'italic' }}>dies.</span>
          </h2>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '16px 40px',
            background: '#0A0F1E', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14,
            textDecoration: 'none',
            boxShadow: '0 16px 48px rgba(10,15,30,0.2)',
          }}>
            Authorize Network Access
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}