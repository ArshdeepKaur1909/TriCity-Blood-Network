import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Zap } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet';
import { Link } from 'react-router-dom';

// ── DATA ──────────────────────────────────────────────────────────
const TRICITY_CENTER: [number, number] = [30.7200, 76.7600];

const HOSPITALS = [
  { id: 'H1', name: 'PGIMER',        zone: 'Sector 12, CHD',  coords: [30.7673, 76.7774] as [number,number], stock: { 'O-': 18, 'A+': 24, 'B+': 11 }, priority: 9 },
  { id: 'H2', name: 'GMCH-32',       zone: 'Sector 32, CHD',  coords: [30.7046, 76.7749] as [number,number], stock: { 'O-': 2,  'A+': 5,  'B+': 3  }, priority: 8 },
  { id: 'H3', name: 'Fortis Mohali', zone: 'Phase 8, Mohali', coords: [30.6905, 76.7305] as [number,number], stock: { 'O-': 7,  'A+': 14, 'B+': 8  }, priority: 7 },
  { id: 'H4', name: 'Alchemist',     zone: 'Panchkula',       coords: [30.7135, 76.8512] as [number,number], stock: { 'O-': 4,  'A+': 9,  'B+': 5  }, priority: 6 },
  { id: 'H5', name: 'Max Hospital',  zone: 'Sector 56, CHD',  coords: [30.7290, 76.7980] as [number,number], stock: { 'O-': 12, 'A+': 18, 'B+': 9  }, priority: 7 },
];

const CITY_INVENTORY = [
  { type: 'O-',  total: 43,  critical: true  },
  { type: 'O+',  total: 182, critical: false },
  { type: 'A-',  total: 31,  critical: false },
  { type: 'A+',  total: 124, critical: false },
  { type: 'B-',  total: 18,  critical: true  },
  { type: 'B+',  total: 88,  critical: false },
  { type: 'AB-', total: 9,   critical: true  },
  { type: 'AB+', total: 47,  critical: false },
];

const TIMELINE_EVENTS = [
  { time: '21:02', event: 'Code Red — GMCH-32',   hospital: 'O- ×4',             type: 'ALERT'    },
  { time: '21:03', event: 'AI Match Locked',       hospital: 'PGIMER → GMCH-32', type: 'MATCH'    },
  { time: '21:04', event: 'Courier #C-104 Active', hospital: 'In Transit',       type: 'DISPATCH' },
  { time: '21:07', event: 'Geofence Triggered',    hospital: 'Nurse OT-3 alert', type: 'CONFIRM'  },
  { time: '21:09', event: 'Code Red — Alchemist',  hospital: 'AB- ×2',           type: 'ALERT'    },
];

