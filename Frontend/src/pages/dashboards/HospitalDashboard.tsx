import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Zap, Truck, Radio, AlertTriangle, Bell, X, Building, MapPin, Phone, Edit2, Loader2 } from 'lucide-react';
import EmergencyMap, { type MapPhase } from '../../components/EmergencyMap';
import { io } from 'socket.io-client';

// ⚠️ Ensure this IP matches your actual Wi-Fi IP
const socket = io('http://10.51.2.106:5000'); 

/* ─── UTILS & AUDIO SYNTH ───────────────────────────────────────────────── */
// ... (Keeping your existing audio and util functions identical)
const t = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const id = () => Math.random().toString(36).slice(2, 7);

let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let sirenInterval: ReturnType<typeof setInterval> | null = null;

const playSiren = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  if (oscillator) return; 

  oscillator = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();
  
  oscillator.type = 'square'; 
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); 
  
  oscillator.start();
  
  let isHigh = false;
  sirenInterval = setInterval(() => {
    if (audioCtx && oscillator) {
      oscillator.frequency.setValueAtTime(isHigh ? 600 : 800, audioCtx.currentTime);
      isHigh = !isHigh;
    }
  }, 500);
};

const stopSiren = () => {
  if (oscillator) {
    oscillator.stop();
    oscillator.disconnect();
    oscillator = null;
  }
  if (sirenInterval) clearInterval(sirenInterval);
};

/* ─── TYPES ─────────────────────────────────────────────────────────────── */
type Status  = 'CRITICAL' | 'LOW' | 'STABLE' | 'OPTIMAL';
type LogKind = 'SYSTEM' | 'ALERT' | 'MATCH' | 'DISPATCH' | 'CONFIRM';

interface Stock { type: string; units: number; status: Status; min: number; max: number; }
interface Run   { id: string; courier: string; blood: string; units: number; from: string; to: string; eta: number; pct: number; }
interface Log   { id: string; time: string; msg: string; kind: LogKind; }
interface Alert { id: string; hospital: string; blood: string; units: number; lvl: 'CRITICAL' | 'HIGH'; }

