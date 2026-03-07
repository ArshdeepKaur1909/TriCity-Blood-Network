import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  MapContainer, TileLayer, CircleMarker,
  Popup, Polyline, useMap,
} from 'react-leaflet';
import L from 'leaflet';

/* ─── TYPES ─────────────────────────────────────────────────────────────── */
export type MapPhase = 'IDLE' | 'SCANNING' | 'MATCHED' | 'DISPATCHED';

interface Node { id: string; name: string; zone: string; coords: [number, number]; }
interface Props { phase: MapPhase; requestorName?: string; supplierName?: string; }

/* ─── DYNAMIC DATABASE COORDINATES ──────────────────────────────────────── */
const CENTER: [number, number] = [30.720, 76.760];

const NODES: Node[] = [
  { id: '1', name: "GMCH-32 (Govt. Medical College)", zone: "Sector 32, Chandigarh", coords: [30.704, 76.776] },
  { id: '2', name: "PGIMER", zone: "Sector 12, Chandigarh", coords: [30.767, 76.779] },
  { id: '3', name: "Rotary Blood Bank Society", zone: "Sector 37, Chandigarh", coords: [30.735, 76.744] },
  { id: '4', name: "Lions Club Charity Blood Centre", zone: "Sector 18, Chandigarh", coords: [30.729, 76.790] },
  { id: '5', name: "Fortis Hospital Mohali", zone: "Sector 62, Mohali", coords: [30.690, 76.733] },
  { id: '6', name: "Max Super Speciality Hospital", zone: "Phase 6, Mohali", coords: [30.732, 76.711] },
  { id: '7', name: "Sri Guru Harkrishan Sahib (Sohana Hospital)", zone: "Sector 77, Mohali", coords: [30.685, 76.715] },
  { id: '8', name: "Civil Hospital Panchkula", zone: "Sector 6, Panchkula", coords: [30.702, 76.853] },
  { id: '9', name: "Alchemist Hospital", zone: "Sector 21, Panchkula", coords: [30.678, 76.852] },
  { id: '10', name: "Command Hospital (Western Command)", zone: "Chandimandir, Panchkula", coords: [30.725, 76.883] }
];

/* ─── HELPER ───────────────────── */
function MapCapture({ onReady }: { onReady: (m: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

/* ─── OVERLAYS ──────────────────────────────────────────────────────────── */
function RadarOverlay({ map, coords, active }: { map: L.Map; coords: [number, number]; active: boolean }) {
  const [px, setPx] = useState<{ x: number; y: number } | null>(null);
  const SIZE = 260;

  const update = useCallback(() => {
    const p = map.latLngToContainerPoint(L.latLng(coords[0], coords[1]));
    setPx({ x: p.x, y: p.y });
  }, [map, coords]);

  useEffect(() => {
    update();
    map.on('move zoom moveend zoomend', update);
    return () => { map.off('move zoom moveend zoomend', update); };
  }, [map, update]);

  if (!px || !active) return null;

  return (
    <div style={{ position: 'absolute', left: px.x - SIZE / 2, top:  px.y - SIZE / 2, width: SIZE, height: SIZE, pointerEvents: 'none', zIndex: 600 }}>
      {[0.3, 0.55, 0.78, 1.0].map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width:  SIZE * s, height: SIZE * s, marginLeft: -(SIZE * s) / 2, marginTop: -(SIZE * s) / 2, border: '1px solid rgba(220,38,38,0.22)', borderRadius: '50%', animation: `pulse-ring 2.4s ease-out ${i * 0.6}s infinite` }} />
      ))}
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: SIZE, height: SIZE, marginLeft: -SIZE / 2, marginTop: -SIZE / 2, borderRadius: '50%', background: 'conic-gradient(transparent 0deg, transparent 255deg, rgba(220,38,38,0.05) 290deg, rgba(220,38,38,0.28) 360deg)', animation: 'radar-rotate 2.2s linear infinite' }} />
      {[ { left: '50%', top: '20%', width: 1, height: '60%' }, { left: '20%', top: '50%', width: '60%', height: 1 } ].map((s, i) => (
        <div key={i} style={{ position: 'absolute', background: 'rgba(220,38,38,0.12)', left: s.left, top: s.top, width: s.width, height: s.height }} />
      ))}
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: '50%', background: '#DC2626', animation: 'courier-glow 1.4s ease-out infinite' }} />
    </div>
  );
}

function SupplierGlow({ map, coords, active }: { map: L.Map; coords: [number, number]; active: boolean }) {
  const [px, setPx] = useState<{ x: number; y: number } | null>(null);

  const update = useCallback(() => {
    const p = map.latLngToContainerPoint(L.latLng(coords[0], coords[1]));
    setPx({ x: p.x, y: p.y });
  }, [map, coords]);

  useEffect(() => {
    update();
    map.on('move zoom moveend zoomend', update);
    return () => { map.off('move zoom moveend zoomend', update); };
  }, [map, update]);

  if (!px || !active) return null;

  return (
    <div style={{ position: 'absolute', left: px.x, top: px.y, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 700 }}>
      {[32, 52, 72].map((size, i) => (
        <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, border: `${i === 0 ? 2 : 1}px solid rgba(5,150,105,${0.5 - i * 0.13})`, borderRadius: '50%', animation: `pulse-ring ${1.6 + i * 0.3}s ease-out ${i * 0.25}s infinite` }} />
      ))}
    </div>
  );
}

