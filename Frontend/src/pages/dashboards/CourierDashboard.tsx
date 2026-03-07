import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Package, CheckCircle2, AlertTriangle, Shield, Clock } from 'lucide-react';

// --- MOCK STATE ---
type RunState = 'AWAITING' | 'ACCEPTED' | 'EN_ROUTE' | 'DELIVERED';

const DISPATCH_DATA = {
  id: 'REQ-8892',
  bloodType: 'O-',
  units: 4,
  urgency: 'CODE RED',
  pickup: { name: 'PGIMER Sec-12', address: 'Blood Bank, Gate 3', coords: [30.7673, 76.7774] as [number, number] },
  dropoff: { name: 'GMCH-32', address: 'Emergency Trauma Center', coords: [30.7046, 76.7749] as [number, number] },
};

// Hardcoded route down Madhya Marg -> Dakshin Marg for the demo
const ROAD_PATH: [number, number][] = [
  [30.7673, 76.7774], [30.7585, 76.7820], [30.7430, 76.7905], 
  [30.7285, 76.7820], [30.7150, 76.7785], [30.7046, 76.7749]
];

// --- HELPER: Live GPS Dot ---
function LiveGPSDot({ map, path, active }: { map: L.Map; path: [number,number][]; active: boolean }) {
  const [px, setPx] = useState<{ x: number; y: number } | null>(null);
  const rafRef   = useRef<number>(0);
  const startRef = useRef<number>(0);
  const DURATION = 15000; // 15 seconds to simulate the drive

  useEffect(() => {
    if (!active) { setPx(null); return; }
    startRef.current = performance.now();

    const tick = (now: number) => {
      const t   = Math.min((now - startRef.current) / DURATION, 1);
      const tot = path.length - 1;
      const raw = t * tot;
      const i   = Math.min(Math.floor(raw), tot - 1);
      const f   = raw - Math.floor(raw);
      const a   = path[i];
      const b   = path[Math.min(i + 1, tot)];
      const lat = a[0] + (b[0] - a[0]) * f;
      const lng = a[1] + (b[1] - a[1]) * f;
      const p   = map.latLngToContainerPoint(L.latLng(lat, lng));
      setPx({ x: p.x, y: p.y });
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, path, map]);

  if (!px || !active) return null;

  return (
    <div style={{ position: 'absolute', left: px.x, top: px.y, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 900 }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 30, height: 30, marginLeft: -15, marginTop: -15, borderRadius: '50%', background: 'rgba(37,99,235,0.3)', animation: 'ping 1.5s ease-out infinite' }} />
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#2563EB', border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }} />
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function CourierDashboard() {
  const [runState, setRunState] = useState<RunState>('AWAITING');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 10000);
    return () => clearInterval(timer);
  }, []);

  // Force map resize when state changes to prevent Leaflet bugs
  useEffect(() => {
    if (mapInstance) setTimeout(() => mapInstance.invalidateSize(), 300);
  }, [runState, mapInstance]);

  const handleAction = () => {
    if (runState === 'AWAITING') setRunState('ACCEPTED');
    else if (runState === 'ACCEPTED') setRunState('EN_ROUTE');
    else if (runState === 'EN_ROUTE') setRunState('DELIVERED');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030509', fontFamily: 'var(--font-body)', display: 'flex', justifyContent: 'center' }}>
      
      {/* MOBILE CONTAINER CONSTRAINTS */}
      <div style={{ 
        width: '100%', maxWidth: 480, background: '#0B101E', 
        position: 'relative', display: 'flex', flexDirection: 'column',
        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
      }}>
        
        {/* --- APP BAR --- */}
        <header style={{ 
          padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#060912', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: runState === 'DELIVERED' ? '#10B981' : runState === 'AWAITING' ? '#DC2626' : '#3B82F6', 
              animation: runState !== 'DELIVERED' ? 'blink 2s infinite' : 'none' 
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 800, color: '#F8FAFC', letterSpacing: '0.05em' }}>
              UNIT #C-104
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#64748B' }}>{time}</span>
        </header>

        {/* --- MAIN BODY --- */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Status Banner */}
          <motion.div layout style={{ 
              background: '#111827', border: '1px solid rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, 
              display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
            <div style={{ 
              background: runState === 'AWAITING' ? 'rgba(220,38,38,0.1)' : runState === 'DELIVERED' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', 
              padding: 12, borderRadius: '50%' 
            }}>
              {runState === 'AWAITING' ? <AlertTriangle color="#F87171" size={24} /> : 
               runState === 'DELIVERED' ? <CheckCircle2 color="#34D399" size={24} /> : 
               <Navigation color="#60A5FA" size={24} />}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', marginBottom: 2 }}>Current Objective</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: runState === 'AWAITING' ? '#F87171' : runState === 'DELIVERED' ? '#34D399' : '#60A5FA' }}>
                {runState === 'AWAITING' && 'NEW DISPATCH ALERT'}
                {runState === 'ACCEPTED' && 'PROCEED TO PICKUP'}
                {runState === 'EN_ROUTE' && 'DELIVER TO DESTINATION'}
                {runState === 'DELIVERED' && 'RUN COMPLETED'}
              </div>
            </div>
          </motion.div>

          {/* Payload Details */}
          <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 20, borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em' }}>PAYLOAD</span>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#F8FAFC', marginTop: 4 }}>{DISPATCH_DATA.bloodType} <span style={{ fontSize: 16, color: '#64748B' }}>×{DISPATCH_DATA.units}u</span></div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em' }}>URGENCY</span>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#F87171', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', padding: '4px 8px', borderRadius: 4, marginTop: 4 }}>
                  {DISPATCH_DATA.urgency}
                </div>
              </div>
            </div>

            {/* Routing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 15, top: 24, bottom: 24, width: 2, background: 'rgba(255,255,255,0.08)' }} />
              
              <div style={{ display: 'flex', gap: 16, opacity: runState === 'DELIVERED' ? 0.4 : 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E293B', border: '2px solid #3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <Package size={14} color="#60A5FA" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 2 }}>PICKUP</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#F8FAFC' }}>{DISPATCH_DATA.pickup.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginTop: 2 }}>{DISPATCH_DATA.pickup.address}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, opacity: runState === 'AWAITING' || runState === 'DELIVERED' ? 0.4 : 1 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E293B', border: '2px solid #DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                  <MapPin size={14} color="#F87171" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', marginBottom: 2 }}>DROP-OFF</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#F8FAFC' }}>{DISPATCH_DATA.dropoff.name}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#64748B', marginTop: 2 }}>{DISPATCH_DATA.dropoff.address}</div>
                </div>
              </div>
            </div>
          </div>

          {/* THE LIVE MAP */}
          <div style={{ 
            flex: 1, minHeight: 220, borderRadius: 12, background: '#1E293B', 
            border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative',
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.5)'
          }}>
            {(runState === 'ACCEPTED' || runState === 'EN_ROUTE') ? (
              <div style={{ position: 'absolute', inset: 0 }}>
                <MapContainer center={[30.735, 76.776]} zoom={12} style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl={false} ref={setMapInstance}>
                  
                  {/* GOOGLE MAPS TILE LAYER (NO LOGO) */}
                  <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
                  
                  {/* Nodes */}
                  <CircleMarker center={DISPATCH_DATA.pickup.coords} radius={8} pathOptions={{ fillColor: '#3B82F6', color: '#1E3A8A', weight: 3, fillOpacity: 1 }} />
                  <CircleMarker center={DISPATCH_DATA.dropoff.coords} radius={8} pathOptions={{ fillColor: '#DC2626', color: '#7F1D1D', weight: 3, fillOpacity: 1 }} />
                  
                  {/* Route Line */}
                  <Polyline positions={ROAD_PATH} pathOptions={{ color: '#2563EB', weight: 5, dashArray: '10 10', opacity: 0.9 }} />
                </MapContainer>

                {/* Animated GPS Dot overlay injected over the Map */}
                {mapInstance && <LiveGPSDot map={mapInstance} path={ROAD_PATH} active={runState === 'EN_ROUTE'} />}

                <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 800, background: 'rgba(11,16,30,0.9)', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 8 }}>
                   <Clock size={14} color="#60A5FA" />
                   <div>
                     <div style={{ fontSize: 14, fontWeight: 900, color: '#F8FAFC', lineHeight: 1 }}>8 min</div>
                     <div style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>ETA</div>
                   </div>
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B101E', backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.2em' }}>
                  GPS OFFLINE
                </span>
              </div>
            )}
          </div>
        </main>

        {/* --- BOTTOM ACTION BAR --- */}
        <footer style={{ padding: '20px 24px', background: '#060912', borderTop: '1px solid rgba(255,255,255,0.05)', zIndex: 10 }}>
          <AnimatePresence mode="wait">
            {runState !== 'DELIVERED' ? (
              <motion.button
                key={runState}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleAction}
                style={{
                  width: '100%', padding: '20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: runState === 'AWAITING' ? '#DC2626' : runState === 'ACCEPTED' ? '#2563EB' : '#10B981',
                  color: '#fff', fontSize: 14, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                  boxShadow: `0 10px 30px ${runState === 'AWAITING' ? 'rgba(220,38,38,0.3)' : runState === 'ACCEPTED' ? 'rgba(37,99,235,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  transition: 'background 0.3s'
                }}
              >
                {runState === 'AWAITING' && 'ACCEPT DISPATCH'}
                {runState === 'ACCEPTED' && 'CONFIRM PICKUP'}
                {runState === 'EN_ROUTE' && 'CONFIRM DROP-OFF'}
              </motion.button>
            ) : (
              <motion.div 
                key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '10px 0' }}
              >
                <Shield size={32} color="#10B981" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981', marginBottom: 4 }}>CHAIN OF CUSTODY SECURED</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: '#64748B', letterSpacing: '0.1em' }}>Awaiting next assignment...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </footer>

      </div>
    </div>
  );
}