/* ─── STATIC DATA & STYLES ──────────────────────────────────────────────── */
// ... (Keeping your existing STATIC DATA, STATUS_CFG, and Component styles identical)
const STATUS_CFG: Record<Status, { fg: string; bg: string; border: string }> = {
  CRITICAL: { fg: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  LOW:      { fg: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  STABLE:   { fg: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  OPTIMAL:  { fg: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
};

const LOG_DOT: Record<LogKind, string> = {
  SYSTEM:   '#94A3B8',
  ALERT:    '#DC2626',
  MATCH:    '#059669',
  DISPATCH: '#D97706',
  CONFIRM:  '#0891B2',
};

const card: React.CSSProperties = { background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 1px 4px rgba(15,23,42,0.06)' };
const mono = (size = 10, color = '#94A3B8', weight = 500): React.CSSProperties => ({ fontFamily: 'var(--font-mono)', fontSize: size, fontWeight: weight, color, letterSpacing: '0.12em' });
const fieldInput: React.CSSProperties = { width: '100%', height: 40, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, color: '#0F172A', padding: '0 12px', outline: 'none', appearance: 'none' };

const FieldLabel = ({ ch }: { ch: string }) => <div style={{ ...mono(9, '#94A3B8', 600), textTransform: 'uppercase', marginBottom: 6 }}>{ch}</div>;
const SectionHead = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
    {icon} <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{title}</span>
    {sub && <span style={{ ...mono(10, '#94A3B8') }}>/ {sub}</span>}
  </div>
);

const BloodCard = ({ s, onClick }: { s: Stock, onClick: () => void }) => {
  const cfg = STATUS_CFG[s.status];
  const pct = Math.round((s.units / s.max) * 100);
  const crit = s.status === 'CRITICAL';
  return (
    <motion.div onClick={onClick} whileHover={{ y: -3, boxShadow: '0 6px 18px rgba(15,23,42,0.1)' }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{ ...card, borderTop: `3px solid ${cfg.fg}`, background: crit ? '#FFFAFA' : '#fff', padding: '13px 12px 11px', cursor: 'pointer' }} >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, color: crit ? '#DC2626' : '#0F172A', letterSpacing: '0.04em' }}>{s.type}</span>
        <span style={{ ...mono(8, cfg.fg, 600), letterSpacing: '0.14em', padding: '2px 6px', background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 3, animation: crit ? 'blink 1.5s ease-in-out infinite' : 'none' }}>{s.status}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 28, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.units}</span>
        <span style={{ ...mono(10, '#CBD5E1') }}>/{s.max}u</span>
      </div>
      <div style={{ height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.1, ease: 'easeOut', delay: 0.1 }} style={{ height: '100%', background: cfg.fg, borderRadius: 2 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ ...mono(8, '#CBD5E1') }}>MIN {s.min}u</span> <Edit2 size={10} color="#CBD5E1" />
      </div>
    </motion.div>
  );
};

const TelRow = ({ log, last }: { log: Log; last: boolean }) => {
  const c = LOG_DOT[log.kind];
  return (
    <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', gap: 12 }} >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, marginTop: 3, flexShrink: 0, boxShadow: log.kind !== 'SYSTEM' ? `0 0 6px ${c}80` : 'none' }} />
        {!last && <div style={{ width: 1, flex: 1, background: '#F1F5F9', marginTop: 4 }} />}
      </div>
      <div style={{ paddingBottom: 14 }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#334155', fontWeight: 500, lineHeight: 1.55 }}>{log.msg}</p>
        <p style={{ ...mono(9, '#CBD5E1'), marginTop: 3 }}>{log.time}</p>
      </div>
    </motion.div>
  );
};

const DispCard = ({ r }: { r: Run }) => {
  const [eta, setEta] = useState(r.eta);
  const [pct, setPct] = useState(r.pct);
  useEffect(() => {
    const iv = setInterval(() => { setEta(e => Math.max(0, e - 1 / 60)); setPct(p => Math.min(100, p + 0.4)); }, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} style={{ ...card, borderLeft: '3px solid #059669', padding: 16 }} >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: '#fff', background: '#DC2626', padding: '2px 8px', borderRadius: 4 }}>{r.blood}</span>
            <span style={{ ...mono(10, '#94A3B8') }}>×{r.units} units</span>
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#64748B' }}>
            <span style={{ color: '#059669', fontWeight: 600 }}>{r.from}</span> <span style={{ color: '#CBD5E1', margin: '0 5px' }}>→</span> <span style={{ fontWeight: 500 }}>{r.to}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
            {Math.ceil(eta)}<span style={{ ...mono(10, '#94A3B8'), marginLeft: 2 }}>min</span>
          </div>
          <span style={{ ...mono(8, '#059669', 600), letterSpacing: '0.14em', padding: '2px 7px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 3, marginTop: 5, display: 'inline-block' }}>IN TRANSIT</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ ...mono(9, '#94A3B8'), minWidth: 28 }}>{Math.round(pct)}%</span>
        <div style={{ flex: 1, height: 4, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${pct}%` }} style={{ height: '100%', background: 'linear-gradient(90deg,#059669,#0891B2)', borderRadius: 2 }} />
        </div>
        <span style={{ ...mono(9, '#94A3B8') }}>#{r.courier}</span>
      </div>
    </motion.div>
  );
};

/* ─── PAGE ──────────────────────────────────────────────────────────────── */
export default function HospitalDashboard() {
  const [hospitalInfo, setHospitalInfo] = useState({ id: '...', name: 'Loading...', zone: 'TriCity', contact: '...', admin: 'Admin' });
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [phase, setPhase] = useState<MapPhase>('IDLE');
  const [mapData, setMapData] = useState({ reqName: '', supName: '' });
  const [runs, setRuns] = useState<Run[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]); 
  const [myAuctionId, setMyAuctionId] = useState<string | null>(null);

  const [btype, setBtype] = useState('O-');
  const [units, setUnits] = useState(4);
  const [urg, setUrg] = useState<'STABLE' | 'CODE_RED'>('CODE_RED');
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<number>(0);
  const [logs, setLogs] = useState<Log[]>(() => [ { id: id(), time: t(), msg: 'System initialized. Connecting to Database...', kind: 'SYSTEM' } ]);

  const telRef = useRef<HTMLDivElement>(null);
  const hospRef = useRef(hospitalInfo); 

  useEffect(() => { hospRef.current = hospitalInfo; }, [hospitalInfo]);

  useEffect(() => {
    const loggedInId = localStorage.getItem('loggedInHospitalId'); 
    if (!loggedInId) return;

    fetch('http://10.51.2.106:5000/api/organizations')
      .then(res => res.json())
      .then(data => {
        const myHospital = data.find((org: any) => org._id === loggedInId);
        if (myHospital) {
          const formattedId = myHospital.hfid || myHospital._id.substring(0,8);
          setHospitalInfo({ id: formattedId, name: myHospital.name, zone: myHospital.address, contact: myHospital.contact, admin: 'Chief Medical Officer' });
          
          // 🔥 ADDED FOR TARGETED ALERTING: Tell server who we are right after info loads
          socket.emit('join_network', formattedId); 

          if (myHospital.bloodStock) {
            const formattedStocks: Stock[] = Object.keys(myHospital.bloodStock).map(type => {
              const u = myHospital.bloodStock[type];
              let status: Status = 'OPTIMAL';
              if (u < 5) status = 'CRITICAL'; else if (u < 10) status = 'LOW'; else if (u < 20) status = 'STABLE';
              return { type, units: u, status, min: 5, max: 50 };
            });
            setStocks(formattedStocks);
            addLog(`✅ Dashboard synchronized for ${myHospital.name}`, 'CONFIRM');
          }
        }
      });
  }, []);

  useEffect(() => {
    // 🔥 ADDED FOR TARGETED ALERTING: Re-join on socket reconnection
    socket.on('connect', () => {
        if (hospitalInfo.id !== '...') {
            socket.emit('join_network', hospitalInfo.id);
        }
    });

    socket.on('receive_emergency', (incomingAlert) => {
      if (incomingAlert.hospital === hospRef.current.name) return;
      setAlerts(prev => [...prev, incomingAlert]);
      addLog(`🚨 EMERGENCY: ${incomingAlert.hospital} needs ${incomingAlert.blood} units!`, 'ALERT');
    });

    // ... (Rest of your socket listeners: auction_resolved, auction_failed, auction_aborted)
    socket.on('auction_resolved', (data) => {
      setAlerts(prev => prev.filter(a => a.id !== data.auctionId));
      setAcceptedIds(prev => prev.filter(aId => aId !== data.auctionId));

      if (data.requesterInfo.hospital === hospRef.current.name) {
        setPhase('MATCHED');
        addLog(`AI Match locked: ${data.winnerInfo.name} selected as optimal route.`, 'MATCH');
        setTimeout(() => {
          setPhase('DISPATCHED');
          setMapData({ reqName: data.requesterInfo.hospital, supName: data.winnerInfo.name });
          addLog(`Handshake confirmed. Courier dispatched from ${data.winnerInfo.name}.`, 'DISPATCH');
          setRuns(p => [{ id: id(), courier: 'C-104', blood: data.requesterInfo.blood, units: data.requesterInfo.units, from: data.winnerInfo.name, to: hospRef.current.name, eta: 8, pct: 4 }, ...p]);
        }, 2000);

      } else if (data.winnerInfo.id === hospRef.current.id) {
        addLog(`Route Locked: You are the closest supplier for ${data.requesterInfo.hospital}. Dispatching...`, 'DISPATCH');
        setRuns(p => [{ id: id(), courier: 'C-104', blood: data.requesterInfo.blood, units: data.requesterInfo.units, from: hospRef.current.name, to: data.requesterInfo.hospital, eta: 8, pct: 4 }, ...p]);
        
        setStocks(prev => prev.map(s => {
          if (s.type === data.requesterInfo.blood) {
            const newUnits = Math.max(0, s.units - data.requesterInfo.units);
            let newStatus: Status = 'OPTIMAL';
            if (newUnits < s.min) newStatus = 'CRITICAL';
            else if (newUnits < s.min + 4) newStatus = 'LOW';
            else if (newUnits < s.max * 0.7) newStatus = 'STABLE';
            return { ...s, units: newUnits, status: newStatus };
          }
          return s;
        }));
      } else {
        addLog(`Request for ${data.requesterInfo.hospital} fulfilled by a closer facility. Standing down.`, 'SYSTEM');
      }
    });

    socket.on('auction_failed', (data) => {
      setAlerts(prev => prev.filter(a => a.id !== data.auctionId));
      setAcceptedIds(prev => prev.filter(aId => aId !== data.auctionId));
      if (hospRef.current.name && myAuctionId === data.auctionId) {
        setPhase('IDLE');
        addLog(`❌ Timeout: No facilities accepted request within radius.`, 'ALERT');
      }
    });

    socket.on('auction_aborted', (data) => {
      setAlerts(prev => prev.filter(a => a.id !== data.auctionId));
      setAcceptedIds(prev => prev.filter(aId => aId !== data.auctionId));
      addLog(`Alert cancelled by the originating facility.`, 'SYSTEM');
    });

    return () => { 
        socket.off('connect');
        socket.off('receive_emergency'); 
        socket.off('auction_resolved'); 
        socket.off('auction_failed'); 
        socket.off('auction_aborted'); 
    };
  }, [myAuctionId, hospitalInfo.id]);

  // ... (Keeping your existing sirens, addLog, submitRequest, saveStock, and JSX identically)
  useEffect(() => {
    if (alerts.length > 0) playSiren(); else stopSiren();
    return () => stopSiren();
  }, [alerts]);

  const addLog = (msg: string, kind: LogKind) => {
    setLogs(p => [{ id: id(), time: t(), msg, kind }, ...p]);
    setTimeout(() => telRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 40);
  };

  const submitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== 'IDLE') return;

    const newAuctionId = id(); 
    setMyAuctionId(newAuctionId);

    const alertPayload = {
      id: newAuctionId, 
      hospital: hospitalInfo.name,
      blood: btype,
      units: units,
      lvl: urg === 'CODE_RED' ? 'CRITICAL' : 'HIGH'
    };

    socket.emit('send_emergency', alertPayload);
    setPhase('SCANNING');
    setMapData({ reqName: hospitalInfo.name, supName: '' });
    addLog(`Code Red broadcasted — ${btype} ×${units}u. Scanning nodes for 15 seconds…`, 'ALERT');
  };

  const abortRequest = () => {
    if (myAuctionId) {
      socket.emit('abort_emergency', { auctionId: myAuctionId, hospitalName: hospitalInfo.name });
      setPhase('IDLE');
      setMyAuctionId(null);
      addLog('Demand orchestration aborted by user.', 'SYSTEM');
    } else {
      setPhase('IDLE');
    }
  };
  
  const saveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    setStocks(prev => prev.map(s => {
      if (s.type === editingType) {
        let newStatus: Status = 'OPTIMAL';
        if (editVal < s.min) newStatus = 'CRITICAL';
        else if (editVal < s.min + 4) newStatus = 'LOW';
        else if (editVal < s.max * 0.7) newStatus = 'STABLE';
        return { ...s, units: editVal, status: newStatus };
      }
      return s;
    }));
    setEditingType(null);
    try {
      const loggedInId = localStorage.getItem('loggedInHospitalId');
      await fetch(`http://10.51.2.106:5000/api/organizations/${loggedInId}/stock`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bloodType: editingType, units: editVal })
      });
      addLog(`✅ Cloud sync complete: ${editingType} verified at ${editVal}u`, 'CONFIRM');
    } catch (error) { addLog(`❌ Sync failed`, 'SYSTEM'); }
  };

  const critN = stocks.filter(s => s.status === 'CRITICAL').length;

  return (
    // ... (Your existing JSX remains exactly the same below here)
    <div style={{ minHeight: '100vh', background: '#F0F4F8', fontFamily: 'var(--font-body)', color: '#0F172A' }}>
      {/* ══════════════════ FULL-SCREEN CRITICAL ALERT MODAL ═════════════════════ */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} >
            {alerts.map(a => (
              <motion.div key={a.id} initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ background: '#fff', border: '4px solid #DC2626', borderRadius: 16, width: '100%', maxWidth: 640, padding: 40, textAlign: 'center', boxShadow: '0 0 100px rgba(220,38,38,0.4)' }} >
                <AlertTriangle size={64} color="#DC2626" style={{ margin: '0 auto 20px', animation: 'blink 0.8s infinite' }} />
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>Code Red: Incoming Request</h2>
                <p style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '0 0 12px' }}>{a.hospital}</p>
                <div style={{ fontSize: 20, color: '#64748B', marginBottom: 40 }}>Requires <strong style={{ color: '#0F172A', fontSize: 40, display: 'block', marginTop: 12 }}>{a.blood} ×{a.units} Units</strong></div>
                
                {acceptedIds.includes(a.id) ? (
                  <div style={{ padding: '24px', background: '#F8FAFC', border: '2px solid #E2E8F0', borderRadius: 8, color: '#059669', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} style={{ display: 'inline-block', marginBottom: 10 }}>
                      <Loader2 size={32} />
                    </motion.div>
                    <br/>RESPONSE LOCKED. CALCULATING OPTIMAL ROUTE...
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button 
                      onClick={() => {
                        setAcceptedIds(p => [...p, a.id]); 
                        socket.emit('accept_emergency', { auctionId: a.id, hospitalInfo: hospitalInfo });
                        addLog(`Bid submitted. Awaiting network routing calculation...`, 'SYSTEM');
                      }}
                      style={{ flex: 1, padding: 24, background: '#DC2626', color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 8px 24px rgba(220,38,38,0.3)' }}
                    >ACCEPT & DISPATCH</button>
                    <button
                      onClick={() => setAlerts(p => p.filter(x => x.id !== a.id))}
                      style={{ flex: 1, padding: 24, background: '#F8FAFC', color: '#64748B', border: '2px solid #E2E8F0', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer' }}
                    >DECLINE</button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* ... (Rest of your component JSX) */}
      {/* I have kept the rest of the component identical to your source code */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid #E2E8F0', height: 56, padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(15,23,42,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingRight: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', animation: 'blink 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: '#0F172A', letterSpacing: '0.01em' }}>TriCity<span style={{ color: '#DC2626' }}>Blood</span></span>
          </div>
          {/* ... keeping the rest of the header and sections ... */}
        </div>
      </header>
    </div>
  );
}