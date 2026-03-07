import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, QrCode, Printer, ShieldCheck, 
  Activity, Search, Filter, Plus, ArrowRight 
} from 'lucide-react';

// --- MOCK INVENTORY DATA ---
const INITIAL_INVENTORY = [
  { id: 'UNIT-883A', type: 'O-', added: 'Today, 08:14 AM', expires: '2026-04-12', status: 'VERIFIED' },
  { id: 'UNIT-884B', type: 'A+', added: 'Today, 09:22 AM', expires: '2026-04-13', status: 'VERIFIED' },
  { id: 'UNIT-885C', type: 'B-', added: 'Today, 10:05 AM', expires: '2026-04-14', status: 'QUARANTINE' },
  { id: 'UNIT-886D', type: 'O+', added: 'Yesterday, 14:30 PM', expires: '2026-04-10', status: 'VERIFIED' },
  { id: 'UNIT-887E', type: 'AB+', added: 'Yesterday, 16:45 PM', expires: '2026-04-11', status: 'DISPATCHED' },
];

export default function BloodBankDashboard() {
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeLabel, setActiveLabel] = useState<any | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState('O-');
  const [donorId, setDonorId] = useState('');

  // 1. Generate the Label
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setActiveLabel(null);

    // Simulate cryptographic serialization delay
    setTimeout(() => {
      const newId = `UNIT-${Math.floor(Math.random() * 9000 + 1000)}X`;
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 35); // Blood expires in 35 days

      setActiveLabel({
        id: newId,
        type: selectedType,
        donor: donorId || `ANON-${Math.floor(Math.random() * 9999)}`,
        expires: expDate.toISOString().split('T')[0],
        hash: `SHA256:${Math.random().toString(36).substring(2, 15).toUpperCase()}`
      });
      setIsGenerating(false);
    }, 1200);
  };

  // 2. Print and Log to Inventory
  const handlePrintAndLog = () => {
    if (!activeLabel) return;
    
    const newItem = {
      id: activeLabel.id,
      type: activeLabel.type,
      added: 'Just Now',
      expires: activeLabel.expires,
      status: 'VERIFIED'
    };

    setInventory([newItem, ...inventory]);
    setActiveLabel(null);
    setDonorId('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', fontFamily: 'var(--font-body)', paddingBottom: 80, color: 'var(--text-1)' }}>
      
      {/* --- HEADER --- */}
      <header style={{ 
        background: 'var(--bg-card)', borderBottom: '2px solid var(--text-1)', 
        padding: '16px 32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', 
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 40, boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.05em', textTransform: 'uppercase', margin: 0 }}>
            Blood Bank Command
          </h1>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
            Inventory & Serialization Engine
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={16} color="var(--green)" />
            <span style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-2)' }}>Ledger Synced</span>
          </div>
          <div style={{ height: 24, width: 1, background: 'var(--bg-border)' }} />
          <div style={{ 
            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', 
            color: 'var(--text-1)', background: 'var(--bg-subtle)', border: '1px solid var(--bg-border)', padding: '8px 16px' 
          }}>
            Total Verified Units: {inventory.filter(i => i.status === 'VERIFIED').length}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '32px', display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        
        {/* ─── COLUMN 1: INTAKE FORM ─── */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={14} color="var(--red)" /> Intake Registration
            </h2>
            
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.1em' }}>Blood Type Collected</label>
                <select 
                  value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
                  style={{ width: '100%', padding: 12, border: '1px solid var(--bg-border)', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', outline: 'none', background: 'var(--bg-subtle)' }}
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '0.1em' }}>Donor ID (Optional)</label>
                <input 
                  type="text" placeholder="Scan or enter ID..." 
                  value={donorId} onChange={(e) => setDonorId(e.target.value)}
                  style={{ width: '100%', padding: 12, border: '1px solid var(--bg-border)', fontSize: 12, fontFamily: 'var(--font-mono)', outline: 'none' }} 
                />
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--bg-border)' }}>
                <button 
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: 16, background: 'var(--text-1)', color: 'var(--bg-card)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', 
                    letterSpacing: '0.2em', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: isGenerating ? 0.5 : 1
                  }}
                >
                  {isGenerating ? <><Activity size={14} style={{ animation: 'spin 1s linear infinite' }} /> Serializing...</> : <><QrCode size={14} /> Generate Unit Tag</>}
                </button>
              </div>
            </form>
          </div>

          {/* Micro Stats */}
          <div style={{ background: 'var(--red-light)', border: '1px solid var(--red-border)', padding: 20 }}>
            <h3 style={{ fontSize: 9, fontWeight: 900, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Cold Chain Alert</h3>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', margin: 0 }}>O- inventory is below optimal threshold. Prioritize intake.</p>
          </div>
        </div>

        {/* ─── COLUMN 2: QR LABEL PREVIEW ─── */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 16 }}>Thermal Label Preview</h2>
          
          <div style={{ 
            flex: 1, background: 'var(--bg-border)', border: '2px dashed var(--bg-border-2)', borderRadius: 4, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', overflow: 'hidden' 
          }}>
            <AnimatePresence mode="wait">
              {activeLabel ? (
                <motion.div 
                  key="label"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  style={{ background: 'var(--bg-card)', width: '100%', maxWidth: 350, border: '1px solid var(--bg-border-2)', boxShadow: 'var(--shadow-lg)', padding: 24, position: 'relative' }}
                >
                  {/* Label Header */}
                  <div style={{ borderBottom: '4px solid var(--text-1)', paddingBottom: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', margin: 0 }}>Global Unit ID</p>
                      <p style={{ fontSize: 24, fontFamily: 'var(--font-mono)', fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.05em', margin: 0 }}>{activeLabel.id}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', margin: 0 }}>Expiry Date</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: 'var(--red)', margin: 0 }}>{activeLabel.expires}</p>
                    </div>
                  </div>

                  {/* Label Body */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', margin: '0 0 4px 0' }}>Blood Type</p>
                      <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--text-1)', letterSpacing: '-0.05em', lineHeight: 1 }}>{activeLabel.type}</div>
                    </div>
                    <div style={{ background: 'var(--bg-card)', padding: 8, border: '1px solid var(--bg-border)' }}>
                      <QrCode values={JSON.stringify(activeLabel)} size={96} />
                    </div>
                  </div>

                  {/* Label Footer */}
                  <div style={{ background: 'var(--bg-subtle)', padding: 12, border: '1px solid var(--bg-border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <span style={{ color: 'var(--text-3)' }}>Donor Ref:</span>
                      <span style={{ color: 'var(--text-1)' }}>{activeLabel.donor}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <span style={{ color: 'var(--text-3)' }}>Crypto Hash:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{activeLabel.hash}</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="empty" style={{ textAlign: 'center', color: 'var(--text-3)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <QrCode size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                  <p style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Awaiting Serialization</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div style={{ marginTop: 24 }}>
            <button 
              onClick={handlePrintAndLog}
              disabled={!activeLabel}
              style={{
                width: '100%', padding: 16, background: 'var(--green)', color: 'var(--bg-card)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em',
                border: 'none', cursor: !activeLabel ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                opacity: !activeLabel ? 0.5 : 1, boxShadow: activeLabel ? '0 10px 20px rgba(5,150,105,0.2)' : 'none'
              }}
            >
              <Printer size={14} /> Print Label & Commit to Ledger <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ─── COLUMN 3: MASTER INVENTORY GRID ─── */}
        <div style={{ flex: '2 1 450px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <h2 style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.3em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={14} /> Master Inventory Grid
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: 8, border: '1px solid var(--bg-border)', background: 'var(--bg-card)', cursor: 'pointer' }}><Search size={12} color="var(--text-2)" /></button>
              <button style={{ padding: 8, border: '1px solid var(--bg-border)', background: 'var(--bg-card)', cursor: 'pointer' }}><Filter size={12} color="var(--text-2)" /></button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--bg-border)', boxShadow: 'var(--shadow-sm)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{ display: 'flex', padding: 16, borderBottom: '2px solid var(--text-1)', background: 'var(--bg-subtle)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)' }}>
              <div style={{ flex: 3 }}>Unit ID</div>
              <div style={{ flex: 2 }}>Type</div>
              <div style={{ flex: 4 }}>Logged / Expiry</div>
              <div style={{ flex: 3, textAlign: 'right' }}>Status</div>
            </div>
            
            {/* Table Body */}
            <div style={{ overflowY: 'auto', flex: 1, maxHeight: 600 }}>
              <AnimatePresence>
                {inventory.map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    style={{ display: 'flex', alignItems: 'center', padding: 16, borderBottom: '1px solid var(--bg-border)', transition: 'background 0.2s' }}
                  >
                    <div style={{ flex: 3, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>{item.id}</div>
                    <div style={{ flex: 2 }}>
                      <span style={{ 
                        padding: '4px 8px', fontSize: 12, fontWeight: 900, border: '1px solid',
                        borderColor: item.type === 'O-' ? 'var(--red-border)' : 'var(--bg-border)',
                        color: item.type === 'O-' ? 'var(--red)' : 'var(--text-2)',
                        background: item.type === 'O-' ? 'var(--red-light)' : 'var(--bg-card)'
                      }}>
                        {item.type}
                      </span>
                    </div>
                    <div style={{ flex: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)' }}>{item.added}</span>
                      <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Exp: {item.expires}</span>
                    </div>
                    <div style={{ flex: 3, textAlign: 'right' }}>
                      <span style={{ 
                        display: 'inline-block', padding: '4px 8px', fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid',
                        background: item.status === 'VERIFIED' ? 'var(--green-light)' : item.status === 'QUARANTINE' ? 'var(--amber-light)' : 'var(--bg-subtle)',
                        color: item.status === 'VERIFIED' ? 'var(--green)' : item.status === 'QUARANTINE' ? 'var(--amber)' : 'var(--text-3)',
                        borderColor: item.status === 'VERIFIED' ? 'var(--green-border)' : item.status === 'QUARANTINE' ? 'var(--amber-border)' : 'var(--bg-border)'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}