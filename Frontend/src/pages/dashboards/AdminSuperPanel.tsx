import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, ShieldAlert, Activity, Database, Users, 
  Terminal, Power, Search, Lock, Zap, Settings, 
  AlertTriangle, Save, RefreshCw
} from 'lucide-react';

// --- MOCK DATABASE STATE ---
const INITIAL_NODES = [
  { id: 'NODE-104', name: 'GMCH-32', type: 'HOSPITAL', status: 'ONLINE', latency: '12ms', lastSync: 'Just now' },
  { id: 'NODE-105', name: 'PGIMER Sec-12', type: 'HOSPITAL', status: 'ONLINE', latency: '18ms', lastSync: 'Just now' },
  { id: 'NODE-201', name: 'Fortis Mohali', type: 'HOSPITAL', status: 'MAINTENANCE', latency: '-', lastSync: '2 hrs ago' },
  { id: 'NODE-990', name: 'Tricity Blood Bank', type: 'STORAGE', status: 'ONLINE', latency: '8ms', lastSync: 'Just now' },
];

const FULL_AUDIT_LOGS = [
  { id: 'EVT-9932', time: '14:22:01', action: 'JWT_ISSUED', user: 'admin@gmch32.gov', ip: '192.168.1.44', threat: 'LOW' },
  { id: 'EVT-9931', time: '14:21:45', action: 'NODE_STATE_CHANGE', user: 'SYSTEM', ip: 'localhost', threat: 'LOW' },
  { id: 'EVT-9930', time: '14:20:12', action: 'DB_WRITE_CONFIRM', user: 'SYSTEM', ip: 'localhost', threat: 'LOW' },
  { id: 'EVT-9929', time: '14:15:00', action: 'UNAUTHORIZED_ACCESS', user: 'unknown', ip: '45.22.19.102', threat: 'CRITICAL' },
  { id: 'EVT-9928', time: '13:59:22', action: 'INVENTORY_OVERRIDE', user: 'rn_4092@pgimer.edu', ip: '192.168.2.11', threat: 'ELEVATED' },
  { id: 'EVT-9927', time: '13:45:10', action: 'CODE_RED_BROADCAST', user: 'admin@gmch32.gov', ip: '192.168.1.44', threat: 'ELEVATED' },
  { id: 'EVT-9926', time: '13:30:05', action: 'MATCHING_ENGINE_SYNC', user: 'SYSTEM', ip: 'localhost', threat: 'LOW' },
];