function CourierDot({ map, path, active }: { map: L.Map; path: [number,number][] | null; active: boolean }) {
  const [px, setPx] = useState<{ x: number; y: number } | null>(null);
  const rafRef   = useRef<number>(0);
  const startRef = useRef<number>(0);
  const DURATION = 13000;

  useEffect(() => {
    if (!active || !path || path.length < 2) { setPx(null); return; }

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
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 22, height: 22, marginLeft: -11, marginTop: -11, borderRadius: '50%', background: 'rgba(220,38,38,0.18)', animation: 'ping 1.4s ease-out infinite' }} />
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#DC2626', border: '2.5px solid #fff', boxShadow: '0 0 8px rgba(220,38,38,0.7)', animation: 'courier-glow 1.4s ease-out infinite' }} />
    </div>
  );
}

/* ─── MAIN EXPORT ───────────────────────────────────────────────────────── */
export default function EmergencyMap({ phase, requestorName, supplierName }: Props) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [routePath,   setRoutePath]   = useState<[number,number][] | null>(null);
  const [ready,       setReady]       = useState(false);

  // Dynamically find the nodes based on names, fallback to center if not found
  const requester = NODES.find(h => h.name === requestorName) || NODES[0];
  const supplier  = NODES.find(h => h.name === supplierName) || NODES[1];

  // Dynamic Labels
  const getPhaseConfig = () => {
    switch(phase) {
      case 'IDLE': return { text: 'Network Stable', color: '#64748B', dot: false };
      case 'SCANNING': return { text: 'Scanning City Nodes…', color: '#DC2626', dot: true };
      case 'MATCHED': return { text: `Match Locked — ${supplier.name}`, color: '#059669', dot: false };
      case 'DISPATCHED': return { text: `Courier Live — ${supplier.name} → ${requester.name}`, color: '#DC2626', dot: true };
      default: return { text: '', color: '', dot: false };
    }
  };
  const { text, color, dot } = getPhaseConfig();

  useEffect(() => {
    if (mapInstance) {
      const resizeTimer = setTimeout(() => mapInstance.invalidateSize(), 400);
      return () => clearTimeout(resizeTimer);
    }
  }, [mapInstance, phase]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'DISPATCHED') { setRoutePath(null); return; }
    
    const fallbackPath: [number, number][] = [ supplier.coords, requester.coords ];

    fetch(`https://router.project-osrm.org/route/v1/driving/${supplier.coords[1]},${supplier.coords[0]};${requester.coords[1]},${requester.coords[0]}?overview=full&geometries=geojson`)
      .then(r => r.json())
      .then(d => {
        if (d.routes?.[0]) {
          setRoutePath(d.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number,number]));
        } else {
          setRoutePath(fallbackPath);
        }
      })
      .catch(() => setRoutePath(fallbackPath));
  }, [phase, supplier, requester]);

  const nodeStyle = (h: Node) => {
    if (phase === 'MATCHED' || phase === 'DISPATCHED') {
      if (h.name === supplier.name)  return { fill: '#059669', stroke: 'rgba(5,150,105,0.4)',  r: 10 };
      if (h.name === requester.name) return { fill: '#DC2626', stroke: 'rgba(220,38,38,0.4)', r: 10 };
    }
    if (phase === 'SCANNING') return { fill: '#1E3A5F', stroke: 'rgba(220,38,38,0.35)', r: 7 };
    return { fill: '#334155', stroke: 'rgba(100,116,139,0.25)', r: 7 };
  };

  if (!ready) {
    return (
      <div style={{ width: '100%', height: '100%', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#334155', letterSpacing: '0.2em' }}>INITIALIZING MAP ENGINE…</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer center={CENTER} zoom={12} style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapCapture onReady={setMapInstance} />

        {NODES.map(h => {
          const { fill, stroke, r } = nodeStyle(h);
          return (
            <CircleMarker key={h.id} center={h.coords} radius={r} pathOptions={{ fillColor: fill, color: stroke, weight: 7, fillOpacity: 1 }}>
              <Popup>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{h.name}</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{h.zone}</div>
              </Popup>
            </CircleMarker>
          );
        })}

        {phase === 'MATCHED' && (
          <Polyline positions={[supplier.coords, requester.coords]} pathOptions={{ color: '#059669', weight: 2, dashArray: '8 5', opacity: 0.9 }} />
        )}

        {phase === 'DISPATCHED' && routePath && (
          <>
            <Polyline positions={routePath} pathOptions={{ color: 'rgba(220,38,38,0.12)', weight: 12 }} />
            <Polyline positions={routePath} pathOptions={{ color: '#DC2626', weight: 3, dashArray: '12 7', opacity: 1 }} />
          </>
        )}
      </MapContainer>

      {mapInstance && (
        <>
          <RadarOverlay map={mapInstance} coords={requester.coords} active={phase === 'SCANNING'} />
          <SupplierGlow map={mapInstance} coords={supplier.coords} active={phase === 'MATCHED' || phase === 'DISPATCHED'} />
          <CourierDot map={mapInstance} path={routePath} active={phase === 'DISPATCHED'} />
        </>
      )}

      <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 800, background: 'rgba(10,15,30,0.88)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 13px', borderRadius: 5, display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none' }}>
        {dot && <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, animation: 'blink 0.9s ease-in-out infinite' }} />}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, color, letterSpacing: '0.14em' }}>{text}</span>
      </div>

      <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 800, background: 'rgba(10,15,30,0.88)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 12px', borderRadius: 5, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {(phase === 'MATCHED' || phase === 'DISPATCHED') ? (
          <>
            <LegRow color="#059669" label={`SUPPLIER: ${supplier.name}`}  />
            <LegRow color="#DC2626" label={`REQUESTOR: ${requester.name}`} />
          </>
        ) : (
          <LegRow color="#64748B" label={`${NODES.length} NODES ACTIVE`} />
        )}
      </div>
    </div>
  );
}

const LegRow = ({ color, label }: { color: string; label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color, letterSpacing: '0.1em' }}>{label}</span>
  </div>
);