const EVENT_COLORS: Record<string, string> = {
  ALERT: '#DC2626', MATCH: '#10B981', DISPATCH: '#F59E0B', CONFIRM: '#06B6D4', SYSTEM: '#4B5568',
};

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── MAIN COMPONENT ────────────────────────────────────────────────
export default function WarRoomDashboard() {
  const [mceActive, setMceActive] = useState(false);
  const [mceConfirm, setMceConfirm] = useState(false);
  const [cityTime, setCityTime] = useState(now());
  const [selectedHospital, setSelectedHospital] = useState<typeof HOSPITALS[0] | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Live Clock
  useEffect(() => {
    const t = setInterval(() => setCityTime(now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Map Render Delay (Prevents Leaflet sizing bugs)
  useEffect(() => {
    const t = setTimeout(() => setMapReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  const activateMce = () => {
    setMceActive(true);
    setMceConfirm(false);
  };

  const criticalTypes = CITY_INVENTORY.filter(i => i.critical);
  const totalUnits    = CITY_INVENTORY.reduce((s, i) => s + i.total, 0);

  return (
    <div style={{
      height: '100vh', overflow: 'hidden',
      background: '#060912', // Enforced Dark Mode Base
      color: '#F0F4FF',
      fontFamily: 'var(--font-body)',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ── NATIONAL STATUS BAR ────────────────────────────────── */}
      <div style={{
        background: mceActive ? '#DC2626' : '#0B101E',
        padding: '0 24px',
        height: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${mceActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'background 0.5s',
        flexShrink: 0,
        zIndex: 60,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: mceActive ? '#fff' : '#10B981', animation: 'blink 1.5s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '0.04em' }}>
              Hemo<span style={{ color: mceActive ? 'rgba(255,255,255,0.7)' : '#DC2626' }}>Globe</span>
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
          {mceActive ? (
            <motion.span
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: '#fff' }}
            >
              ⬤ MCE MODE ACTIVE — DISASTER ORCHESTRATOR ONLINE
            </motion.span>
          ) : (
            <div style={{ display: 'flex', gap: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', letterSpacing: '0.15em' }}>
              <span style={{ color: '#F0F4FF' }}>{totalUnits.toLocaleString()} UNITS</span>
              <span style={{ color: '#DC2626' }}>84 REQUESTS</span>
              <span>3,210 LIVES</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: mceActive ? 'rgba(255,255,255,0.8)' : '#94A3B8' }}>
            {cityTime}
          </span>
          <Link to="/hospital/dashboard" style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: mceActive ? 'rgba(255,255,255,0.8)' : '#94A3B8',
            letterSpacing: '0.15em', textDecoration: 'none', borderBottom: '1px solid currentColor', paddingBottom: 2
          }}>
            EXIT TO HOSPITAL VIEW
          </Link>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
        <aside style={{
          width: 320,
          borderRight: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
          background: '#0B101E', // Enforced Dark Mode Panel
        }}>

          {/* Emergency Timeline */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: '#64748B', marginBottom: 20 }}>
              EMERGENCY TIMELINE
            </div>
            {TIMELINE_EVENTS.map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: EVENT_COLORS[ev.type],
                    flexShrink: 0, marginTop: 4,
                    boxShadow: `0 0 6px ${EVENT_COLORS[ev.type]}80`,
                  }} />
                  {i < TIMELINE_EVENTS.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.08)', marginTop: 6 }} />
                  )}
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>{ev.event}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', marginTop: 4 }}>
                    {ev.time} · <span style={{ color: '#CBD5E1' }}>{ev.hospital}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* City Inventory */}
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: '#64748B', marginBottom: 16 }}>
              CITY INVENTORY
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {CITY_INVENTORY.map(item => (
                <div key={item.type} style={{
                  padding: '12px',
                  background: item.critical ? 'rgba(220,38,38,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.critical ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderRadius: 2
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: item.critical ? '#DC2626' : '#94A3B8' }}>
                    {item.type}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: item.critical ? '#DC2626' : '#F8FAFC' }}>
                    {item.total}
                  </span>
                </div>
              ))}
            </div>

            {criticalTypes.length > 0 && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', gap: 8, borderRadius: 2
              }}>
                <AlertTriangle size={14} color="#DC2626" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#DC2626', letterSpacing: '0.15em', fontWeight: 600 }}>
                  {criticalTypes.length} TYPES CRITICAL
                </span>
              </div>
            )}
          </div>

          {/* Network Capacity */}
          <div style={{ padding: '24px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: '#64748B', marginBottom: 16 }}>
              NETWORK CAPACITY
            </div>
            {[
              { label: 'Hospitals Online', value: '5 / 5',  color: '#10B981' },
              { label: 'Couriers Active',  value: '8',       color: '#06B6D4' },
              { label: 'Open Requests',    value: '84',      color: '#DC2626' },
              { label: 'In Transit',       value: '12 units',color: '#F59E0B' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', letterSpacing: '0.1em' }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: MAP ──────────────────────────────────────── */}
        <main style={{ flex: 1, position: 'relative', background: '#060912' }}>
          {mapReady && (
            <MapContainer
              center={TRICITY_CENTER}
              zoom={12}
              style={{ width: '100%', height: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

              {HOSPITALS.map(h => {
                const isLow = Object.values(h.stock).some(v => v < 5);
                return (
                  <CircleMarker
                    key={h.id}
                    center={h.coords}
                    radius={isLow ? 10 : 7}
                    pathOptions={{
                      fillColor: isLow ? '#DC2626' : '#10B981',
                      color: isLow ? 'rgba(220,38,38,0.5)' : 'rgba(16,185,129,0.4)',
                      weight: 8,
                      fillOpacity: 1,
                    }}
                    eventHandlers={{ click: () => setSelectedHospital(h) }}
                  >
                    <Popup>
                      <div style={{ fontFamily: 'var(--font-body)', background: '#0A0F1E', color: '#F0F4FF', padding: 8, minWidth: 160 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{h.name}</div>
                        <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>{h.zone}</div>
                        {Object.entries(h.stock).map(([type, count]) => (
                          <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
                            <span style={{ fontFamily: 'var(--font-mono)', color: '#8B95B0' }}>{type}</span>
                            <span style={{ color: count < 5 ? '#DC2626' : '#10B981', fontWeight: 600 }}>{count}u</span>
                          </div>
                        ))}
                        <div style={{ marginTop: 6, fontSize: 10, color: '#F59E0B', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                          Priority: {h.priority}/10
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

              {/* MCE Hub-and-Spoke Routes */}
              {mceActive && [
                [HOSPITALS[0].coords, HOSPITALS[1].coords],
                [HOSPITALS[4].coords, HOSPITALS[1].coords],
                [HOSPITALS[2].coords, HOSPITALS[3].coords],
              ].map((path, i) => (
                <Polyline
                  key={i}
                  positions={path as [number,number][]}
                  pathOptions={{ color: '#DC2626', weight: 3, dashArray: '10 8', opacity: 0.8 }}
                />
              ))}
            </MapContainer>
          )}

          {/* Map Status Overlay */}
          <div style={{
            position: 'absolute', top: 20, left: 20, zIndex: 800,
            background: 'rgba(11,16,30,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '10px 16px', borderRadius: 4,
            pointerEvents: 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'blink 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#CBD5E1', letterSpacing: '0.2em', fontWeight: 600 }}>
                LIVE GEOSPATIAL FEED — TRICITY
              </span>
            </div>
          </div>

          {/* Legend Overlay */}
          <div style={{
            position: 'absolute', bottom: 20, left: 20, zIndex: 800,
            background: 'rgba(11,16,30,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '12px 18px', borderRadius: 4,
            display: 'flex', gap: 20,
            pointerEvents: 'none',
          }}>
            {[{ color: '#10B981', label: 'Stable Node' }, { color: '#DC2626', label: 'Critical Shortage' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', letterSpacing: '0.1em' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </main>

        {/* ── RIGHT PANEL: MCE CONTROLS ────────────────────────── */}
        <aside style={{
          width: 320,
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          background: '#0B101E', // Enforced Dark Mode Panel
          display: 'flex', flexDirection: 'column',
          padding: '24px', gap: 24,
          overflowY: 'auto',
        }}>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: '#64748B', marginBottom: 16 }}>
              MCE COMMANDER
            </div>

            {!mceActive ? (
              <>
                {!mceConfirm ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMceConfirm(true)}
                    style={{
                      width: '100%', padding: '18px',
                      background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
                      color: '#DC2626', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.2em', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      borderRadius: 4
                    }}
                  >
                    <Zap size={16} /> ACTIVATE MCE MODE
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      border: '1px solid rgba(220,38,38,0.4)', padding: 16,
                      background: 'rgba(220,38,38,0.05)', borderRadius: 4
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#DC2626', letterSpacing: '0.15em', marginBottom: 10, fontWeight: 600 }}>
                      CONFIRM ACTIVATION
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#94A3B8', marginBottom: 16, lineHeight: 1.5 }}>
                      This will override all reserved stock and reallocate by triage priority across the Tricity network.
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={activateMce} style={{
                        flex: 1, padding: '12px 0', background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', fontWeight: 600, borderRadius: 2
                      }}>
                        CONFIRM
                      </button>
                      <button onClick={() => setMceConfirm(false)} style={{
                        flex: 1, padding: '12px 0', background: 'transparent', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', borderRadius: 2
                      }}>
                        CANCEL
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                animate={{ borderColor: ['rgba(220,38,38,0.3)', 'rgba(220,38,38,0.8)', 'rgba(220,38,38,0.3)'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  border: '1px solid rgba(220,38,38,0.3)', padding: 18,
                  background: 'rgba(220,38,38,0.1)', borderRadius: 4
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#DC2626', letterSpacing: '0.15em', animation: 'blink 1.5s ease-in-out infinite' }}>
                    ⬤ MCE ACTIVE
                  </span>
                  <button onClick={() => setMceActive(false)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 10, color: '#94A3B8', letterSpacing: '0.1em',
                    borderBottom: '1px solid currentColor', paddingBottom: 2
                  }}>
                    DEACTIVATE
                  </button>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: '#CBD5E1', lineHeight: 1.6 }}>
                  Disaster Orchestrator running. City inventory pooled. Triage-priority allocation active.
                </div>
              </motion.div>
            )}
          </div>

          {/* Hospital triage priority */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: '#64748B', marginBottom: 16 }}>
              TRIAGE PRIORITY
            </div>
            {HOSPITALS.sort((a,b) => b.priority - a.priority).map(h => (
              <div key={h.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: '#F8FAFC' }}>{h.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#64748B', marginTop: 4 }}>{h.zone}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700,
                  color: h.priority >= 8 ? '#DC2626' : h.priority >= 6 ? '#F59E0B' : '#94A3B8',
                }}>
                  {h.priority}
                </div>
              </div>
            ))}
          </div>

          {/* Donor blast */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: '#64748B', marginBottom: 16 }}>
              EMERGENCY DONOR BLAST
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {['O-','O+','B-','AB-'].map(t => (
                <button key={t} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 2,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94A3B8', fontFamily: 'var(--font-mono)', fontSize: 10, cursor: 'pointer',
                  transition: 'all 0.2s ease', 
                }}>
                  {t}
                </button>
              ))}
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 4,
                background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
                color: '#DC2626', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.2em', cursor: 'pointer',
              }}>
              BLAST PROXIMITY DONORS
            </motion.button>
          </div>
        </aside>

      </div>
    </div>
  );
}