export default function AdminSuperPanel() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [activeTab, setActiveTab] = useState<'NODES' | 'AUDIT' | 'CONFIG'>('NODES');
  const [uptime, setUptime] = useState(99.99);

  // --- CONFIG STATE ---
  const [config, setConfig] = useState({
    autoQuarantine: true,
    strictGeofence: true,
    jwtExpiry: 24,
    maxCourierDist: 15,
  });

  const [isSaving, setIsSaving] = useState(false);

  // Simulate a live backend terminal feed
  const [terminalFeed, setTerminalFeed] = useState([
    '> Initializing HemoGlobe Core Services...',
    '> WebSocket Server: LISTENING on port 8080',
    '> PostgreSQL Database: CONNECTED',
    '> Redis Cache: READY'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hashes = ['SYNC_OK', 'PONG', 'MEM_FLUSH', 'REPLICA_CHECK'];
      const randomMsg = `> [${new Date().toISOString().split('T')[1].slice(0, -1)}] SYS_TASK: ${hashes[Math.floor(Math.random() * hashes.length)]}`;
      setTerminalFeed(prev => [randomMsg, ...prev].slice(0, 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleNodeStatus = (id: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        const newStatus = n.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
        setTerminalFeed(f => [`> WARNING: Admin manually overrode ${n.id} to ${newStatus}`, ...f].slice(0, 8));
        return { ...n, status: newStatus, latency: newStatus === 'ONLINE' ? '15ms' : '-' };
      }
      return n;
    }));
  };

  const saveConfig = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setTerminalFeed(f => [`> SYSTEM: Global configuration updated successfully.`, ...f].slice(0, 8));
    }, 1200);
  };

  // Helper for Toggle Switches
  const Toggle = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <div onClick={onClick} style={{ 
      width: 44, height: 24, borderRadius: 12, background: active ? '#10b981' : '#1E293B', 
      cursor: 'pointer', position: 'relative', transition: 'background 0.3s' 
    }}>
      <div style={{ 
        width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', 
        top: 3, left: active ? 23 : 3, transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
      }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#030509', color: '#F8FAFC', fontFamily: 'var(--font-body)' }}>
      
      {/* ═════════ SIDEBAR NAVIGATION ═════════ */}
      <aside style={{ width: 260, background: '#060912', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Server size={20} color="#06b6d4" />
            <span style={{ fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>SuperAdmin</span>
          </div>
          <div style={{ fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>Root Access Granted</div>
        </div>

        <nav style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { id: 'NODES', icon: <Database size={16} />, label: 'Node Management' },
            { id: 'AUDIT', icon: <ShieldAlert size={16} />, label: 'Security & Audit' },
            { id: 'CONFIG', icon: <Settings size={16} />, label: 'System Config' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                color: activeTab === tab.id ? '#06b6d4' : '#64748B',
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textAlign: 'left', transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>SYSTEM UPTIME</span>
            <span style={{ fontSize: 10, color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{uptime}%</span>
          </div>
          <div style={{ height: 4, background: '#1E293B', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${uptime}%`, background: '#10b981' }} />
          </div>
        </div>
      </aside>

      {/* ═════════ MAIN DASHBOARD ═════════ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* DYNAMIC HEADER */}
        <header style={{ padding: '24px 40px', background: '#0B101E', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-display)', margin: '0 0 4px 0' }}>
              {activeTab === 'NODES' && 'Network Topography'}
              {activeTab === 'AUDIT' && 'Forensic Security Audit'}
              {activeTab === 'CONFIG' && 'Global System Configuration'}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'var(--font-mono)', margin: 0 }}>
              {activeTab === 'NODES' && 'Managing 12 active physical nodes and 4,021 users.'}
              {activeTab === 'AUDIT' && 'Immutable ledger of all network interactions.'}
              {activeTab === 'CONFIG' && 'Core routing algorithms and security parameters.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ background: '#060912', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={14} color="#10b981" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#10b981' }}>DB: CONNECTED</span>
            </div>
            <div style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', padding: '8px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Power size={14} color="#ef4444" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#ef4444', fontWeight: 900 }}>GLOBAL KILL SWITCH</span>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div style={{ flex: 1, padding: 40, overflowY: 'auto' }}>
          
          {/* ================= TAB 1: NODES (Original) ================= */}
          {activeTab === 'NODES' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              
              {/* STATS ROW */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                {[
                  { label: 'Active WebSockets', val: '1,204', icon: <Activity size={18} color="#06b6d4" /> },
                  { label: 'Total Syncs (24h)', val: '84.2K', icon: <Database size={18} color="#10b981" /> },
                  { label: 'Security Flags', val: '3', icon: <ShieldAlert size={18} color="#ef4444" /> },
                  { label: 'Active Users', val: '4,021', icon: <Users size={18} color="#8b5cf6" /> },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#0B101E', border: '1px solid rgba(255,255,255,0.05)', padding: 24, borderRadius: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</span>
                      {stat.icon}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stat.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                
                {/* NODE TABLE */}
                <div style={{ background: '#0B101E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Server size={16} color="#64748B" /> Registered Infrastructure Nodes
                    </h2>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#060912', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>NODE ID</th>
                        <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>FACILITY</th>
                        <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>STATUS</th>
                        <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>LATENCY</th>
                        <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map(node => (
                        <tr key={node.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#F8FAFC' }}>{node.id}</td>
                          <td style={{ padding: '16px 24px', fontSize: 13, fontWeight: 700 }}>{node.name}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ 
                              display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
                              background: node.status === 'ONLINE' ? 'rgba(16,185,129,0.1)' : node.status === 'MAINTENANCE' ? 'rgba(217,119,6,0.1)' : 'rgba(220,38,38,0.1)',
                              color: node.status === 'ONLINE' ? '#10b981' : node.status === 'MAINTENANCE' ? '#d97706' : '#ef4444',
                              border: `1px solid ${node.status === 'ONLINE' ? 'rgba(16,185,129,0.2)' : node.status === 'MAINTENANCE' ? 'rgba(217,119,6,0.2)' : 'rgba(220,38,38,0.2)'}`
                            }}>
                              {node.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8' }}>{node.latency}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button 
                              onClick={() => toggleNodeStatus(node.id)}
                              style={{ 
                                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', 
                                padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, transition: 'all 0.2s' 
                              }}
                            >
                              {node.status === 'ONLINE' ? 'SUSPEND' : 'ACTIVATE'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RIGHT COLUMN: LIVE TERMINAL */}
                <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, height: '100%', minHeight: 300, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Terminal size={14} color="#06b6d4" />
                    <span style={{ fontSize: 10, color: '#06b6d4', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em' }}>LIVE SERVER LOG</span>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column-reverse' }}>
                    <AnimatePresence initial={false}>
                      {terminalFeed.map((log, i) => (
                        <motion.div 
                          key={log + i} 
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: i === 0 ? 1 : 0.5, x: 0 }} 
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: log.includes('WARNING') ? '#ef4444' : i === 0 ? '#10b981' : '#64748B', marginBottom: 6, wordBreak: 'break-all' }}
                        >
                          {log}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= TAB 2: AUDIT LOGS ================= */}
          {activeTab === 'AUDIT' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#0B101E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={16} color="#ef4444" /> Immutable Event Ledger
                </h2>
                <div style={{ background: '#060912', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Search size={12} color="#64748B" />
                  <input type="text" placeholder="Filter logs..." style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 11, fontFamily: 'var(--font-mono)', width: 150 }} />
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#060912', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>EVENT ID</th>
                    <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>TIMESTAMP</th>
                    <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>ACTION TRIGGERED</th>
                    <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>ACTOR / NODE</th>
                    <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>ORIGIN IP</th>
                    <th style={{ padding: '16px 24px', fontSize: 10, color: '#64748B', fontFamily: 'var(--font-mono)' }}>THREAT LEVEL</th>
                  </tr>
                </thead>
                <tbody>
                  {FULL_AUDIT_LOGS.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#F8FAFC' }}>{log.id}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94A3B8' }}>{log.time}</td>
                      <td style={{ padding: '16px 24px', fontSize: 12, fontWeight: 700, color: log.action.includes('UNAUTHORIZED') ? '#ef4444' : '#F8FAFC' }}>{log.action}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#94A3B8' }}>{log.user}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'var(--font-mono)', fontSize: 11, color: '#64748B' }}>{log.ip}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
                          background: log.threat === 'LOW' ? 'rgba(16,185,129,0.1)' : log.threat === 'ELEVATED' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                          color: log.threat === 'LOW' ? '#10b981' : log.threat === 'ELEVATED' ? '#f59e0b' : '#ef4444',
                        }}>
                          {log.threat}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* ================= TAB 3: CONFIGURATION ================= */}
          {activeTab === 'CONFIG' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              
              {/* Security Rules */}
              <div style={{ background: '#0B101E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 32 }}>
                <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                  <ShieldAlert size={18} color="#8b5cf6" /> Security & Access Rules
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>Auto-Quarantine on Mismatch</div>
                      <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'var(--font-mono)' }}>Automatically lock blood units if nurse scanner detects fatal mismatch.</div>
                    </div>
                    <Toggle active={config.autoQuarantine} onClick={() => setConfig({...config, autoQuarantine: !config.autoQuarantine})} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 4 }}>Strict Geofence Enforcement</div>
                      <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'var(--font-mono)' }}>Block couriers from accepting dispatches outside their designated city zone.</div>
                    </div>
                    <Toggle active={config.strictGeofence} onClick={() => setConfig({...config, strictGeofence: !config.strictGeofence})} />
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', marginBottom: 8 }}>JWT Token Expiry (Hours)</div>
                    <input 
                      type="number" value={config.jwtExpiry} onChange={e => setConfig({...config, jwtExpiry: Number(e.target.value)})}
                      style={{ width: '100%', padding: 12, background: '#060912', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: 6, fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Routing Engine */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <div style={{ background: '#0B101E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 32 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                    <Activity size={18} color="#06b6d4" /> Matching Engine Parameters
                  </h2>
                  
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC' }}>Max Courier Radius</span>
                      <span style={{ fontSize: 14, fontWeight: 900, color: '#06b6d4', fontFamily: 'var(--font-mono)' }}>{config.maxCourierDist} km</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>Maximum distance an AI match will search for an available courier.</div>
                    <input 
                      type="range" min="1" max="50" value={config.maxCourierDist} onChange={e => setConfig({...config, maxCourierDist: Number(e.target.value)})}
                      style={{ width: '100%', accentColor: '#06b6d4' }}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={saveConfig}
                  disabled={isSaving}
                  style={{ 
                    width: '100%', padding: 24, background: '#10b981', color: '#000', borderRadius: 12, border: 'none',
                    fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 10px 30px rgba(16,185,129,0.2)',
                    opacity: isSaving ? 0.7 : 1
                  }}
                >
                  {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />} 
                  {isSaving ? 'APPLYING TO NETWORK...' : 'DEPLOY CONFIGURATION'}
                </button>
              </div>

            </motion.div>
          )}

        </div>
      </main>

    </div>
  );
}